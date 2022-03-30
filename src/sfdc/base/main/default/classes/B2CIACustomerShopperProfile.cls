/**
 * @author Jordane Bachelet
 * @date January 3rd, 2022
 *
 * @description This class is used to retrieve a customer profile from the OCAPI Shop API from B2C Commerce.
 * The goal of using the Shop API is to retrieve custom data based on customer's context
*/
public with sharing class B2CIACustomerShopperProfile {
    /**
     * @description This class is used to process the collection of inputs used to retrieve a
     * customer profile from B2C Commerce.  When successful, it returns customer profile data.
     *
     * @param customerShopperProfileInputList {List<B2CIACustomerShopperProfileInput>} Represents the collection of input
     * properties used to request an access token
     * @return {List<B2CIACustomerShopperProfileResult>} Returns a result representing the access token
     * request response (containing a token or the error
     */
    @InvocableMethod(
        Label='B2C: Get Customer Shopper Profile'
        Description='Retrieve the Shopper Customer Profile from B2C Commerce to get data from the current customer\'s context'
    )
    public static List<B2CIACustomerShopperProfileResult> getCustomerShopperProfile(
        List<B2CIACustomerShopperProfileInput> customerShopperProfileInputList
    ) {
        List<B2CIACustomerShopperProfileResult> outputObj = new List<B2CIACustomerShopperProfileResult>();

        for (B2CIACustomerShopperProfileInput b2creq : customerShopperProfileInputList) {
            HttpRequest req = B2CHttpRequestHelper.getShopCustomerProfileRequest(
                b2creq.domain, b2creq.siteId, b2creq.version, b2creq.customerId, b2creq.clientId, b2creq.token, b2creq.expandParameter
            );

            Http https = new Http();
            HttpResponse res = https.send(req);
            B2CIACustomerShopperProfileResult result = new B2CIACustomerShopperProfileResult();

            result.status = res.getStatus();
            result.statusCode = res.getStatusCode();
            result.responseBody = res.getBody();
            result.isError = false;

            if (result.statusCode == 200) {
                JSONParse responseParsedJSON = new JSONParse(res.getBody());
                result.promotionIds = new List<String>();
                try {
                    List<JSONParse> promotionsList = responseParsedJSON.get('c_active_promotions').asList();
                    for (JsonParse promotionItem : promotionsList) {
                        result.promotionIds.add(promotionItem.getStringValue());
                    }
                } catch (Exception e) {
                    // No coupons found in the promotion
                    System.debug('No promotions found for the profile.');
                }
                result.totalPromotionsSize = result.promotionIds.size();
            } else {
                result.errorMessage = B2CConstant.ERRORS_B2CCOMMERCE_SHOP_CUSTOMER_RETRIEVAL;
                result.isError = true;
            }

            outputObj.add(result);
        }

        return outputObj;
    }
}
