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
        Map<String, Object> updatedResults;
        List<String> missingContactFields;
        List<String> updatedContactFields;
        SObject sourceContact;
        SObject targetContact;
        SObject targetSynchronizedContact;
        SObject clonedTargetContact;
        Contact synchronizedContact;
        Contact updatedContact;
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

            // Audit the source / target contacts before processing takes place
            System.debug(LoggingLevel.INFO, '--> sourceContact: ' + sourceContact);
            System.debug(LoggingLevel.INFO, '--> targetContact: ' + targetContact);

            // Create a new instance of the processedResult container
            processedResult = new B2CIASynchronizeContactResult();

            // Next, attempt to process the Contact and remove the read-only personAccount properties
            synchronizationResults = assignMissingFieldValues(sourceContact, targetContact);

            // Retrieve the individual values from the synchronization results
            synchronizedContact = (Contact) synchronizationResults.get('synchronizedObject');
            missingContactFields = (List<String>) synchronizationResults.get('missingFields');

            // Seed the individual values in the container denoting the synchronization results
            processedResult.sourceContact = contactToProcess.sourceContact;
            processedResult.originalTargetContact = contactToProcess.targetContact;
            processedResult.missingContactFields = missingContactFields;

            // Audit the source / target contacts after processing takes place (compare)
            System.debug(LoggingLevel.INFO, '--> origSourceContact: ' + processedResult.sourceContact);
            System.debug(LoggingLevel.INFO, '--> origTargetContact: ' + processedResult.originalTargetContact);

            // Lastly, attempt to update the Contact with any fields where direct updates were made
            targetSynchronizedContact = (SObject) synchronizedContact;

            // Audit the target synchronizedContact (for updating fields where it makes sense)
            System.debug(LoggingLevel.INFO, '--> targetSynchronizedContact: ' + targetSynchronizedContact);

            // Update changed fieldValues found in the sourceContact to the targetSynchronizedContact
            updatedResults = updateChangedFieldValues(sourceContact, targetSynchronizedContact);

            // Retrieve the individual values from the synchronization results
            updatedContact = (Contact) updatedResults.get('updatedObject');
            updatedContactFields = (List<String>) synchronizationResults.get('updatedFields');

            // Audit the updatedContact (tracking which fieldValues were updated)
            System.debug(LoggingLevel.INFO, '--> updatedContact: ' + updatedContact);

            // Map the synchronized targetContact as the updatedContact
            processedResult.synchronizedTargetContact = updatedContact;

            // Add the processedResult to the output collection
            output.add(processedResult);

        }

        // Return the output value
        return output;

    }

}
