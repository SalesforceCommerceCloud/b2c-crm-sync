@IsTest
public class B2CAuthenticator_Test {

    /**
     * @see B2CAuthenticator.authWithClientCredentials
     * @description This method tests authentication against B2C Commerce using
     * client credentials.
     */
    @IsTest
    static void testAuthWithClientCredentials() {

        // Initialize local variables
        Map<String, Object> jsonResponse;
        Map<String, String> accessTokenSuccessResponse;
        Map<String, Object> successResponseBody;
        String failureMsg;
        String testAccessToken;
        String expectedAccessToken;

        // Initialize the failureMsg
        failureMsg = '';

        Test.startTest();

        // Set the https mock service call
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('AccessToken'));

        // Invoke the authentication method and retrieve the parsed JSON response
        jsonResponse = B2CAuthenticator.authWithClientCredentials();
        accessTokenSuccessResponse = B2CHttpTestCalloutMockGenerator.getAccessTokenSuccessResponse();
        successResponseBody = (Map<String, Object>)JSON.deserializeUntyped(accessTokenSuccessResponse.get('body'));

        Test.stopTest();

        // Shorthand the tokens used to validate success
        testAccessToken = String.valueOf(jsonResponse.get('access_token'));
        expectedAccessToken = String.valueOf(successResponseBody.get('access_token'));

        // Create the access-token comparison message
        failureMsg = 'Expected [' + expectedAccessToken + '] and validated [' + testAccessToken + ']';

        // Test that the body was parsed and processed successfully
        System.assertEquals(
            testAccessToken,
            expectedAccessToken,
            failureMsg
        );

    }

}