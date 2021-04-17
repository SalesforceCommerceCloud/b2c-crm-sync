/**
 * @author Abraham David Lloyd
 * @date April 20th, 2021
 *
 * @description This is a helper class takes a given Contact record and removes any read-only
 * PersonAccount properties that may exist on the contactRecord that are not updateable.  If
 * PersonAccounts are enabled, updates to PA Contacts will fail if the Contact includes Account
 * properties that are readOnly.
*/
global with sharing class B2CIARemovePAPropertiesFromContact extends B2CBaseAttributeAssignment {

    /**
     * @description This class is used to generate Contact processing validation results for a given customerList, instance, and contact.  It
     * processes the integration permissions and active flags for these objects to determine what integration permissions are supported.
     *
     * @param contactsToProcess {List<B2CIARemovePAPropertiesFromContactResult>} Represents the collection of contactInputs used to infer contact permissions
     * @return {List<B2CIARemovePAPropertiesFromContactResult>} Represents the collection of validation results for the input arguments
     */
    @InvocableMethod(Label='B2C: Remove Read Only PersonAccount Properties from Contact' Description='Attempts to remove any readOnly PersonAccount specific properties that are present on a Contact prior to updating the contact record.')
    global static List<B2CIARemovePAPropertiesFromContactResult> removePersonAccountProperties(List<B2CIARemovePAPropertiesFromContactInput> contactsToProcess) {

        // Initialize local variables
        List<B2CIARemovePAPropertiesFromContactResult> output;
        Contact processedContact;
        SObject sObjectToProcess;
        B2CIARemovePAPropertiesFromContactResult processedResult;

        // Initialize the output list
        output = new List<B2CIARemovePAPropertiesFromContactResult>();

        // Loop over the collection of input results`
        for (B2CIARemovePAPropertiesFromContactInput contactToProcess: contactsToProcess) {

            // First, convert the contact to an sObject
            sObjectToProcess = (SObject) contactToProcess.contact;

            // Next, attempt to process the Contact and remove the read-only personAccount properties
            processedContact = (Contact) removePersonAccountProperties(sObjectToProcess);

            // Create a new instance of the processedResult container
            processedResult = new B2CIARemovePAPropertiesFromContactResult();
            processedResult.sourceContact = (Contact) processedContact;
            processedResult.processedContact = (Contact) processedContact;

            // Add the processedResult to the output collection
            output.add(processedResult);

        }

        // Return the output value
        return output;

    }

}
