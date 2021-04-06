/**
 * @author Abraham David Lloyd
 * @date May 21st, 2020
 *
 * @description This is a test class to exercise the HttpRequestHelper class.  These
 * tests allow us to validate that the request-helper class is successfully generating
 * the proxy request objects correctly.
 */
@IsTest
private class B2CHttpRequestHelper_Test {

    /**
     * @see B2CHttpRequestHelper.getClientCredentialGrantHttpRequest
     * @description This test attempts to retrieve API authorization from B2C Commerce
     * via a Client Credentials Grant.
     */
    @IsTest
    static void testGetClientCredentialGrantHttpRequest() {

        // Initialize local variables
        HttpRequest req;
        String requestBody;
        String compareString;
        String errorMsg;
        Boolean grantTestResult;

        // Default the test properties
        grantTestResult = false;
        compareString = 'grant_type=client_credentials';

        Test.startTest();

        // Invoke the get client-credentials grant proxy-request.
        req = B2CHttpRequestHelper.getClientCredentialGrantHttpRequest('NamedCredential');

        Test.stopTest();

        // Shorthand the request body
        requestBody = req.getBody();

        // Build out the error message that will be displayed to users if a test fails
        errorMsg = 'Mismatch in request body --> [' + requestBody+ '] vs [' + compareString + ']';

        // Evaluate if the body and compare-string are similar
        if (requestBody == compareString) {
            grantTestResult = true;
        }

        // Only evaluate field-mappings that are active and in-use
        System.assert(grantTestResult, errorMsg);

    }

}