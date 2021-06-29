/**
 * @author Eric Schultz
 * @date Feb 6, 2020
 *
 * @description This test class is used to exercise the retrieval of a Business Manager user-grant.
 */
@IsTest
private class B2CIABusinessManagerGrant_Test {

    @IsTest
    static void testIsSuccess() {

        // Initialize the result object
        List<B2CIAGetAccessTokenResult> tokenResultList = new List<B2CIAGetAccessTokenResult>();

        Test.startTest();

            // Set the mock used to validate a successful request
            Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('BusinessManagerSuccess'));

            // Initialize the request details
            B2CIABusinessManagerGrantInput req = new B2CIABusinessManagerGrantInput();
            req.namedCredential = 'namedCredential';
            req.clientId = 'clientId';

            // Invoke the request and capture the response
            tokenResultList = B2CIABusinessManagerGrant.getB2CAccessTokenViaClientCredentials(
                new List<B2CIABusinessManagerGrantInput>{
                    req
                }
            );

        Test.stopTest();

        // Verify that a token was successfully retrieved
        System.assertEquals(tokenResultList.size() > 0, true, 'Expected a result to be populated');
        System.assertEquals(tokenResultList[0].statusCode, 200, 'Expected a statusCode of 200 indicating a successful result');
        System.assertEquals(tokenResultList[0].accessToken, B2CConstant.AuthTest_AuthToken, 'Expected a specific accessToken value to be provided');

    }


    @IsTest
    static void testIsFailure() {

        // Initialize the result object
        List<B2CIAGetAccessTokenResult> tokenResultList = new List<B2CIAGetAccessTokenResult>();

        Test.startTest();

            // Set the mock used to validate a successful request
            Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('BusinessManagerFailure'));

            // Initialize the request details
            B2CIABusinessManagerGrantInput req = new B2CIABusinessManagerGrantInput();
            req.namedCredential = 'namedCredential';
            req.clientId = 'clientId';

            // Invoke the request and capture the response
            tokenResultList = B2CIABusinessManagerGrant.getB2CAccessTokenViaClientCredentials(
                new List<B2CIABusinessManagerGrantInput>{
                    req
                }
            );

        Test.stopTest();

        // Verify that the authToken process failed
        System.assertEquals(tokenResultList.size() > 0, true, 'Expected a result to be populated');
        System.assertEquals(tokenResultList[0].statusCode, 401, 'Expected a statusCode of 401 indicating an internal server error');

    }


}
