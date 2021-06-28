/**
 * @author Eric Schultz
 * @date April 16, 2020
 *
 * @description This test exercises the retrieval of contactDetails.
 */
@IsTest
private class B2CIAGetContact_Test {

    @IsTest
    static void testGetContact() {

        // Initialize local variables
        List<B2CIAGetContactInput> requestArguments = new List<B2CIAGetContactInput>();
        B2CIAGetContactInput input = new B2CIAGetContactInput();

        // Create a contact that we're exercising
        Contact c = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'LastName' => 'lastname'
        });

        // Capture the contactId and build the request arguments
        input.crmContactId = c.Id;
        requestArguments.add( input );

        Test.startTest();

            // Retrieve the contact details using the specified contact collection
            List<B2CIAGetContactResult> results = B2CIAGetContact.getContact(
                requestArguments
            );

        Test.stopTest();

        // Verify that the contact retrieved is what we expected
        System.assertEquals(results[0].crmContactId, input.crmContactId, 'Expected the contactIds to be aligned');

    }

    @IsTest
    static void testGetContactOmitAccountId() {

        // Initialize local variables
        List<B2CIAGetContactInput> requestArguments = new List<B2CIAGetContactInput>();
        B2CIAGetContactInput input = new B2CIAGetContactInput();
        String AccountId;
        Boolean threwError = false;

        // Create a contact that we're exercising
        Contact c = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'LastName' => 'lastname'
        });

        // Capture the contactId and build the request arguments
        input.crmContactId = c.Id;
        input.omitAccountId = true;
        requestArguments.add( input );

        Test.startTest();

            // Retrieve the contact details using the specified contact collection
            List<B2CIAGetContactResult> results = B2CIAGetContact.getContact(
                requestArguments
            );

            // Attempt to retrieve the accountId -- recognizing that we don't expect it to exist
            AccountId = String.valueOf(results[0].crmContact.get('AccountId'));

        Test.stopTest();

        // Verify that the contact retrieved is what we expected
        System.assertEquals(results[0].crmContactId, input.crmContactId, 'Expected the contactIds to be aligned');
        System.assertEquals(AccountId, null, 'Expected the AccountId to be null / not populated');

    }

}
