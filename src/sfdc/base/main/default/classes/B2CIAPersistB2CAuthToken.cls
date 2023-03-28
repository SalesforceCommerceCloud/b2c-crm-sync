/**
 * @author Abraham David Lloyd
 * @date June 22nd, 2021
 *
 * @description This is a helper invocable-action designed to persist B2C AuthTokens and
 * audit their creation (provides logging specific to the creation of authTokens).
*/
//noinspection ApexUnusedDeclaration
public with sharing class B2CIAPersistB2CAuthToken {

    /**
     * @see B2CIARequestB2CAuthToken.getB2CAuthTokenViaJWT
     * @description Helper method to persist authTokens and their audit histories.  We expose this as a queueable
     * method so that we can include it in-between REST API call-outs that are exposed in our flows.
     *
     * @param authTokenResults {List<B2CIARequestB2CAuthTokenResult>} Represents the persisted authToken results
     */
    @InvocableMethod(Label='B2C: Persist and Audit B2C AuthToken' Description='Attempts to persist and audit any B2C AuthTokens requested from the B2C Commerce Account Manager environment.')
    public static void persistAndAuditB2CAuthToken(List<B2CIARequestB2CAuthTokenResult> authTokenResults) {

        // Initialize local variables
        Map<String, String> accountManagerConfigSettings;
        List<B2C_AuthToken__c> authTokens;
        B2C_AuthToken__c authToken;
        List<B2C_Client_ID_Integration_History__c> integrationHistory;
        B2C_Client_ID_Integration_History__c integrationHistoryEntry;
        Boolean hasB2CAuthToken;
        Map<String, String> authTokenIds;
        Integer integrationHistoryEntryIndex;

        // Get the JWT default configuration values
        accountManagerConfigSettings = B2CConfigurationManager.getAccountManagerSettings();

        // Initialize the authTokens collection(s)
        authTokens = new List<B2C_AuthToken__c>();
        authTokenIds = new Map<String, String>();
        integrationHistory = new List<B2C_Client_ID_Integration_History__c>();
        integrationHistoryEntryIndex = 0;

        // Loop over the collection of authToken results
        for (B2CIARequestB2CAuthTokenResult thisAuthTokenResult : authTokenResults) {

            // If we should bypass authToken auditing -- continue and exit-early
            if (thisAuthTokenResult.bypassAuthTokenAuditing == true) { continue; }

            // Shorthand B2C AuthToken validation
            hasB2CAuthToken = (thisAuthTokenResult.accessToken == null) ? false : true;

            // Should the authToken be persisted?
            if (thisAuthTokenResult.persistAuthToken == true) {

                // Was a B2C AuthToken returned?
                if (hasB2CAuthToken) {

                    // If so, create an instance of the authToken
                    authToken = new B2C_AuthToken__c(
                        B2C_Client_ID__c = thisAuthTokenResult.b2cClientIdRecordId,
                        B2C_AuthToken__c = thisAuthTokenResult.accessToken
                    );

                    // Create the collection of authTokens to process
                    authTokens.add(authToken);

                }

                // Is auditing enabled for the current authToken?
                if (thisAuthTokenResult.auditAuthenticationAPIInteractions == true) {

                    // Create the integration history entry for the authToken request
                    integrationHistoryEntry = new B2C_Client_ID_Integration_History__c(
                        B2C_Client_ID__c = thisAuthTokenResult.b2cClientIdRecordId,
                        Auth_Token_Value__c = thisAuthTokenResult.accessToken,
                        Account_Manager_Url__c = thisAuthTokenResult.accountManagerUrl,
                        Status_Code__c = thisAuthTokenResult.statusCode,
                        Has_Token__c = (thisAuthTokenResult.accessToken == null) ? false : true,
                        Has_Error__c = thisAuthTokenResult.isError,
                        Integration_Message__c = thisAuthTokenResult.errorMessage,
                        Integration_Payload__c = thisAuthTokenResult.requestBody,
                        Integration_JSON__c = thisAuthTokenResult.responseBody
                    );

                    // Add the current integration history entry to the over-arching history
                    integrationHistory.add(integrationHistoryEntry);

                }

            }

        }

        // Was at least one (1) authToken processed?
        if (authTokens.size() > 0 &&
            B2C_AuthToken__c.SObjectType.getDescribe().isAccessible() &&
            B2C_AuthToken__c.SObjectType.getDescribe().isCreateable()) {

            // Insert the authTokens and collect the results
            insert(authTokens);

            // Create the authTokenId map / Id quickReference
            for (B2C_AuthToken__c thisAuthToken : authTokens) {
                authTokenIds.put(thisAuthToken.B2C_AuthToken__c, thisAuthToken.Id);
            }

        }

        // Was at least (1) authToken integration event audited?
        if (integrationHistory.size() > 0 &&
            B2C_Client_ID_Integration_History__c.SObjectType.getDescribe().isAccessible() &&
            B2C_Client_ID_Integration_History__c.SObjectType.getDescribe().isCreateable()) {

            // Loop over the collection of integrationHistory entries
            for (B2C_Client_ID_Integration_History__c thisIntegrationHistoryEntry : integrationHistory) {

                // Assign the authToken identifier using the tokenValue as a reference point
                thisIntegrationHistoryEntry.B2C_AuthToken__c = authTokenIds.get(thisIntegrationHistoryEntry.Auth_Token_Value__c);

                // Re-seed the integrationHistory entry back in its ordinal position
                integrationHistory.set(integrationHistoryEntryIndex, thisIntegrationHistoryEntry);

                // Increase the integrationHistory index
                integrationHistoryEntryIndex ++;

            }

            // Insert the collection of history entries
            insert(integrationHistory);

        }

    }

}
