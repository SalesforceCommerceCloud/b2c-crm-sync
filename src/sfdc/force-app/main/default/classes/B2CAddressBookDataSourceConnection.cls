/**
 * @author Jordane Bachelet
 * @date May 11th, 2021
 *
 * @description This class is used to retrieve B2C Commerce customer address-book
 * addresses as externalObjects via B2C Commerce REST APIs.
*/
global class B2CAddressBookDataSourceConnection extends DataSource.Connection {

    // Initialize local variables
    private DataSource.ConnectionParams connectionInfo;
    private List<B2C_Integration_Field_Mappings__mdt> retrievalFieldMappings;
    private List<B2C_Integration_Field_Mappings__mdt> publishingFieldMappings;

    private final String TABLE_NAME = 'B2C_CustomerAddress';
    private final String INDIRECT_LOOKUP_COLUMN = 'CustomerId';

    /**
     * @constructor
     * @description constructor designed to initialize the class instance
     * @param connectionParams {Datasource.ConnectionParams} Represents the connection parameters used to drive
     * the retrieval or publishing of B2C Commerce customer addresses.
     */
    global B2CAddressBookDataSourceConnection(DataSource.ConnectionParams connectionParams) {
        this.connectionInfo = connectionParams;
        this.retrievalFieldMappings = B2CMetaFieldMappings.getFieldMappingsForRetrieval(this.TABLE_NAME + '__x');
        this.publishingFieldMappings = B2CMetaFieldMappings.getFieldMappingsForPublishing(this.TABLE_NAME + '__x');
    }

    /**
     * @description Abstract Method sync() must be implemented as part of DataSource.Connection class
     * This method defines the Customer Address Schema of External Object
     *
     * @return {List<DataSource.Table>} Returns the datasource table definition used to retrieve address details
     * */
    override global List<DataSource.Table> sync() {

        // Initialize the local / output variables
        String dataDomain = B2CAddressBookDataHelper.getDataDomain();
        String targetField = B2CAddressBookDataHelper.getTargetField();
        List<DataSource.Table> tables = new List<DataSource.Table>();
        List<DataSource.Column> columns = new List<DataSource.Column>();

        // Get the fieldMappings for the customer address object
        // and add them to the columns list
        for (B2C_Integration_Field_Mappings__mdt fieldMapping : this.retrievalFieldMappings) {

            if (fieldMapping.B2C_Commerce_Attribute_Type__c == 'boolean') {
                columns.add(DataSource.Column.boolean(fieldMapping.Service_Cloud_Attribute__c));
            } else if (fieldMapping.B2C_Commerce_Attribute_Type__c == 'integer') {
                columns.add(DataSource.Column.integer(fieldMapping.Service_Cloud_Attribute__c, 10));
            } else if (fieldMapping.B2C_Commerce_Attribute_Type__c == 'number') {
                columns.add(DataSource.Column.number(fieldMapping.Service_Cloud_Attribute__c, 10, 2));
            } else { // By default treat as a string
                columns.add(DataSource.Column.text(fieldMapping.Service_Cloud_Attribute__c, 255));
            }

        }

        System.debug('--> dataDomain: ' + dataDomain);
        System.debug('--> targetField: ' + targetField);
        System.debug('--> INDIRECT_LOOKUP_COLUMN: ' + INDIRECT_LOOKUP_COLUMN);

        // Always apply the following columns:
        // - ExternalId -> Required by Salesforce Connect as unique identifier in the Core Platform
        // - Display URL -> Required by Salesforce Connect to be able to open the detail page within the external system
        // - customerId -> The indirect lookup to the Contact record
        columns.add(DataSource.Column.indirectLookup(INDIRECT_LOOKUP_COLUMN, dataDomain, targetField));
        columns.add(DataSource.Column.text('ExternalId', 255));
        columns.add(DataSource.Column.url('DisplayUrl'));

        // Create the table definition by adding to the columns and mapping to the externalID
        tables.add(DataSource.Table.get(this.TABLE_NAME, 'ExternalId', columns));
        return tables;

    }

    /**
     * @description This method is called everytime when SOQL is issued against external Object
     * or while using list view or viewing detail page.
     * @param context {DataSource.QueryContext} The context of the performed query against the external object
     *
     * @return {DataSource.TableResult} The found addresses based on the query context
     * */
    override global DataSource.TableResult query(DataSource.QueryContext context) {

        // Initialize local variables
        DataSource.Filter filter = context.tableSelection.filter;
        String customerId;
        String addressId;

        // Are we filtering on the externalId?
        if (filter.columnName == 'ExternalId') {

            // If no customer No is found, then we are rendering the address detail page
            // Let's get the external Id and extract the customer No and the address Id
            Map<String, String> parts = splitExternalId((String)filter.columnValue);
            customerId = parts.get('customerId');
            addressId = EncodingUtil.urlEncode(parts.get('addressId'), 'UTF-8');

        } else {

            // Search the customer no from the sub filters of the query
            // This is provided when we render the list of addresses from the related list UI
            for (DataSource.Filter subfilter : context.tableSelection.filter.subfilters) {
                if (subfilter.columnName == INDIRECT_LOOKUP_COLUMN) {
                    customerId = (String)subfilter.columnValue;
                }
            }

        }

        List<Map<String, Object>> rows = DataSource.QueryUtils.process(context, getData(customerId, addressId));
        return DataSource.TableResult.get(true, null, context.tableSelection.tableSelected, rows);

    }

    /**
     * @description Update the given rows within the B2C Commerce instance
     * @param context {DataSource.UpsertContext} The upsert context to use to update the rows
     *
     * @return {List<DataSource.UpsertResult>} The results of the updates
     */
    override global List<DataSource.UpsertResult> upsertRows(DataSource.UpsertContext context) {

        // Initialize local variables
        List<Map<String, Object>> rows = context.rows;
        List<DataSource.UpsertResult> results = new List<DataSource.UpsertResult>();

        // Loop over the map context
        for (Map<String, Object> row : rows) {

            // Break down the map into reference-pieces
            String externalId = (String)row.get('ExternalId');
            Map<String, String> parts = splitExternalId(externalId);

            // break-down the customerId / addressIdentifier from the externalID
            String customerId = parts.get('customerId');
            String addressId = parts.get('addressId');

            // Attempt to update the address details
            Boolean result = updateData(row, customerId, addressId);

            // Output the update results to the user
            if (result) {
                results.add(DataSource.UpsertResult.success(externalId));
            } else {
                results.add(DataSource.UpsertResult.failure(externalId, 'Failed to update the address to B2C Commerce.'));
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
        // If no customer no is provided, abort and return an empty list
        if (String.isEmpty(customerId)) {
            return false;
        }

        // Get the contact that matches the given customer No
        // If no contact is found, abort and return an empty list
        List<Contact> contacts = [
            SELECT
                B2C_Customer_No__c,
                B2C_CustomerList__r.CustomerList_ID__c,
                B2C_CustomerList__r.OCAPI_Version_No__c,
                B2C_CustomerList__r.Named_Credential_Developer_Name__c
            FROM Contact
            WHERE B2C_Customer_ID__c = :customerId
        ];
        // If no contact is found, abort
        if (contacts.size() == 0) {
            return false;
        }
        Contact contact = contacts.get(0);

        // Build the address object to send to the B2C Commerce instance, based on the field mappings
        Map<String, Object> addressData = new Map<String, Object>();
        for (B2C_Integration_Field_Mappings__mdt fieldMapping : this.publishingFieldMappings) {
            addressData.put(fieldMapping.B2C_Commerce_OCAPI_Attribute__c, row.get(fieldMapping.Service_Cloud_Attribute__c));
        }

        // Performs the patch request
        HttpRequest req = B2CHttpRequestHelper.getCustomerProfileAddressPatchRequest(
            contact.B2C_CustomerList__r.Named_Credential_Developer_Name__c,
            contact.B2C_CustomerList__r.OCAPI_Version_No__c,
            contact.B2C_CustomerList__r.CustomerList_ID__c,
            contact.B2C_Customer_No__c,
            addressId,
            JSON.serialize(addressData, true)
        );
        Http https = new Http();
        HttpResponse res = https.send(req);
        return res.getStatusCode() == 200; // Consider the update as a success if the status code is 200
    }

    /**
     * @description Performs the REST API call against the B2C Commerce instance to get the customer addresses records based on the given customer number and address ID
     * @param customerId {String} The customer number of the customer from which to get the addresses
     * @param addressId {String} (Optional) The address Id to use while retrieve a specific address (in case of detail page)
     *
     * @returns {List<Map<String,Object>>} Returns a collection of maps representing the address data
     * */
    private List<Map<String,Object>> getData(String customerId, String addressId) {
        List<Map<String, Object>> addresses =  new List<Map<String, Object>>();

        // If no customer no is provided, abort and return an empty list
        if (String.isEmpty(customerId)) {
            return addresses;
        }

        // Get the contact that matches the given customer No
        // If no contact is found, abort and return an empty list
        List<Contact> contacts = [
            SELECT
                B2C_Customer_No__c,
                B2C_CustomerList__r.CustomerList_ID__c,
                B2C_CustomerList__r.OCAPI_Version_No__c,
                B2C_CustomerList__r.Named_Credential_Developer_Name__c
            FROM Contact
            WHERE B2C_Customer_ID__c = :customerId
        ];
        // If no contact is found, abort
        if (contacts.size() == 0) {
            return addresses;
        }
        Contact contact = contacts.get(0);

        HttpRequest req;
        // If the address Id is provided, get the address
        // Else, get all addresses for this customer
        if (!String.isEmpty(addressId)) {
            req = B2CHttpRequestHelper.getCustomerProfileAddressRequest(
                contact.B2C_CustomerList__r.Named_Credential_Developer_Name__c,
                contact.B2C_CustomerList__r.OCAPI_Version_No__c,
                contact.B2C_CustomerList__r.CustomerList_ID__c,
                contact.B2C_Customer_No__c,
                addressId
            );
        } else {
            req = B2CHttpRequestHelper.getCustomerProfileAddressesRequest(
                contact.B2C_CustomerList__r.Named_Credential_Developer_Name__c,
                contact.B2C_CustomerList__r.OCAPI_Version_No__c,
                contact.B2C_CustomerList__r.CustomerList_ID__c,
                contact.B2C_Customer_No__c
            );
        }
        Http https = new Http();
        HttpResponse res = https.send(req);
        JSONParse responseParsedJSON = new JSONParse(res.getBody());

        try {
            String fault = responseParsedJSON.get('fault').get('message').getStringValue();
            // If the fault message is found, the API call failed, abort and return no addresses
            return addresses;
        } catch (JSONParse.MissingKeyException e) {
            // In case the body misses the fault, then the API call succeed
            // In this case, silently fail and continue
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
     * @description This method maps the retrieved address from OCAPI to the core external object, ready to be consumed by Salesforce Connect, based on the configured field mappings
     * @param customerId {String} The customer number of the customer from which we get the addresses
     * @param addressData {JSONParse} The parsed JSON of the address
     *
     * @return {Map<String, Object>} The address map, ready to be consumed by Salesforce Connect
     */
    private Map<String, Object> mapAddress(String customerId, JSONParse addressData) {
        Map<String, Object> address = new Map<String, Object>();
        String addressId = addressData.get('address_id').getStringValue();

        for (B2C_Integration_Field_Mappings__mdt fieldMapping : this.retrievalFieldMappings) {
            try {
                if (fieldMapping.B2C_Commerce_Attribute_Type__c == 'boolean') {
                    address.put(fieldMapping.Service_Cloud_Attribute__c, addressData.get(fieldMapping.B2C_Commerce_OCAPI_Attribute__c).getBooleanValue());
                } else if (fieldMapping.B2C_Commerce_Attribute_Type__c == 'integer') {
                    address.put(fieldMapping.Service_Cloud_Attribute__c, addressData.get(fieldMapping.B2C_Commerce_OCAPI_Attribute__c).getIntegerValue());
                } else if (fieldMapping.B2C_Commerce_Attribute_Type__c == 'number') {
                    address.put(fieldMapping.Service_Cloud_Attribute__c, addressData.get(fieldMapping.B2C_Commerce_OCAPI_Attribute__c).getDecimalValue());
                } else { // By default treat as a string
                    address.put(fieldMapping.Service_Cloud_Attribute__c, addressData.get(fieldMapping.B2C_Commerce_OCAPI_Attribute__c).getStringValue());
                }
            } catch (JSONParse.MissingKeyException e) {
                // Log the error but don't abort
                // This probably fires only because the value is not set on the address in the B2C Commerce instance for this address, but the attribute still exists
                System.debug(
                        'The attribute [' + fieldMapping.B2C_Commerce_OCAPI_Attribute__c + '] ' +
                                'has not been found in the address [' + addressId + '] ' +
                                ' for the customer [' + customerId + '].'
                );
            }
        }

        // Fill out the customer No as indirect lookup
        address.put(INDIRECT_LOOKUP_COLUMN, customerId);
        // Fill out the external Id, mandatory field, with the customer no and the address Id
        // We require the customer no here because the address Id might not be unique across customers (this is not an UUID)
        address.put('ExternalId', customerId + '__' + addressId);
        address.put('DisplayUrl', '');

        return address;
    }
}
