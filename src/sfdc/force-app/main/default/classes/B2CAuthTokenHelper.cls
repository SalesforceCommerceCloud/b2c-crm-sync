/**
 * @author Abraham David Lloyd
 * @date June 16th, 2021
 *
 * @description This class is a helper class used to record and audit B2C AuthTokens.
 * This logic is exposed as a future method so that we can embed the authToken call-out
 * with other REST API callouts exposed as invocable actions.
 */
public class B2CAuthTokenHelper {

    /**
     * @description Helper function to retrieve an Account Manager / B2C Commerce REST API authToken.  This function
     * calls a flow that abstracts either retrieving the authToken from cache -- or requesting a new authToken
     * directly from B2C Commerce's Account Manager.
     *
     * @param B2CClientID {B2C_Client_ID__c} Represents the ClientID that will be used to retrieve / request
     * a new B2C AuthToken from the configured AccountManager instance.
     * @return {Map<String, Object>} Returns the collection of return values from the source flow
     */
    public static Map<String, Object> getB2CAuthToken(B2C_Client_ID__c B2CClientID) {

        // Initialize local variables
        Flow.Interview getAuthTokenFlow;
        Map<String, Object> flowArguments;
        Map<String, Object> output;

        // Initialize the output variable
        output = new Map<String, Object>();

        // Initialize the flow arguments
        flowArguments = new Map<String, Object>();
        flowArguments.put('B2CClientID', B2CClientID);

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

}
