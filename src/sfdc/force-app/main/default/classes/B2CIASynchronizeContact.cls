/**
 * @author Abraham David Lloyd
 * @date April 20th, 2021
 *
 * @description This is a helper class takes a source and target Contact record and
 * applies the values present in the sourceContact to the targetContact.
*/
public with sharing class B2CIASynchronizeContact extends B2CBaseAttributeAssignment {

    /**
     * @description This class is used to take a given source and target contact, and apply any source values to the target contact
     * that are not already set.  This allows users to create contacts with fieldValues that live outside of the initially supported
     * property-set.
     *
     * @param contactsToProcess {List<B2CIASynchronizeContactInput>} Represents the source and target contacts to be evaluated and synchronized
     * @return {List<B2CIARemovePAPropertiesFromContactResult>} Represents the processed source and target contact results
     */
    @InvocableMethod(Label='B2C: Synchronize Contact Values' Description='Attempts to apply any sourceContact properties that do not exist on a targetContact.')
    public static List<B2CIASynchronizeContactResult> synchronizeContactProperties(List<B2CIASynchronizeContactInput> contactsToProcess) {

        // Initialize local variables
        List<B2CIASynchronizeContactResult> output;
        Map<String, Object> synchronizationResults;
        List<String> missingContactFields;
        SObject sourceContact;
        SObject targetContact;
        SObject clonedTargetContact;
        Contact synchronizedContact;
        B2CIASynchronizeContactResult processedResult;

        // Initialize the output lists
        missingContactFields = new List<String>();
        output = new List<B2CIASynchronizeContactResult>();

        // Loop over the collection of input results
        for (B2CIASynchronizeContactInput contactToProcess: contactsToProcess) {

            // First, convert the contacts to sObjects
            sourceContact = (SObject) contactToProcess.sourceContact;
            targetContact = (SObject) contactToProcess.targetContact;
            clonedTargetContact = targetContact.clone(true, true);

            // Next, attempt to process the Contact and remove the read-only personAccount properties
            synchronizationResults = assignMissingFieldValues(sourceContact, targetContact);

            // Retrieve the individual values from the synchronization results
            synchronizedContact = (Contact) synchronizationResults.get('synchronizedObject');
            missingContactFields = (List<String>) synchronizationResults.get('missingFields');

            // Create a new instance of the processedResult container
            processedResult = new B2CIASynchronizeContactResult();

            // Seed the individual values in the container denoting the synchronization results
            processedResult.sourceContact = contactToProcess.sourceContact;
            processedResult.originalTargetContact = contactToProcess.targetContact;
            processedResult.synchronizedTargetContact = synchronizedContact;
            processedResult.missingContactFields = missingContactFields;

            // Add the processedResult to the output collection
            output.add(processedResult);

        }

        // Return the output value
        return output;

    }

}
