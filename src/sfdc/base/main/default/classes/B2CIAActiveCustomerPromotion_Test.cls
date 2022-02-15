/**
 * @author Jordane Bachelet
 * @date Dec 28, 2021
 *
 * @description This class exercises the successful and failed process of customer active promotions retrieval.
 */
@IsTest
private class B2CIAActiveCustomerPromotion_Test {
    @IsTest
    static void testIsSuccess() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('ActivePromotionsSuccess'));

        // Seed the input arguments
        B2CIAActiveCustomerPromotionsInput req = new B2CIAActiveCustomerPromotionsInput();
        req.siteId = 'siteId';
        req.customerId = 'customerId';
        req.clientId = 'clientId';
        req.token = 'token';
        req.domain = 'domain';
        req.version = 'version';
        req.promotionIds = new List<String>();
        req.promotionIds.add('promotion-id');

        // Request the authToken and validate the results
        List<B2CIAActiveCustomerPromotionsResult> resultList = B2CIAActiveCustomerPromotion.getCustomerActivePromotions(
            new List<B2CIAActiveCustomerPromotionsInput>{
                req
            }
        );
        Test.stopTest();

        // Validate that the request processed successfully
        System.assertEquals(resultList.size() > 0, true, 'Expected a result to be processed and returned in the results');
        System.assertEquals(resultList[0].statusCode, 200, 'Expected a successful http statusCode to be returned as part of this request');
        System.assertEquals(resultList[0].isError, false, 'Expected the isError flag to be false.');
        System.assertNotEquals(resultList[0].promotionsAsJSON, null, 'Expected promotions to be returned from the mock response');
    }

    @IsTest
    static void testIsFailure() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('ActivePromotionsFailure'));

        // Seed the input arguments
        B2CIAActiveCustomerPromotionsInput req = new B2CIAActiveCustomerPromotionsInput();
        req.siteId = 'siteId';
        req.customerId = 'customerId';
        req.clientId = 'clientId';
        req.token = 'token';
        req.domain = 'domain';
        req.version = 'version';
        req.promotionIds = new List<String>();
        req.promotionIds.add('promotion-id');

        // Request the authToken and validate the results
        List<B2CIAActiveCustomerPromotionsResult> resultList = B2CIAActiveCustomerPromotion.getCustomerActivePromotions(
            new List<B2CIAActiveCustomerPromotionsInput>{
                req
            }
        );

        Test.stopTest();

        // Validate that the request processed with a failure
        System.assertEquals(resultList.size() > 0, true, 'Expected a result to be processed and returned in the results');
        System.assertEquals(resultList[0].statusCode, 404, 'Expected a failed (404) http statusCode to be returned as part of this request');
        System.assertEquals(resultList[0].isError, true, 'Expected the isError flag to be true.');
    }
}
