/**
 * @author Abraham David Lloyd
 * @date February 4th, 2021
 *
 * @description This is a wrapper-class to enable the retrieval of a specific
 * B2C Commerce Site via OCAPI.
*/
public with sharing class B2CIAGetB2CAuthToken {

    /**
     * @see B2CIAGetAccessTokenResult
     * @description Invokable action to retrieve a Customer Profile from B2C Commerce
     *
     * @param requestArguments {List<B2CIAGetB2CAuthTokenInput>} Represents the request arguments to process
     * @returns {List<B2CIAGetAccessTokenResult>} Returns the response object containing the authToken response details
     */
    @InvocableMethod(Label='B2C: Get a B2C AuthToken' Description='Attempts to retrieve a REST API AuthToken from the B2C Commerce Account Manager')
    public static List<B2CIAGetAccessTokenResult> getB2CAuthTokenViaJWT(List<B2CIAGetB2CAuthTokenInput> requestArguments) {

        // Initialize local variables
        Map<String, String> accountManagerConfigSettings;
        String authUrl;
        String audienceUrl;
        Map<String, Object> responseJSONMap;
        List<B2CIAGetAccessTokenResult> output;
        B2CIAGetAccessTokenResult accessTokenResult;
        String JWT;

        // Initialize the output variable
        output = new List<B2CIAGetAccessTokenResult>();

        // Get the JWT default configuration values
        accountManagerConfigSettings = B2CConfigurationManager.getAccountManagerSettings();

        // Build out the audience and authentication urls
        audienceUrl = 'https://' + accountManagerConfigSettings.get('AccountManagerUrl') + ':' + accountManagerConfigSettings.get('AccountManagerPort').toString() + accountManagerConfigSettings.get('AccountManagerSuffix');
        authUrl = 'https://' + accountManagerConfigSettings.get('AccountManagerUrl') + accountManagerConfigSettings.get('AccountManagerSuffix');

        // Iterate over the collection of Named Credentials
        for (B2CIAGetB2CAuthTokenInput b2creq: requestArguments) {

            // Create the JWT that will be used to request an authToken
            JWT = B2CJWTHelper.getJWT(
                accountManagerConfigSettings.get('JWTAlgorithm'),
                b2creq.b2cClientId,
                b2creq.jwtCertificate,
                audienceUrl,
                Integer.valueOf(accountManagerConfigSettings.get('ExpirationInMinutes'))
            );

            // Create the AccountManager authRequest -- and include the minted JWT
            HttpRequest req = B2CHttpRequestHelper.getAccountManagerAuthRequest(authUrl, JWT);

            // Initialize the http request and process-it
            Http https = new Http();
            HttpResponse res = https.send(req);

            // Initialize the variable used to process the response
            responseJSONMap = (Map<String, Object>)System.JSON.deserializeUntyped(res.getBody());

            // Initialize the accessToken result
            accessTokenResult = new B2CIAGetAccessTokenResult();

            // Seed the default properties of the resultObject
            accessTokenResult.status = res.getStatus();
            accessTokenResult.statusCode = res.getStatusCode();
            accessTokenResult.responseBody = res.getBody();
            accessTokenResult.isError = false;

            // Check if the statusCode is found in the response and the response was processed successfully
            if (accessTokenResult.statusCode == 200) {

                // Seed the response object with the access token details
                accessTokenResult.accessToken = responseJSONMap.get('access_token').toString();
                accessTokenResult.tokenType = responseJSONMap.get('token_type').toString();
                accessTokenResult.expiresIn = (Integer)responseJSONMap.get('expires_in');

            } else {

                // Otherwise, capture the error message
                accessTokenResult.errorMessage = B2CConstant.Errors_OCAPI_AccessTokenNotPresent;
                accessTokenResult.isError = true;

            }
            // Add the accessToken to the output
            output.add(accessTokenResult);

        }

        // Return the result
        return output;

    }

}
