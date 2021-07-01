/**
 * @author Eric Schultz
 * @date Feb 6, 2020
 *
 * @description This class exercises the successful and failed retrieval of the ClientCredentialGrant.
 */
@IsTest
private class B2CIAAuthCustomerClientCredGrant_Test {

    @IsTest
    static void testIsSuccess() {

        // Initialize the result collection
        List<B2CIAGetAccessTokenResult> tokenResultList = new List<B2CIAGetAccessTokenResult>();

        Test.startTest();

            // Set the mock-generator for the current request (modeling success)
            Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAuthSuccess'));

            // Seed the input arguments
            B2CIAAuthCustomerInput req = new B2CIAAuthCustomerInput();
            req.siteId = 'siteId';
            req.customerId = 'customerId';
            req.clientId = 'clientId';
            req.token = 'token';
            req.domain = 'domain';
            req.version = 'version';

            // Request the authToken and validate the results
            tokenResultList = B2CIAAuthCustomerClientCredentialsGrant.getB2CAccessTokenViaClientCredentials(
                new List<B2CIAAuthCustomerInput>{
                    req
                }
            );

        Test.stopTest();

        // Validate that the request processed successfully
        System.assertEquals(tokenResultList.size() > 0, true, 'Expected a result to be processed and returned in the results');
        System.assertEquals(tokenResultList[0].statusCode, 200, 'Expected a successful http statusCode to be returned as part of this request');
        System.assertEquals(tokenResultList[0].accessToken, B2CConstant.AUTHTEST_AUTHTOKEN, 'Expected the accessToken to equal the test tokenValue.');

    }

    @IsTest
    static void testIsFailure() {

        // Initialize the result collection
        List<B2CIAGetAccessTokenResult> tokenResultList = new List<B2CIAGetAccessTokenResult>();

        Test.startTest();

        // Set the mock-generator for the current request (modeling success)
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAuthFailure'));

        // Seed the input arguments
        B2CIAAuthCustomerInput req = new B2CIAAuthCustomerInput();
        req.siteId = 'siteId';
        req.customerId = 'customerId';
        req.clientId = 'clientId';
        req.token = 'token';
        req.domain = 'domain';
        req.version = 'version';

        // Request the authToken and validate the results
        tokenResultList = B2CIAAuthCustomerClientCredentialsGrant.getB2CAccessTokenViaClientCredentials(
            new List<B2CIAAuthCustomerInput>{
                req
            }
        );

        Test.stopTest();

        // Validate that the request processed with a failure
        System.assertEquals(tokenResultList.size() > 0, true, 'Expected a result to be processed and returned in the results');
        System.assertEquals(tokenResultList[0].statusCode, 401, 'Expected a failed (401) http statusCode to be returned as part of this request');

    }

}
