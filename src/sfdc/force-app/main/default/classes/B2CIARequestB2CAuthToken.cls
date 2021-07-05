/**
 * @author Abraham David Lloyd
 * @date February 4th, 2021
 *
 * @description This is a wrapper-class to enable the retrieval of a specific
 * B2C Commerce Site via OCAPI.
*/
//noinspection ApexUnusedDeclaration
public with sharing class B2CIARequestB2CAuthToken {

    /**
     * @see B2CIAGetAccessTokenResult
     * @description Invokable action to retrieve a Customer Profile from B2C Commerce
     *
     * @param requestArguments {List<B2CIAGetB2CAuthTokenInput>} Represents the request arguments to process
     * @return {List<B2CIARequestB2CAuthTokenResult>} Returns the response object with the authToken response details
     */
    @InvocableMethod(
        Callout=true
        Label='B2C: Request a B2C AuthToken'
        Description='Attempts to retrieve a REST API AuthToken from the B2C Commerce Account Manager'
    )
    public static List<B2CIARequestB2CAuthTokenResult> getB2CAuthTokenViaJWT(
        List<B2CIARequestB2CAuthTokenInput> requestArguments
    ) {

        // Initialize local variables
        Map<String, String> accountManagerConfigSettings;
        String authUrl;
        String audienceUrl;
        List<B2CIARequestB2CAuthTokenResult> output;
        B2CIARequestB2CAuthTokenResult accessTokenResult;
        JSONParse parsedJSON;
        String jwt;

        // Initialize the output variable
        output = new List<B2CIARequestB2CAuthTokenResult>();

        // Get the JWT default configuration values
        accountManagerConfigSettings = B2CConfigurationManager.getAccountManagerSettings();

        // Build out the audience and authentication urls
        audienceUrl = accountManagerConfigSettings.get('AccountManagerUrl') + ':' +
            accountManagerConfigSettings.get('AccountManagerPort') +
            accountManagerConfigSettings.get('AccountManagerSuffix');

        // Build out the authenticationUrl
        authUrl = accountManagerConfigSettings.get('AccountManagerUrl') +
            accountManagerConfigSettings.get('AccountManagerSuffix');

        // Iterate over the collection of Named Credentials
        for (B2CIARequestB2CAuthTokenInput requestInput: requestArguments) {

            // Create the JWT that will be used to request an authToken
            jwt = B2CJWTHelper.getJWT(
                accountManagerConfigSettings.get('JWTSFCCAlgorithm'),
                accountManagerConfigSettings.get('JWTSFDCAlgorithm'),
                requestInput.b2cClientId,
                requestInput.jwtCertificate,
                audienceUrl,
                Integer.valueOf(accountManagerConfigSettings.get('ExpirationInMinutes'))
            );

            // Create the AccountManager authRequest -- and include the minted JWT
            HttpRequest req = B2CHttpRequestHelper.getAccountManagerAuthRequest(authUrl, jwt);

            // Initialize the http request and process-it
            Http https = new Http();
            HttpResponse res = https.send(req);

            // Parse the JSON so that we can format the body content
            parsedJSON = new JSONParse(res.getBody());

            // Initialize the accessToken result
            accessTokenResult = new B2CIARequestB2CAuthTokenResult();

            // Seed the parent b2cClientID property values
            accessTokenResult.b2cClientIdRecordId = requestInput.b2cClientIdRecordId;
            accessTokenResult.b2cClientId = requestInput.b2cClientId;
            accessTokenResult.auditAuthenticationAPIInteractions = requestInput.auditAuthenticationAPIInteractions;
            accessTokenResult.accountManagerUrl = authUrl;
            accessTokenResult.bypassAuthTokenAuditing = requestInput.bypassAuthTokenAuditing;
            accessTokenResult.persistAuthToken = Boolean.valueOf(accountManagerConfigSettings.get('PersistAuthTokens'));

            // Seed the default properties of the resultObject
            accessTokenResult.status = res.getStatus();
            accessTokenResult.statusCode = res.getStatusCode();
            accessTokenResult.requestBody = req.getBody();
            accessTokenResult.responseBody = parsedJSON.toStringPretty();
            accessTokenResult.isError = false;

            // Check if the statusCode is found in the response and the response was processed successfully
            if (accessTokenResult.statusCode == 200) {

                // Seed the response object with the access token details
                accessTokenResult.accessToken = parsedJSON.get('access_token').getStringValue();
                accessTokenResult.tokenType = parsedJSON.get('token_type').getStringValue();
                accessTokenResult.expiresIn = parsedJSON.get('expires_in').getIntegerValue();

            } else {

                // Otherwise, capture the error message
                accessTokenResult.errorMessage = B2CConstant.ERRORS_OCAPI_ACCESSTOKENNOTPRESENT;
                accessTokenResult.isError = true;

            }

            // Add the accessToken to the output
            output.add(accessTokenResult);

        }

        // Return the result
        return output;

    }

}
