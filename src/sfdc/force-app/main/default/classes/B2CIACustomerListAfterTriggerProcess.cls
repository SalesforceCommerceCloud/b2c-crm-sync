/**
 * @author Abraham David Lloyd
 * @date May 15th, 2021
 *
 * @description This class allows us to leverage a common flow as an after-insert or
 * after-update trigger on B2C CustomerLists.  We're creating an IA that can be used
 * to invoke a common flow for both scenarios -- as you cannot invoke sub-flows from
 * an after-trigger.
*/
public with sharing class B2CIACustomerListAfterTriggerProcess {

    /**
     * @description Invocable action to invoke a flow to push downstream B2C CustomerList
     * property updates (like ClientID) to child B2C Site definitions.
     *
     * @param customerLists {List<CustomerList>} A collection of customerLists that are processed by the parent flow.
     */
    @InvocableMethod(Label='B2C: CustomerList After Trigger Process' Description='Takes the existing collection of B2C CustomerLists and applies key values to child Sites that are missing them.')
    public static void resolve(List<B2C_CustomerList__c> customerLists) {

        // Initialize local variables
        Map<String, Object> flowProperties;
        Flow.Interview flowInterview;

        // Build the filterMap
        flowProperties = new Map<String, Object>();
        flowProperties.put('B2CCustomerLists', customerLists);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        flowInterview = Flow.Interview.createInterview('B2CCommerce_CustomerLists_ApplyClientIDToSites', flowProperties);

        // Initialize the flow and start it
        flowInterview.start();

    }

}
