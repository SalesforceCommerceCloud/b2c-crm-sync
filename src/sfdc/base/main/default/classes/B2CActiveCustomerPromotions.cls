public with sharing class B2CActiveCustomerPromotions {
    public static final String METADATA_NAME = 'B2C_Promotion__x';
    public static final Integer MAXIMUM_COUPON_CODES = 10;

    /**
     * Retrieves the label of the promotion fields
     *
     * @return List<Map<String, String>> The map of Id<>Label of the promotion fields
     */
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getPromotionsLabels() {
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
     * Issue a coupon for the given promotion
     *
     * @return String The coupon code issued
     */
    @AuraEnabled
    public static List<String> getCouponCodes(String recordId, String couponId, String siteId, Integer maximumCouponCodes) {
        List<String> couponCodes =  new List<String>();
        if (String.isEmpty(recordId) || string.isEmpty(couponId) || String.isEmpty(siteId)) {
            return couponCodes;
        }

        // Get the contact that matches the given customer Id
        // If no contact is found, an error is thrown
        Contact contact = B2CContactManager.getContactByCustomerId(recordId);
        maximumCouponCodes = maximumCouponCodes != null ? maximumCouponCodes : MAXIMUM_COUPON_CODES;

        HttpRequest req = B2CHttpRequestHelper.getCouponCodesRequest(
            contact.B2C_CustomerList__r.Base_API_Url__c,
            B2CAuthTokenHelper.getB2CAuthTokenByClientIDValue(contact.B2C_CustomerList__r.B2C_Client_ID__c, true),
            contact.B2C_CustomerList__r.OCAPI_Version_No__c,
            siteId,
            couponId,
            maximumCouponCodes
        );

        Http https = new Http();
        HttpResponse res = https.send(req);
        Integer statusCode = res.getStatusCode();
        if (statusCode != 200) {
            return couponCodes;
        }

        JSONParse responseParsedJSON = new JSONParse(res.getBody());
        Integer count = responseParsedJSON.get('count').getIntegerValue();
        if (count > 0) {
            List<JSONParse> couponCodesData = responseParsedJSON.get('data').asList();
            for (JSONParse couponCodeData : couponCodesData) {
                String couponCode = couponCodeData.get('code').getStringValue();
                Boolean issued = false;
                try {
                    issued = couponCodeData.get('issued').getBooleanValue();
                } catch (Exception e) {
                    // No issued property on the coupon code, which happens the coupon code has not been issued yet
                    System.debug('The coupon is not yet issued, so the property is not sent by the OCAPI');
                }

                if (!issued) {
                    couponCodes.add(couponCode);
                }
            }
        }

        return couponCodes;
    }
}
