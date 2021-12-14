/**
 * @author Jordane Bachelet
 * @date Dec 28, 2021
 *
 * @description This class exercises the successful and failed process of customer password reset.
 */
@IsTest
private class B2CIAPasswordReset_Test {
    @IsTest
    static void testIsSuccess() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('PasswordResetSuccess'));

        // Seed the input arguments
        B2CIAPasswordResetInput req = new B2CIAPasswordResetInput();
        req.siteId = 'siteId';
        req.customerId = 'customerId';
        req.clientId = 'clientId';
        req.token = 'token';
        req.domain = 'domain';
        req.version = 'version';

        // Request the authToken and validate the results
        List<B2CIAPasswordResetResult> resultList = B2CIAPasswordReset.resetCustomerPassword(
            new List<B2CIAPasswordResetInput>{
                req
            }
        );
        Test.stopTest();

        // Validate that the request processed successfully
        System.assertEquals(resultList.size() > 0, true, 'Expected a result to be processed and returned in the results');
        System.assertEquals(resultList[0].statusCode, 204, 'Expected a successful http statusCode to be returned as part of this request');
        System.assertEquals(resultList[0].isError, false, 'Expected the isError flag to be false.');

    }

    @IsTest
    static void testIsFailure() {
        Test.startTest();

        // Set the mock-generator for the current request (modeling success)
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('PasswordResetFailure'));

        // Seed the input arguments
        B2CIAPasswordResetInput req = new B2CIAPasswordResetInput();
        req.siteId = 'siteId';
        req.customerId = 'customerId';
        req.clientId = 'clientId';
        req.token = 'token';
        req.domain = 'domain';
        req.version = 'version';

        // Request the authToken and validate the results
        List<B2CIAPasswordResetResult> resultList = B2CIAPasswordReset.resetCustomerPassword(
            new List<B2CIAPasswordResetInput>{
                req
            }
        );

        Test.stopTest();

        // Validate that the request processed with a failure
        System.assertEquals(resultList.size() > 0, true, 'Expected a result to be processed and returned in the results');
        System.assertEquals(resultList[0].statusCode, 401, 'Expected a failed (401) http statusCode to be returned as part of this request');
        System.assertEquals(resultList[0].isError, true, 'Expected the isError flag to be true.');

    }

}
