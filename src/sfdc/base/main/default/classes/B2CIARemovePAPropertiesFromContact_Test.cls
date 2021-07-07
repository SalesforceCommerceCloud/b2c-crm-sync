/**
 * @author Abraham David Lloyd
 * @date June 29th, 2021
 *
 * @description This class exercises the evaluation and removal of PersonAccount properties
 * from a given Contact record.  The Contact version of this class is a coverage pass-through
 * test-class.
 */
@IsTest
private class B2CIARemovePAPropertiesFromContact_Test {

    /**
     * @see B2CIARemovePAPropertiesFromContact.removePersonAccountProperties
     * @description This test exercises processing the removal of personAccount properties from
     * a given Contact record (or contact portion of the PersonAccount).
     */
    @IsTest
    static void testProcessContact() {

        // Define the local variables
        List<B2CIARemovePAPropertiesFromContactResult> processedContacts;
        List<B2CIARemovePAPropertiesFromContactInput> contactsToProcess;
        B2CIARemovePAPropertiesFromContactInput contactInput;

        // Initialize the input collection and input-class
        contactsToProcess = new List<B2CIARemovePAPropertiesFromContactInput>();
        contactInput = new B2CIARemovePAPropertiesFromContactInput();

        // Initialize the test Contact
        Contact testContact = new Contact(
            FirstName = 'Anonymous',
            LastName = 'Customer',
            Email = 'anonymous@b2csa.qa.salesforce.com'
        );

        // Define the contactToProcess
        contactInput.contact = testContact;
        contactsToProcess.add(contactInput);

        Test.startTest();

            // Process the contact specified and evaluate if any fields can be removed due to PersonAccount dependencies
            processedContacts = B2CIARemovePAPropertiesFromContact.removePersonAccountProperties(contactsToProcess);

        Test.stopTest();

        // Validate that the contact was processed successfully
        System.assertEquals(processedContacts.get(0).sourceContact.Email, processedContacts.get(0).processedContact.Email, 'Expected the sourceContact and processedContact emailAddresses to match');
        System.assertEquals(processedContacts.get(0).sourceContact.FirstName, processedContacts.get(0).processedContact.FirstName, 'Expected the sourceContact and processedContact firstNames to match');
        System.assertEquals(processedContacts.get(0).sourceContact.LastName, processedContacts.get(0).processedContact.LastName, 'Expected the sourceContact and processedContact lastNames to match');

    }

}
