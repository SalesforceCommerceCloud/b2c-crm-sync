public with sharing class B2CCustomerAddressBook {
    public static final String METADATA_NAME = 'B2C_CustomerAddress__x';

    /**
     * Retrieves the label of the address fields
     *
     * @return List<Map<String, String>> The map of Id<>Label of the address fields
     */
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getCustomerAddressLabels() {
        List<B2C_Integration_Field_Mappings__mdt> fieldMappings = B2CMetaFieldMappings.getFieldMappingsForUIRendering(METADATA_NAME);
        List<Map<String, String>> fields = new List<Map<String, String>>();

        for (B2C_Integration_Field_Mappings__mdt fieldMapping : fieldMappings) {
            Map<String, String> field = new Map<String, String>();
            field.put('id', fieldMapping.Service_Cloud_Attribute__c);
            field.put('label', fieldMapping.Field_Label__c);
            fields.add(field);
        }

        return fields;
    }

    /**
     * Retrieves the label of the address fields
     *
     * @return List<Map<String, String>> The map of Id<>Label of the address fields
     */
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getCustomerAddressFormFields() {
        List<B2C_Integration_Field_Mappings__mdt> fieldMappings = B2CMetaFieldMappings.getFieldMappingsForPublishing(METADATA_NAME);
        List<Map<String, String>> fields = new List<Map<String, String>>();

        for (B2C_Integration_Field_Mappings__mdt fieldMapping : fieldMappings) {
            Map<String, String> field = new Map<String, String>();
            field.put('id', fieldMapping.Service_Cloud_Attribute__c);
            field.put('label', fieldMapping.Field_Label__c);
            fields.add(field);
        }

        return fields;
    }

    /**
     * Fetches the customer's address book from B2C Commerce and returns it
     *
     * @param {String} customerId The customer Id for whom to fetch the addresses
     *
     * @return List<Map<String, Object>> The list of addresses found
     */
    @AuraEnabled(cacheable=false)
    public static List<Map<String, Object>> getCustomerAddresses(String recordId) {
        List<Map<String, Object>> addresses =  new List<Map<String, Object>>();
        if (String.isEmpty(recordId)) {
            return addresses;
        }

        // Get the contact that matches the given customer Id
        // If no contact is found, an error is thrown
        Contact contact = B2CContactManager.getContactByCustomerId(recordId);
        // In case the customer list disallow address retrieval, return an empty address list
        if (!contact.B2C_CustomerList__r.Enable_Address_Retrieval__c) {
            return addresses;
        }

        HttpRequest req = B2CHttpRequestHelper.getCustomerProfileAddressesRequest(
            contact.B2C_CustomerList__r.Base_API_Url__c,
            B2CAuthTokenHelper.getB2CAuthTokenByClientIDValue(contact.B2C_CustomerList__r.B2C_Client_ID__c, true),
            contact.B2C_CustomerList__r.OCAPI_Version_No__c,
            contact.B2C_CustomerList__r.Name,
            contact.B2C_Customer_No__c
        );

        Http https = new Http();
        HttpResponse res = https.send(req);
        Integer statusCode = res.getStatusCode();
        if (statusCode != 200) {
            return addresses;
        }

        JSONParse responseParsedJSON = new JSONParse(res.getBody());
        Integer count = responseParsedJSON.get('count').getIntegerValue();
        if (count > 0) {
            List<JSONParse> addressesData = responseParsedJSON.get('data').asList();
            for (JSONParse addressData : addressesData) {
                addresses.add(B2CMetaFieldMappings.mapFields(recordId, addressData, B2CMetaFieldMappings.getFieldMappingsForUIRendering(METADATA_NAME)));
            }
        }

        return addresses;
    }

    /**
     * Fetches the customer's address from B2C Commerce and returns it
     *
     * @param {String} customerId The customer Id for whom to fetch the address
     * @param {String} addressId The address Id of the address to fetch
     *
     * @return Map<String, Object>
     */
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getCustomerAddressById(String customerId, String addressId) {
        Map<String, Object> address =  new Map<String, Object>();
        if (String.isEmpty(customerId) || String.isEmpty(addressId)) {
            return address;
        }

        // Get the contact that matches the given customer Id
        // If no contact is found, an error is thrown
        Contact contact = B2CContactManager.getContactByCustomerId(customerId);
        // In case the customer list disallow address retrieval, return an empty address
        if (!contact.B2C_CustomerList__r.Enable_Address_Retrieval__c) {
            return address;
        }

        HttpRequest req = B2CHttpRequestHelper.getCustomerProfileAddressRequest(
            contact.B2C_CustomerList__r.Base_API_Url__c,
            B2CAuthTokenHelper.getB2CAuthTokenByClientIDValue(contact.B2C_CustomerList__r.B2C_Client_ID__c, true),
            contact.B2C_CustomerList__r.OCAPI_Version_No__c,
            contact.B2C_CustomerList__r.Name,
            contact.B2C_Customer_No__c,
            addressId
        );

        Http https = new Http();
        HttpResponse res = https.send(req);
        Integer statusCode = res.getStatusCode();
        if (statusCode != 200) {
            return address;
        }

        JSONParse responseParsedJSON = new JSONParse(res.getBody());
        return B2CMetaFieldMappings.mapFields(customerId, responseParsedJSON, B2CMetaFieldMappings.getFieldMappingsForPublishing(METADATA_NAME));
    }

    /**
     * Patches the customer's address to B2C Commerce
     *
     * @param {String} customerId The customer Id for whom to fetch the address
     * @param {String} addressId The address Id of the address to patch
     * @param {String} address The address details
     *
     * @return String Any error in case something went wrong
     */
    @AuraEnabled(cacheable=true)
    public static String patchCustomerAddress(String customerId, String addressId, Map<String, Object> address) {
        if (String.isEmpty(customerId) || String.isEmpty(addressId)) {
            return B2CConstant.buildErrorMessage(B2CConstant.ERRORS_B2CCOMMERCE_ADDRESSBOOK_FAILED_TO_PATCH_ADDRESS, 'Wrong parameters sent in the method');
        }

        // Get the contact that matches the given customer Id
        // If no contact is found, an error is thrown
        Contact contact = B2CContactManager.getContactByCustomerId(customerId);
        // In case the customer list disallow address publishing, return an empty address
        if (!contact.B2C_CustomerList__r.Enable_Address_Publishing__c) {
            return B2CConstant.buildErrorMessage(B2CConstant.ERRORS_B2CCOMMERCE_ADDRESSBOOK_FAILED_TO_PATCH_ADDRESS, 'Customer list disallows address updates');
        }

        // Build the address object to send to the B2C Commerce instance, based on the field mappings
        Map<String, Object> addressData = new Map<String, Object>();
        List<B2C_Integration_Field_Mappings__mdt> fieldMappings = B2CMetaFieldMappings.getFieldMappingsForPublishing(METADATA_NAME);
        for (B2C_Integration_Field_Mappings__mdt fieldMapping : fieldMappings) {
            addressData.put(
                fieldMapping.B2C_Commerce_OCAPI_Attribute__c,
                address.get(fieldMapping.Service_Cloud_Attribute__c)
            );
        }

        HttpRequest req = B2CHttpRequestHelper.getCustomerProfileAddressPatchRequest(
            contact.B2C_CustomerList__r.Base_API_Url__c,
            B2CAuthTokenHelper.getB2CAuthTokenByClientIDValue(contact.B2C_CustomerList__r.B2C_Client_ID__c, true),
            contact.B2C_CustomerList__r.OCAPI_Version_No__c,
            contact.B2C_CustomerList__r.Name,
            contact.B2C_Customer_No__c,
            addressId,
            JSON.serialize(addressData, true)
        );

        Http https = new Http();
        HttpResponse res = https.send(req);
        if (res.getStatusCode() != 200) {
            JSONParse responseParsedJSON = new JSONParse(res.getBody());
            return B2CConstant.buildErrorMessage(B2CConstant.ERRORS_B2CCOMMERCE_ADDRESSBOOK_FAILED_TO_PATCH_ADDRESS, responseParsedJSON.get('fault').get('message').getStringValue());
        }

        return null;
    }
}
