/**
 * @author Jordane Bachelet
 * @date Dec 28, 2021
 *
 * @description This class exercises the successful and failed process of customer shopper details retrieval.
 */
@IsTest
private class B2CIACustomerShopperProfile_Test {
    @IsTest
    static void testIsSuccess() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerShopDetailsSuccessWithPromotions'));

        // Seed the input arguments
        B2CIACustomerShopperProfileInput req = new B2CIACustomerShopperProfileInput();
        req.siteId = 'siteId';
        req.customerId = 'customerId';
        req.clientId = 'clientId';
        req.token = 'token';
        req.domain = 'domain';
        req.version = 'version';
        req.expandParameter = 'parameter';

        // Request the authToken and validate the results
        List<B2CIACustomerShopperProfileResult> resultList = B2CIACustomerShopperProfile.getCustomerShopperProfile(
            new List<B2CIACustomerShopperProfileInput>{
                req
            }
        );
        Test.stopTest();

        // Validate that the request processed successfully
        System.assertEquals(resultList.size() > 0, true, 'Expected a result to be processed and returned in the results');
        System.assertEquals(resultList[0].statusCode, 200, 'Expected a successful http statusCode to be returned as part of this request');
        System.assertEquals(resultList[0].isError, false, 'Expected the isError flag to be false.');
        System.assertEquals(resultList[0].totalPromotionsSize, 2, 'Expected two promotions to be returned from the mock response');
        System.assertEquals(resultList[0].promotionIds.size(), 2, 'Expected two promotions to be returned from the mock response');
    }

    @IsTest
    static void testIsFailure() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerShopDetailsFailure'));

        // Seed the input arguments
        B2CIACustomerShopperProfileInput req = new B2CIACustomerShopperProfileInput();
        req.siteId = 'siteId';
        req.customerId = 'customerId';
        req.clientId = 'clientId';
        req.token = 'token';
        req.domain = 'domain';
        req.version = 'version';
        req.expandParameter = 'parameter';

        // Request the authToken and validate the results
        List<B2CIACustomerShopperProfileResult> resultList = B2CIACustomerShopperProfile.getCustomerShopperProfile(
            new List<B2CIACustomerShopperProfileInput>{
                req
            }
        );

        Test.stopTest();

        // Validate that the request processed with a failure
        System.assertEquals(resultList.size() > 0, true, 'Expected a result to be processed and returned in the results');
        System.assertEquals(resultList[0].statusCode, 400, 'Expected a failed (400) http statusCode to be returned as part of this request');
        System.assertEquals(resultList[0].isError, true, 'Expected the isError flag to be true.');
    }
}
