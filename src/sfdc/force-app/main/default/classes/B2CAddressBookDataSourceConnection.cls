global class B2CAddressBookDataSourceConnection extends DataSource.Connection {
    private DataSource.ConnectionParams connectionInfo;
    private List<B2C_Integration_Field_Mappings__mdt> retrievalFieldMappings;
    private List<B2C_Integration_Field_Mappings__mdt> publishingFieldMappings;

    private final String TABLE_NAME = 'B2C_CustomerAddress';
    private final String INDIRECT_LOOKUP_COLUMN = 'Customer_No';

    global B2CAddressBookDataSourceConnection(DataSource.ConnectionParams connectionParams) {
        this.connectionInfo = connectionParams;
        this.retrievalFieldMappings = B2CMetaFieldMappings.getFieldMappingsForRetrieval(this.TABLE_NAME + '__x');
        this.publishingFieldMappings = B2CMetaFieldMappings.getFieldMappingsForPublishing(this.TABLE_NAME + '__x');
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
        result.put('customerNo', parts.get(0));
        result.put('addressId', parts.get(1));

        return result;
    }

    /**
     * @description Abstract Method sync() must be implemented as part of DataSource.Connection class
     * This method defines the Customer Address Schema of External Object
     *
     * @return {List<DataSource.Table>} tables
     * */
    override global List<DataSource.Table> sync() {
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

        // Always apply the following columns:
        // - ExternalId -> Required by Salesforce Connect as unique identifier in the Core Platform
        // - Display URL -> Required by Salesforce Connect to be able to open the detail page within the external system
        // - CustomerNo -> The indirect lookup to the Contact record
        columns.add(DataSource.Column.indirectLookup(INDIRECT_LOOKUP_COLUMN, 'Contact', 'B2C_Customer_No__c'));
        columns.add(DataSource.Column.text('ExternalId', 255));
        columns.add(DataSource.Column.url('DisplayUrl'));

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
        DataSource.Filter filter = context.tableSelection.filter;
        String customerNo;
        String addressId;

        if (filter.columnName == 'ExternalId') {
            // If no customer No is found, then we are rendering the address detail page
            // Let's get the external Id and extract the customer No and the address Id
            Map<String, String> parts = splitExternalId((String)filter.columnValue);
            customerNo = parts.get('customerNo');
            addressId = EncodingUtil.urlEncode(parts.get('addressId'), 'UTF-8');
        } else {
            // Search the customer no from the sub filters of the query
            // This is provided when we render the list of addresses from the related list UI
            for (DataSource.filter subfilter : context.tableSelection.filter.subfilters) {
                if (subfilter.columnName == INDIRECT_LOOKUP_COLUMN) {
                    customerNo = (String)subfilter.columnValue;
                }
            }
        }

        List<Map<String, Object>> rows = DataSource.QueryUtils.process(context, getData(customerNo, addressId));
        return DataSource.TableResult.get(true, null, context.tableSelection.tableSelected, rows);
    }

    /**
     * @description Update the given rows within the B2C Commerce instance
     * @param context {DataSource.UpsertContext} The upsert context to use to update the rows
     *
     * @return {List<DataSource.UpsertResult>} The results of the updates
     */
    override global List<DataSource.UpsertResult> upsertRows(DataSource.UpsertContext context) {
        List<Map<String, Object>> rows = context.rows;
        List<DataSource.UpsertResult> results = new List<DataSource.UpsertResult>();

        for (Map<String, Object> row : rows) {
            String externalId = (String)row.get('ExternalId');
            Map<String, String> parts = splitExternalId(externalId);
            String customerNo = parts.get('customerNo');
            String addressId = parts.get('addressId');

            Boolean result = updateData(row, customerNo, addressId);
            if (result) {
                results.add(DataSource.UpsertResult.success(externalId));
            } else {
                results.add(DataSource.UpsertResult.failure(externalId, 'Failed to update the address to B2C Commerce.'));
            }
        }

        return results;
    }

    /**
     * @description Updates the address within B2C Commerce based on the given row
     * @param row {Map<String, Object>} The row that contains the fields updated
     * @param customerNo {String} The customer number of the customer to which to update the address
     * @param addressId {String} The customer address to update
     *
     * @return {Boolean} True if the update succeed, or false otherwise
     */
    private Boolean updateData(Map<String, Object> row, String customerNo, String addressId) {
        // If no customer no is provided, abort and return an empty list
        if (String.isEmpty(customerNo)) {
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
            WHERE B2C_Customer_No__c = :customerNo
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
            customerNo,
            addressId,
            JSON.serialize(addressData, true)
        );
        Http https = new Http();
        HttpResponse res = https.send(req);
        return res.getStatusCode() == 200; // Consider the update as a success if the status code is 200
    }

    /**
     * @description Performs the REST API call against the B2C Commerce instance to get the customer addresses records based on the given customer number and address ID
     * @param customerNo {String} The customer number of the customer from which to get the addresses
     * @param addressId {String} (Optional) The address Id to use while retrieve a specific address (in case of detail page)
     *
     * @returns {List<Map<String,Object>>} Returns a collection of maps representing the address data
     * */
    private List<Map<String,Object>> getData(String customerNo, String addressId) {
        List<Map<String, Object>> addresses =  new List<Map<String, Object>>();

        // If no customer no is provided, abort and return an empty list
        if (String.isEmpty(customerNo)) {
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
            WHERE B2C_Customer_No__c = :customerNo
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
                customerNo,
                addressId
            );
        } else {
            req = B2CHttpRequestHelper.getCustomerProfileAddressesRequest(
                contact.B2C_CustomerList__r.Named_Credential_Developer_Name__c,
                contact.B2C_CustomerList__r.OCAPI_Version_No__c,
                contact.B2C_CustomerList__r.CustomerList_ID__c,
                customerNo
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
                    addresses.add(mapAddress(customerNo, addressData));
                }
            }
        } else {
            addresses.add(mapAddress(customerNo, responseParsedJSON));
        }

        return addresses;
    }

    /**
     * @description This method maps the retrieved address from OCAPI to the core external object, ready to be consumed by Salesforce Connect, based on the configured field mappings
     * @param customerNo {String} The customer number of the customer from which we get the addresses
     * @param addressData {JSONParse} The parsed JSON of the address
     *
     * @return {Map<String, Object>} The address map, ready to be consumed by Salesforce Connect
     */
    private Map<String, Object> mapAddress(String customerNo, JSONParse addressData) {
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
                    'The attribute {' + fieldMapping.B2C_Commerce_OCAPI_Attribute__c + '} ' +
                    'has not been found in the address {' + addressId + '} ' +
                    ' for the customer {' + customerNo + '}.'
                );
            }
        }

        // Fill out the customer No as indirect lookup
        address.put(INDIRECT_LOOKUP_COLUMN, customerNo);
        // Fill out the external Id, mandatory field, with the customer no and the address Id
        // We require the customer no here because the address Id might not be unique across customers (this is not an UUID)
        address.put('ExternalId', customerNo + '__' + addressId);
        address.put('DisplayUrl', '');

        return address;
    }
}
