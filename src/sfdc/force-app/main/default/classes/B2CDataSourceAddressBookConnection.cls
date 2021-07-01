/**
 * @author Jordane Bachelet
 * @date May 11th, 2021
 *
 * @description This class is used to retrieve B2C Commerce customer address-book
 * addresses as externalObjects via B2C Commerce REST APIs.
*/
global with sharing class B2CDataSourceAddressBookConnection extends DataSource.Connection {
    private List<B2C_Integration_Field_Mappings__mdt> retrievalFieldMappings;
    private List<B2C_Integration_Field_Mappings__mdt> publishingFieldMappings;

    private final String tableName = 'B2C_CustomerAddress';
    private final String tableLabelSingular = 'B2C Customer Address';
    private final String tableLabelPlural = 'B2C Customer Addresses';
    private final String tableDescription = '... represents the addresses found in the personal address book ' +
        'of the represented B2C Commerce Customer';

    private final String indirectLookupColumn = 'CustomerId';
    private final String indirectLookupColumnLabel = 'Customer';
    private final String indirectLookupColumnDescription = 'Represents the B2C Commerce Customer';
    private final String indirectLookupTargetField = 'B2C_Customer_ID__c';
    private String indirectLookupTargetObject;

    /**
     * @constructor
     * @description constructor designed to initialize the class instance
     * @param connectionParams {Datasource.ConnectionParams} Represents the connection parameters used to drive
     * the retrieval or publishing of B2C Commerce customer addresses.
     */
    global B2CDataSourceAddressBookConnection(DataSource.ConnectionParams connectionParams) {
        this.retrievalFieldMappings = B2CMetaFieldMappings.getFieldMappingsForRetrieval(this.tableName + '__x');
        this.publishingFieldMappings = B2CMetaFieldMappings.getFieldMappingsForPublishing(this.tableName + '__x');
        this.indirectLookupTargetObject = B2CConfigurationManager.getDefaultAccountContactModel() ==
            B2CConstant.ACCOUNTCONTACTMODEL_PERSON ? 'Account' : 'Contact';
    }

    /**
     * @description This method defines the Schema of External Object based on configured mapping fields
     *
     * @return {List<DataSource.Table>} tables
     * */
    override global List<DataSource.Table> sync() {
        return B2CDataSourceHelper.generateSyncTables(
            this.tableName,
            this.tableLabelSingular,
            this.tableLabelPlural,
            this.tableDescription,
            this.indirectLookupColumn,
            this.indirectLookupColumnLabel,
            this.indirectLookupColumnDescription,
            this.indirectLookupTargetObject,
            this.indirectLookupTargetField,
            this.retrievalFieldMappings
        );
    }

    /**
     * @description This method is called everytime when SOQL is issued against external Object
     * or while using list view or viewing detail page.
     * @param context {DataSource.QueryContext} The context of the performed query against the external object
     *
     * @return {DataSource.TableResult} The found addresses based on the query context
     * */
    override global DataSource.TableResult query(DataSource.QueryContext context) {
        DataSource.Filter filter = context.tableSelection.filter;
        String customerId;
        String addressId;

        // Return an empty list in case no filter is applied
        // As the addresses are always tied to a customer record
        if (filter == null) {
            return DataSource.TableResult.get(
                true, null, context.tableSelection.tableSelected, new List<Map<String, Object>>()
            );
        }

        if (filter.columnName == 'ExternalId') { // Are we filtering on the externalId?
            // If no customer Id is found, then we are rendering the address detail page
            // Let's get the external Id and extract the customer Id and the address Id
            Map<String, String> parts = this.splitExternalId((String)filter.columnValue);
            customerId = parts.get('customerId');
            addressId = EncodingUtil.urlEncode(parts.get('addressId'), 'UTF-8');
        } else if (filter.columnName == this.indirectLookupColumn) { // Or filtering on the customerId?
            customerId = (String)filter.columnValue;
        } else {
            // Search the customer Id from the sub filters of the query
            // This is provided when we render the list of addresses from the related list UI
            for (DataSource.Filter subfilter : filter.subfilters) {
                if (subfilter.columnName == this.indirectLookupColumn) {
                    customerId = (String)subfilter.columnValue;
                }
            }
        }

        return DataSource.TableResult.get(
            true, null, context.tableSelection.tableSelected,
            DataSource.QueryUtils.process(context, getData(customerId, addressId))
        );
    }

    /**
     * @description Update the given rows within the B2C Commerce instance
     * @param context {DataSource.UpsertContext} The upsert context to use to update the rows
     *
     * @return {List<DataSource.UpsertResult>} The results of the updates
     */
    override global List<DataSource.UpsertResult> upsertRows(DataSource.UpsertContext context) {
        List<DataSource.UpsertResult> results = new List<DataSource.UpsertResult>();

        for (Map<String, Object> row : context.rows) {
            String externalId = (String)row.get('ExternalId');
            Map<String, String> parts = this.splitExternalId(externalId);
            String customerId = parts.get('customerId');
            String addressId = parts.get('addressId');

            // Attempt to update the address details
            Boolean result = updateData(row, customerId, addressId);
            // Output the update results to the user
            if (result) {
                results.add(DataSource.UpsertResult.success(externalId));
            } else {
                results.add(DataSource.UpsertResult.failure(
                    externalId, 'Failed to update the address to B2C Commerce.'));
            }

        }

        return results;
    }

    /**
     * @description Splits the given external ID to retrieve the customer No and the address ID from it
     * @param externalId {String} The external Id to split
     *
     * @return {Map<String, String>} The map that contains the customer No and address ID
     */
    private Map<String, String> splitExternalId(String externalId) {
        Map<String, String> result = new Map<String, String>();
        List<String> parts = externalId.split('__');
        result.put('customerId', parts.get(0));
        result.put('addressId', parts.get(1));

        return result;
    }

    /**
     * @description Updates the address within B2C Commerce based on the given row
     * @param row {Map<String, Object>} The row that contains the fields updated
     * @param customerId {String} The B2C Commerce customerId of the customer to which to update the address
     * @param addressId {String} The customer address to update
     *
     * @return {Boolean} True if the update succeed, or false otherwise
     */
    private Boolean updateData(Map<String, Object> row, String customerId, String addressId) {
        if (String.isEmpty(customerId)) {
            return false;
        }

        // Get the contact that matches the given customer No
        // If no contact is found, abort and return an empty list
        Contact contact = B2CDataSourceHelper.getContactByCustomerId(customerId);
        if (contact == null) {
            return false;
        }

        // Build the address object to send to the B2C Commerce instance, based on the field mappings
        Map<String, Object> addressData = new Map<String, Object>();
        for (B2C_Integration_Field_Mappings__mdt fieldMapping : this.publishingFieldMappings) {
            addressData.put(
                fieldMapping.B2C_Commerce_OCAPI_Attribute__c,
                row.get(fieldMapping.Service_Cloud_Attribute__c)
            );
        }

        // Performs the patch request
        HttpRequest req = B2CHttpRequestHelper.getCustomerProfileAddressPatchRequest(
            contact.B2C_CustomerList__r.API_Url__c,
            B2CAuthTokenHelper.getB2CAuthTokenByClientIDValue(contact.B2C_CustomerList__r.B2C_Client_ID__c, true),
            contact.B2C_CustomerList__r.OCAPI_Version_No__c,
            contact.B2C_CustomerList__r.Name,
            contact.B2C_Customer_No__c,
            addressId,
            JSON.serialize(addressData, true)
        );
        Http https = new Http();
        HttpResponse res = https.send(req);
        return res.getStatusCode() == 200; // Consider the update as a success if the status code is 200

    }

    /**
     * @description Performs the REST API call against the B2C Commerce instance to get the customer
     * addresses records based on the given customer number and address ID
     *
     * @param customerId {String} The customer number of the customer from which to get the addresses
     * @param addressId {String} (Optional) The address Id to use while retrieve a specific
     * address (in case of detail page)
     * @return {List<Map<String,Object>>} Returns a collection of maps representing the address data
     * */
    private List<Map<String,Object>> getData(String customerId, String addressId) {
        List<Map<String, Object>> addresses =  new List<Map<String, Object>>();
        if (String.isEmpty(customerId)) {
            return addresses;
        }

        // Get the contact that matches the given customer Id
        // If no contact is found, abort and return an empty list
        Contact contact = B2CDataSourceHelper.getContactByCustomerId(customerId);
        if (contact == null) {
            return addresses;
        }

        HttpRequest req;
        // If the address Id is provided, get the address
        // Else, get all addresses for this customer
        if (!String.isEmpty(addressId)) {
            req = B2CHttpRequestHelper.getCustomerProfileAddressRequest(
                contact.B2C_CustomerList__r.API_Url__c,
                B2CAuthTokenHelper.getB2CAuthTokenByClientIDValue(contact.B2C_CustomerList__r.B2C_Client_ID__c, true),
                contact.B2C_CustomerList__r.OCAPI_Version_No__c,
                contact.B2C_CustomerList__r.Name,
                contact.B2C_Customer_No__c,
                addressId
            );
        } else {
            req = B2CHttpRequestHelper.getCustomerProfileAddressesRequest(
                contact.B2C_CustomerList__r.API_Url__c,
                B2CAuthTokenHelper.getB2CAuthTokenByClientIDValue(contact.B2C_CustomerList__r.B2C_Client_ID__c, true),
                contact.B2C_CustomerList__r.OCAPI_Version_No__c,
                contact.B2C_CustomerList__r.Name,
                contact.B2C_Customer_No__c
            );
        }

        Http https = new Http();
        HttpResponse res = https.send(req);
        JSONParse responseParsedJSON = new JSONParse(res.getBody());

        try {
            responseParsedJSON.get('fault').get('message').getStringValue();
            // If the fault message is found, the API call failed, abort and return no addresses
            return addresses;
        } catch (JSONParse.MissingKeyException e) {
            // In case the body misses the fault, then the API call succeed
            // In this case, silently fail and continue
            System.debug(System.LoggingLevel.INFO, e.getMessage());
        }

        // If no address Id is provided, return a list of addresses
        // Else, return the address
        if (String.isEmpty(addressId)) {
            Integer count = responseParsedJSON.get('count').getIntegerValue();
            if (count > 0) {
                List<JSONParse> addressesData = responseParsedJSON.get('data').asList();
                for (JSONParse addressData : addressesData) {
                    addresses.add(mapAddress(customerId, addressData));
                }
            }
        } else {
            addresses.add(mapAddress(customerId, responseParsedJSON));
        }

        return addresses;
    }

    /**
     * @description This method maps the retrieved address from OCAPI to the core external object,
     * ready to be consumed by Salesforce Connect, based on the configured field mappings
     * @param customerId {String} The customer number of the customer from which we get the addresses
     * @param addressData {JSONParse} The parsed JSON of the address
     *
     * @return {Map<String, Object>} The address map, ready to be consumed by Salesforce Connect
     */
    private Map<String, Object> mapAddress(String customerId, JSONParse addressData) {
        Map<String, Object> address = B2CDataSourceHelper.mapFields(
            customerId, addressData, this.retrievalFieldMappings);
        String addressId = addressData.get('address_id').getStringValue();

        // Fill out the customer Id as indirect lookup
        address.put(this.indirectLookupColumn, customerId);
        // Fill out the external Id, mandatory field, with the customer Id and the address Id; we require the
        // customer no here because the address Id might not be unique across customers (this is not an UUID)
        address.put('ExternalId', customerId + '__' + addressId);
        address.put('DisplayUrl', '');

        return address;
    }
}
