/**
 * @author Jordane Bachelet
 * @date January 3rd, 2022
 *
 * @description This class is used to retrieve a customer profile from the OCAPI Shop API from B2C Commerce.
 * The goal of using the Shop API is to retrieve custom data based on customer's context
*/
public with sharing class B2CIAActiveCustomerPromotion {
    /**
     * @description This class is used to process the collection of inputs used to retrieve a
     * customer profile from B2C Commerce.  When successful, it returns customer profile data.
     *
     * @param customerActivePromotionsInputList {List<B2CIAActiveCustomerPromotionsInput>} Represents the collection of input
     * properties used to request an access token
     * @return {List<B2CIAActiveCustomerPromotionsResult>} Returns a result representing the access token
     * request response (containing a token or the error
     */
    @InvocableMethod(
        Label='B2C: Get Active Customer Promotions'
        Description='Retrieve the Active Customer Promotions from B2C Commerce for the current customer (based on the token used)'
    )
    public static List<B2CIAActiveCustomerPromotionsResult> getCustomerActivePromotions(
        List<B2CIAActiveCustomerPromotionsInput> customerActivePromotionsInputList
    ) {
        List<B2CIAActiveCustomerPromotionsResult> outputObj = new List<B2CIAActiveCustomerPromotionsResult>();

        for (B2CIAActiveCustomerPromotionsInput b2creq : customerActivePromotionsInputList) {
            HttpRequest req = B2CHttpRequestHelper.getActiveCustomerPromotionsRequest(
                b2creq.domain, b2creq.siteId, b2creq.version, b2creq.clientId, b2creq.token, b2creq.promotionIds, 'coupons'
            );

            Http https = new Http();
            HttpResponse res = https.send(req);
            B2CIAActiveCustomerPromotionsResult result = new B2CIAActiveCustomerPromotionsResult();

            result.status = res.getStatus();
            result.statusCode = res.getStatusCode();
            result.responseBody = res.getBody();
            result.isError = false;

            if (result.statusCode == 200) {
                JSONParse responseParsedJSON = new JSONParse(res.getBody());
                result.totalRecords = responseParsedJSON.get('count').getIntegerValue();
                List<JSONParse> promotionsData = responseParsedJSON.get('data').asList();
                List<Map<String, Object>> promotions = new List<Map<String, Object>>();
                for (JSONParse promotionData : promotionsData) {
                    Map<String, Object> promotionObj = B2CMetaFieldMappings.mapFields(b2creq.customerId, promotionData, B2CMetaFieldMappings.getFieldMappingsForUIRendering(B2CActiveCustomerPromotions.METADATA_NAME));
                    // Try to get the coupons for the given promotion
                    try {
                        List<JSONParse> couponsData = promotionData.get('c_coupons').asList();
                        List<String> coupons = new List<String>();
                        for (JSONParse couponData : couponsData) {
                            coupons.add(couponData.get('id').getStringValue());
                        }
                        promotionObj.put('coupons', coupons);
                    } catch (Exception e) {
                        // No coupons found in the promotion
                        System.debug('No coupons found for the promotion ' + promotionData.get('id').getStringValue());
                    }
                    promotions.add(promotionObj);
                }

                result.promotionsAsJSON = JSON.serialize(promotions, true);
            } else {
                result.errorMessage = B2CConstant.ERRORS_B2CCOMMERCE_GET_PROMOTIONS;
                result.isError = true;
            }

            outputObj.add(result);
        }

        return outputObj;
    }
}
