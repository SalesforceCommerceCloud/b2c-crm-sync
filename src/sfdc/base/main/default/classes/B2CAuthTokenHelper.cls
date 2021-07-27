/**
 * @author Abraham David Lloyd
 * @date June 16th, 2021
 *
 * @description This class is a helper class used to record and audit B2C AuthTokens.
 * This logic is exposed as a future method so that we can embed the authToken call-out
 * with other REST API callouts exposed as invocable actions.
 */
public with sharing class B2CAuthTokenHelper {

    /**
     * @description Helper function to retrieve an Account Manager / B2C Commerce REST API authToken.  This function
     * calls a flow that abstracts either retrieving the authToken from cache -- or requesting a new authToken
     * directly from B2C Commerce's Account Manager.
     *
     * @param b2cClientId {B2C_Client_ID__c} Represents the ClientID that will be used to retrieve / request
     * a new B2C AuthToken from the configured AccountManager instance.
     * @param byPassAuthTokenAuditing {Boolean} Describes if the authToken should be audited
     * @return {Map<String, Object>} Returns the collection of return values from the source flow
     */
    public static Map<String, Object> getB2CAuthToken(B2C_Client_ID__c b2cClientId, Boolean byPassAuthTokenAuditing) {

        // Initialize local variables
        Flow.Interview getAuthTokenFlow;
        Map<String, Object> flowArguments;
        Map<String, Object> output;

        // Provide a default for the bypass-flag if one isn't provided
        if (byPassAuthTokenAuditing == null) { byPassAuthTokenAuditing = false; }

        // Initialize the output variable
        output = new Map<String, Object>();

        // Initialize the flow arguments
        flowArguments = new Map<String, Object>();
        flowArguments.put('B2CClientID', b2cClientId);
        flowArguments.put('BypassAuthTokenAuditing', byPassAuthTokenAuditing);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        getAuthTokenFlow = Flow.Interview.createInterview('B2CCommerce_B2CClientID_B2CAuthTokenGet', flowArguments);

        // Initialize the flow and start it
        getAuthTokenFlow.start();

        // Seed the output variable with the flow results
        output.put('IsSuccess', Boolean.valueOf(getAuthTokenFlow.getVariableValue('IsSuccess')));
        output.put('ErrorMessage', String.valueOf(getAuthTokenFlow.getVariableValue('ErrorMessage')));
        output.put('B2CAuthToken', String.valueOf(getAuthTokenFlow.getVariableValue('B2CAuthToken')));
        output.put('ResponseBody', String.valueOf(getAuthTokenFlow.getVariableValue('ResponseBody')));

        // Return the output variable
        return output;

    }

    /**
     * @description Helper function to retrieve a B2C ClientID for the purpose of
     * retrieving a B2C AuthToken.
     *
     * @param b2cClientIdValue {String} Represents the ClientID that will be used to retrieve / request
     * a new B2C AuthToken from the configured AccountManager instance.
     * @param byPassAuthTokenAuditing {Boolean} Describes if the authToken should be audited
     * @return {String} Returns the authToken that was retrieved
     */
    public static String getB2CAuthTokenByClientIDValue(String b2cClientIdValue, Boolean byPassAuthTokenAuditing) {

        // Initialize local variables
        List<B2C_Client_ID__c> thisClientID;
        Map<String, Object> flowResults;
        Boolean isSuccess;
        List<String> errorMessages;
        String b2cAuthToken;

        if (
            B2C_Client_ID__c.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_Client_ID__c.fields.Id.isAccessible() &&
            Schema.SObjectType.B2C_Client_ID__c.fields.Name.isAccessible() &&
            Schema.SObjectType.B2C_Client_ID__c.fields.Is_Active__c.isAccessible() &&
            Schema.SObjectType.B2C_Client_ID__c.fields.Is_Certificate_Verified__c.isAccessible() &&
            Schema.SObjectType.B2C_Client_ID__c.fields.Audit_Authentication_API_Interactions__c.isAccessible() &&
            Schema.SObjectType.B2C_Client_ID__c.fields.JWT_Certificate_Name__c.isAccessible()
        ) {

            // Create a reference to the associated B2C ClientID value
            thisClientID = [
                SELECT  Id,
                        Name,
                        Is_Active__c,
                        Is_Certificate_Verified__c,
                        Audit_Authentication_API_Interactions__c,
                        JWT_Certificate_Name__c,
                        IsDeleted
                FROM    B2C_Client_ID__c
                WHERE   Id = :b2cClientIdValue
                LIMIT   1
            ];

            // Retrieve the authToken for the associated B2C ClientID
            flowResults = getB2CAuthToken(thisClientID.get(0), byPassAuthTokenAuditing);

            // Create local references to the flowResult variables
            isSuccess = Boolean.valueOf(flowResults.get('IsSuccess'));
            errorMessages = (List<String>) flowResults.get('ErrorMessage');
            b2cAuthToken = String.valueOf(flowResults.get('B2CAuthToken'));

        }

        // Return the authToken value
        return b2cAuthToken;

    }

}
