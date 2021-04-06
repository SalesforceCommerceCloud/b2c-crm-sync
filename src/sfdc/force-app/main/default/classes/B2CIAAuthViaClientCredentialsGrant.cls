/**
 * @author Abraham David Lloyd
 * @date May 3rd, 2020
 *
 * @description This is a wrapper-class to enable the retrieval of a B2C Commerce OCAPI
 * access token via a client-credentials grant (clientId / clientSecret) attached to the
 * current user via named credentials.
*/
global with sharing class B2CIAAuthViaClientCredentialsGrant {

    // TODO Incorporate platform cache or something similar to cache to cache the access-token vs. making a new token request EVERY time.
    /**
     * @see B2CHttpRequestHelper.getClientCredentialGrantHttpRequest
     * @description This method is a wrapper for the B2CAuthenticator.AuthWithClientCredentials()
     * method -- and supports retrieval of the access token from within a flow.  It returns the
     * access-token provided by the B2C Commerce authentication response.
     *
     * @param NamedCredentials {List<String>} Represents the named credential to leverage
     * @return {List<B2CIAGetAccessTokenResult>} Returns the access-token provided by B2C Commerce via the
     * client-credentials grant.
     */
    @InvocableMethod(Label='B2C: Get AccessToken via ClientCredential Grant' Description='Attempts to retrieve the B2C Commerce access-token via a client-credentials grant (clientId / clientSecret attached to the users named credentials)')
    global static List<B2CIAGetAccessTokenResult> getB2CAccessTokenViaClientCredentials(List<String> NamedCredentials) {

        // Initialize local variables
        JSONParse responseParsedJSON;
        List<B2CIAGetAccessTokenResult> outputObj;
        B2CIAGetAccessTokenResult accessTokenResult;

        // Initialize the output object
        outputObj = new List<B2CIAGetAccessTokenResult>();

        // Iterate over the collection of Named Credentials
        for (String thisCredential: NamedCredentials) {

            // Initialize the outbound http request handler and invoke the service request
            HttpRequest req = B2CHttpRequestHelper.getClientCredentialGrantHttpRequest(thisCredential);
            Http https = new Http();
            HttpResponse res = https.send(req);

            // Initialize the variable used to process the response
            responseParsedJSON = new JSONParse(res.getBody());

            // Initialize the accessToken result
            accessTokenResult = new B2CIAGetAccessTokenResult();

            // Seed the default properties of the resultObject
            accessTokenResult.status = String.valueOf(res.getStatus());
            accessTokenResult.statusCode = Integer.valueOf(res.getStatusCode());
            accessTokenResult.responseBody = responseParsedJSON.toStringPretty();
            accessTokenResult.isError = false;

            // Check if the statusCode is found in the response and the response was processed successfully
            if (accessTokenResult.statusCode == 200) {

                // Seed the response object with the access token details
                accessTokenResult.accessToken = responseParsedJSON.get('access_token').getStringValue();
                accessTokenResult.tokenType = responseParsedJSON.get('token_type').getStringValue();
                accessTokenResult.expiresIn = responseParsedJSON.get('expires_in').getIntegerValue();

            } else {

                // Otherwise, capture the error message
                accessTokenResult.errorMessage = B2CConstant.Errors_OCAPI_AccessTokenNotPresent;
                accessTokenResult.isError = true;

            }

            // Add the accessToken to the output
            outputObj.add(accessTokenResult);

        }

        // Return the result
        return outputObj;

    }
}