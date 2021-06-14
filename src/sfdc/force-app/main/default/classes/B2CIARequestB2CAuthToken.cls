/**
 * @author Abraham David Lloyd
 * @date February 4th, 2021
 *
 * @description This is a wrapper-class to enable the retrieval of a specific
 * B2C Commerce Site via OCAPI.
*/
public with sharing class B2CIARequestB2CAuthToken {

    /**
     * @see B2CIAGetAccessTokenResult
     * @description Invokable action to retrieve a Customer Profile from B2C Commerce
     *
     * @param requestArguments {List<B2CIAGetB2CAuthTokenInput>} Represents the request arguments to process
     * @returns {List<B2CIAGetAccessTokenResult>} Returns the response object containing the authToken response details
     */
    @InvocableMethod(Label='B2C: Request a B2C AuthToken' Description='Attempts to retrieve a REST API AuthToken from the B2C Commerce Account Manager')
    public static List<B2CIAGetAccessTokenResult> getB2CAuthTokenViaJWT(List<B2CIARequestB2CAuthTokenInput> requestArguments) {

        // Initialize local variables
        List<B2C_Client_ID_Integration_History__c> auditHistoryCollection;
        B2C_Client_ID_Integration_History__c auditHistoryEntry;
        List<B2C_AuthToken__c> authTokenCollection;
        B2C_AuthToken__c authTokenEntry;
        Map<String, String> accountManagerConfigSettings;
        String authUrl;
        String audienceUrl;
        Map<String, Object> responseJSONMap;
        List<Database.SaveResult> authTokenInsertResults;
        List<B2CIAGetAccessTokenResult> output;
        B2CIAGetAccessTokenResult accessTokenResult;
        String JWT;

        // Initialize the output variable
        output = new List<B2CIAGetAccessTokenResult>();
        auditHistoryCollection = new List<B2C_Client_ID_Integration_History__c>();
        authTokenCollection = new List<B2C_AuthToken__c>();

        // Get the JWT default configuration values
        accountManagerConfigSettings = B2CConfigurationManager.getAccountManagerSettings();

        // Build out the audience and authentication urls
        audienceUrl = accountManagerConfigSettings.get('AccountManagerUrl') + ':' + String.valueOf(accountManagerConfigSettings.get('AccountManagerPort')) + accountManagerConfigSettings.get('AccountManagerSuffix');
        authUrl = accountManagerConfigSettings.get('AccountManagerUrl') + accountManagerConfigSettings.get('AccountManagerSuffix');

        // Iterate over the collection of Named Credentials
        for (B2CIARequestB2CAuthTokenInput b2creq: requestArguments) {

            // Initialize the authToken and auditHistory details
            auditHistoryEntry = new B2C_Client_ID_Integration_History__c();
            authTokenEntry = new B2C_AuthToken__c();

            // Create the JWT that will be used to request an authToken
            JWT = B2CJWTHelper.getJWT(
                accountManagerConfigSettings.get('JWTSFCCAlgorithm'),
                accountManagerConfigSettings.get('JWTSFDCAlgorithm'),
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

                // Flag that the token exists in the audit details
                auditHistoryEntry.Auth_Token_Value__c = accessTokenResult.accessToken;
                auditHistoryEntry.Has_Token__c = true;

                // Define the authToken details
                authTokenEntry.Name = accessTokenResult.accessToken;
                authTokenEntry.B2C_Client_ID__c = b2creq.Id;

            } else {

                // Otherwise, capture the error message
                accessTokenResult.errorMessage = B2CConstant.Errors_OCAPI_AccessTokenNotPresent;
                accessTokenResult.isError = true;

            }

            // Was an authToken recorded? If so, add it to the tokenCollection
            if (authTokenEntry.Name != null) { authTokenCollection.add(authTokenEntry); }

            // Should the authRequest attempt be audited?
            if (b2creq.auditAuthenticationAPIInteractions == true) {

                // Map the clientId and request body to the audit history
                auditHistoryEntry.Account_Manager_Url__c = authUrl;
                auditHistoryEntry.B2C_Client_ID__c = b2creq.Id;
                auditHistoryEntry.Integration_Payload__c = req.getBody();
                auditHistoryEntry.Status_Code__c = accessTokenResult.statusCode;
                auditHistoryEntry.Has_Error__c = accessTokenResult.isError;
                auditHistoryEntry.Integration_JSON__c = accessTokenResult.responseBody;

                // Add the auditHistory entry to the audit collection
                auditHistoryCollection.add(auditHistoryEntry);

            }

            // Add the accessToken to the output
            output.add(accessTokenResult);

        }

        // Was an authToken recorded?  If so, then persist the token for future requests
        if (authTokenCollection.size() > 0) {

            // Audit the results and allow partial failures
            authTokenInsertResults = Database.insert(authTokenCollection, false);

        }

        // If the auditHistoryCollection has entries -- then record the entries
        if (auditHistoryCollection.size() > 0) {

            // Update the auditHistory collection entries with the authToken identifiers
            auditHistoryCollection = applyAuthTokenToAuditHistory(authTokenCollection, authTokenInsertResults, auditHistoryCollection);

            // record the auditHistory details
            Database.insert(auditHistoryCollection, false);

        }

        // Return the result
        return output;

    }

    /**
     * @private
     * @see B2CIARequestB2CAuthToken.getB2CAuthTokenViaJWT
     * @description Helper method to apply authToken details to auditHistory entries (completes the relationship math between
     * the authToken, B2C Client ID, and the integration history record).
     *
     * @param authTokenCollection {List<B2C_AuthToken__c>} Represents the collection of processed authTokens
     * @param authTokenInsertResults {List<Database.SaveResult>} Represents the collection of insert-results for authTokens
     * @param auditHistoryCollection {List<B2C_Client_ID_Integration_History__c>} Represents the authToken request integration history
     * @return {List<B2C_Client_ID_Integration_History__c>} Returns the updated collection containing the authToken reference identifier
     */
    private static List<B2C_Client_ID_Integration_History__c> applyAuthTokenToAuditHistory(
        List<B2C_AuthToken__c> authTokenCollection,
        List<Database.SaveResult> authTokenInsertResults,
        List<B2C_Client_ID_Integration_History__c> auditHistoryCollection
    ) {

        // Initialize local variables
        Map<String, String> authTokenMap;
        Database.SaveResult thisInsertResult;
        List<B2C_Client_ID_Integration_History__c> updatedIntegrationHistory;
        Integer authTokenCount;

        // Initialize the authToken map
        authTokenMap = new Map<String, String>();
        updatedIntegrationHistory = new List<B2C_Client_ID_Integration_History__c>();

        // Default the authToken count
        authTokenCount = 0;

        // Build out the authToken map by iterating over the collection
        for (B2C_AuthToken__c thisAuthToken : authTokenCollection) {

            // Does the authToken map contain a reference to the current authToken?
            if (authTokenMap.containsKey(thisAuthToken.Name) == false && authTokenCount < authTokenInsertResults.size()) {

                // Retrieve the insertResult that is mapped to the current authToken
                thisInsertResult = authTokenInsertResults.get(authTokenCount);

                // Was the insert successful for this authToken?
                if (thisInsertResult.isSuccess() == true) {

                    // If so, then add the authToken identifier to the map
                    authTokenMap.put(thisAuthToken.Name, thisInsertResult.getId());

                }

            }

            // Increment the authToken Count
            authTokenCount++;

        }

        // Loop over the integrationHistory collection and evaluate each entry
        for (B2C_Client_ID_Integration_History__c thisIntegrationHistoryEntry : auditHistoryCollection) {

            // Does this entry have a related token -- and is that authToken in the map?
            if (thisIntegrationHistoryEntry.Has_Token__c == true && authTokenMap.containsKey(thisIntegrationHistoryEntry.Auth_Token_Value__c)) {
                thisIntegrationHistoryEntry.B2C_AuthToken__c = authTokenMap.get(thisIntegrationHistoryEntry.Auth_Token_Value__c);
            }

            // Add the updated integrationHistory entry to the new collection
            updatedIntegrationHistory.add(thisIntegrationHistoryEntry);

        }

        // Return the updated integrationHistory collection
        return updatedIntegrationHistory;

    }

}
