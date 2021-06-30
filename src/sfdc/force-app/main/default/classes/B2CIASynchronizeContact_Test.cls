/**
 * @author Abraham David Lloyd
 * @date April 17th, 2021
 *
 * @description This is the test-class for the B2CIASynchronizeContact class -- and
 * exercises the Contact synchronization logic leveraged by the B2CContactProcess flow.
 */
@IsTest
private class B2CIASynchronizeContact_Test {

    @IsTest
    static void testContactSynchronization() {

        // Initialize local Variables
        List<B2CIASynchronizeContactInput> inputList;
        B2CIASynchronizeContactInput input;
        List<B2CIASynchronizeContactResult> synchronizeContactResults;
        B2CIASynchronizeContactResult synchronizeContactResult;

        // Initialize the input-list
        inputList = new List<B2CIASynchronizeContactInput>();
        input = new B2CIASynchronizeContactInput();

        // Default the sourceContact used for testing
        input.sourceContact = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
                'FirstName' => 'Test',
                'LastName' => 'Contact',
                'Email' => 'test@example.com',
                'Description' => 'Test Description',
                'Title' => 'Test Title'
        });

        // Default the target used for testing
        input.targetContact = new Contact();

        // Seed the field(s) representing the targetContact properties
        input.targetContact.put('FirstName', 'Alternate');
        input.targetContact.put('LastName', 'Contact');
        input.targetContact.put('Email', 'test@example.com');

        // Create the input list
        inputList.add(input);

        Test.startTest();

        // Attempt to synchronize the mismatched contactProperties between the source and target Contacts
        synchronizeContactResults = B2CIASynchronizeContact.synchronizeContactProperties(inputList);

        Test.stopTest();

        // Retrieve the final set of results from the result collection
        synchronizeContactResult = synchronizeContactResults.get(0);

        // Validate that the missing target-contact fields have been updated by the sourceContact
        System.assertEquals(synchronizeContactResult.missingContactFields.size(), 2, ' -- expected two fields to be missing in the targetContact; check the test-data to confirm');
        System.assertEquals(synchronizeContactResult.sourceContact.get('Description'), synchronizeContactResult.synchronizedTargetContact.get('Description'), ' -- expected the [Description] fields to be synchronized across the source / targetContacts');
        System.assertEquals(synchronizeContactResult.sourceContact.get('Title'), synchronizeContactResult.synchronizedTargetContact.get('Title'), ' -- expected the [Title] fields to be synchronized across the source / targetContacts');
        System.assertNotEquals(synchronizeContactResult.sourceContact.get('FirstName'), synchronizeContactResult.synchronizedTargetContact.get('FirstName'), ' -- expected the FirstName fields to be different across the source / targetContacts');

    }

}
