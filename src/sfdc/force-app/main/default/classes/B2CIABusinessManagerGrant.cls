/**
 * @author Eric Schultz
 * @date January 2th, 2020
*/
public with sharing class B2CIABusinessManagerGrant {

    /**
     * @description This class is used to process the collection of inputs used to retrieve a Business Manager Grant access token from B2C Commerce.
     * When successful, it returns either an access token for the input arguments, or an error containing the fault that was processed.
     *
     * @param businessManagerGrantInputList {List<B2CIABusinessManagerGrantInput>} Represents the collection of input properties used to request an access token
     * @return {List<B2CIAGetAccessTokenResult>} Returns a result representing the access token request response (containing a token or the error
     */
    @InvocableMethod(Label='B2C: Get Business Manager Grant Access Token' Description='Retrieve a Business Manager Grant Access Token for BM User API Interactions')
    public static List<B2CIAGetAccessTokenResult> getB2CAccessTokenViaClientCredentials(
        List<B2CIABusinessManagerGrantInput> businessManagerGrantInputList
    ) {

        // Initialize local variables
        Map<String, Object> responseJSONMap;
        List<B2CIAGetAccessTokenResult> outputObj;
        B2CIAGetAccessTokenResult accessTokenResult;

        // Initialize the output object
        outputObj = new List<B2CIAGetAccessTokenResult>();

        // Iterate over the collection of Named Credentials
        for (B2CIABusinessManagerGrantInput b2creq: businessManagerGrantInputList) {
            HttpRequest req = B2CHttpRequestHelper.getBusinessManagerAuthRequest(b2creq.namedCredential, b2creq.clientId);
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
            outputObj.add(accessTokenResult);

        }

        // Return the result
        return outputObj;
    }
}