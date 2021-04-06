/**
 * @author Abraham David Lloyd
 * @date May 3rd, 2020
 *
 * @description This is the test-class for the B2C AuthGetAccessTokenForFlowViaCCG class -- and
 * validates the function of each authentication method that was implemented.
 */
@IsTest
private class B2CIAAuthViaClientCredentialsGrant_Test {

    /**
     * @see B2CIAAuthViaClientCredentialsGrant.getB2CAccessTokenViaClientCredentials
     * @description This method is used to test the generation of an access token via
     * B2C Commerce using client credentials.  It tests the successful generation
     * of the access token.
     */
    @IsTest
    static void testGetB2CAccessTokenViaClientCredentialsSuccess() {

        // Initialize local variables
        List<B2CIAGetAccessTokenResult> accessTokenResponse;
        List<String> NamedCredentials;
        String failureMsg;

        Test.startTest();

        // Set the https mock service call
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('AccessToken'));

        // Initialize the mock named-credential
        NamedCredentials = new List<String>();
        NamedCredentials.add('Test Credential');

        // Attempt to retrieve the access-token and process the response
        accessTokenResponse = B2CIAAuthViaClientCredentialsGrant.getB2CAccessTokenViaClientCredentials(NamedCredentials);

        Test.stopTest();

        // Initialize the failure message to display if no error was caught
        failureMsg = 'Error: an error was caught; expected no error to be included in the response';

        // Assert that an error was caught and alert the user if none was
        System.assert(accessTokenResponse.get(0).isError == false, failureMsg);

    }

    /**
     * @see B2CIAAuthViaClientCredentialsGrant.getB2CAccessTokenViaClientCredentials
     * @description This method is used to test the generation of an access token via
     * B2C Commerce using client credentials.  It tests the failed generation
     * of the access token.
     */
    @IsTest
    static void testGetB2CAccessTokenViaClientCredentialsFailure() {

        // Initialize local variables
        List<B2CIAGetAccessTokenResult> accessTokenResponse;
        List<String> NamedCredentials;
        String failureMsg;
        Boolean errorCaught;

        // Initialize the catch-flag
        errorCaught = false;

        Test.startTest();

        // Set the https mock service call
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('AccessTokenFailure'));

        // Initialize the mock named-credential
        NamedCredentials = new List<String>();
        NamedCredentials.add('Test Credential');

        // Attempt to retrieve the access token
        accessTokenResponse = B2CIAAuthViaClientCredentialsGrant.getB2CAccessTokenViaClientCredentials(NamedCredentials);

        Test.stopTest();

        // Initialize the failure message to display if no error was caught
        failureMsg = 'Error: No error was caught; expected an error code to be included in the response';

        // Assert that an error was caught and alert the user if none was
        System.assert(accessTokenResponse.get(0).isError == true, failureMsg);

    }


}