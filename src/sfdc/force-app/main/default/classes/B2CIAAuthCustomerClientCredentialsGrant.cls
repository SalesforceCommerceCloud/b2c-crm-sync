/**
 * @author Eric Schultz
 * @date January 2th, 2020
*/
public with sharing class B2CIAAuthCustomerClientCredentialsGrant {

    /**
     * @description This class is used to process the collection of inputs used to retrieve a Client Credentials Grant access token from B2C Commerce.
     * When successful, it returns either an access token for the input arguments, or an error containing the fault that was processed.
     *
     * @param authCustomerClientInputList {List<B2CIAAuthCustomerInput>} Represents the collection of input properties used to request an access token
     * @return {List<B2CIAGetAccessTokenResult>} Returns a result representing the access token request response (containing a token or the error
     */
    @InvocableMethod(Label='B2C: Get Customer AccessToken via ClientCredential Grant' Description='Request a B2C Commerce REST API Access Token via a Client Credential Grant')
    public static List<B2CIAGetAccessTokenResult> getB2CAccessTokenViaClientCredentials(
        List<B2CIAAuthCustomerInput> authCustomerClientInputList
    ) {

        // Initialize local variables
        List<B2CIAGetAccessTokenResult> outputObj;
        B2CIAGetAccessTokenResult accessTokenResult;

        // Initialize the output object
        outputObj = new List<B2CIAGetAccessTokenResult>();

        // Iterate over the collection of Named Credentials
        for (B2CIAAuthCustomerInput b2creq: authCustomerClientInputList) {
            HttpRequest req = B2CHttpRequestHelper.getCustomerAuthRequest(b2creq.domain, b2creq.siteId, b2creq.version, b2creq.customerId, b2creq.clientId, b2creq.token);
            Http https = new Http();
            HttpResponse res = https.send(req);

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
                accessTokenResult.accessToken = res.getHeader('authorization');

                // If the accessToken is empty -- then try one more time to retrieve the authorizationHeader changing the case
                if (accessTokenResult.accessToken == null) { accessTokenResult.accessToken = res.getHeader('Authorization'); }

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
