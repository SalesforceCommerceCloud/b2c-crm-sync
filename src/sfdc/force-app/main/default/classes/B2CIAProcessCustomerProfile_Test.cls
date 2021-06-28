/**
 * @author Eric Schultz
 * @date April 16, 2020
 *
 * @description This class is used to exercise the processCustomerProfile class and
 * exercise the logic used to interact / synchronize with B2C Commerce customerProfiles.
 */
@IsTest
private class B2CIAProcessCustomerProfile_Test {

    @IsTest
    static void testProcessCustomerProfileUpdateSuccess() {

        // Initialize local variables
        List<B2CIAGetCustomerProfileResult> requestArguments = new List<B2CIAGetCustomerProfileResult>();
        B2CIAGetCustomerProfileResult input = new B2CIAGetCustomerProfileResult();
        Contact updatedContact;

        // Create a test contact that we'll exercise
        Contact c = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'firstName',
            'LastName' => 'originalLastName',
            'Email' => 'test-user@b2csa.qa.salesforce.com'
        });

        // Seed the request arguments
        input.crmContactId = c.Id;
        input.responseBody = '{"last_name": "updatedLastName"}';
        requestArguments.add(input);

        Test.startTest();

            // Attempt to update the customerProfiles using the properties / specified
            B2CIAProcessCustomerProfile.updateCustomerProfiles(requestArguments);

            // Retrieve the updatedContact using the same fields
            updatedContact = [SELECT Id, FirstName, LastName, Email FROM Contact WHERE Id = :c.Id];

        Test.stopTest();

        // Validate that the specific customerProfile updates were processed successfully
        System.assertEquals(updatedContact.LastName,'updatedLastName', 'Expected the lastName for the contact to be updated with the responseBody contents');

    }

    @IsTest
    static void testProcessCustomerProfileNoUpdateSuccess() {

        // Initialize local variables
        List<B2CIAGetCustomerProfileResult> requestArguments = new List<B2CIAGetCustomerProfileResult>();
        B2CIAGetCustomerProfileResult input = new B2CIAGetCustomerProfileResult();
        Contact updatedContact;

        // Create a test contact that we'll exercise
        Contact c = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'firstName',
            'LastName' => 'originalLastName',
            'Email' => 'test-user@b2csa.qa.salesforce.com'
        });

        // Seed the request arguments
        input.crmContactId = c.Id;
        input.responseBody = '{}';
        requestArguments.add(input);

        Test.startTest();

        // Attempt to update the customerProfiles using the properties / specified
        B2CIAProcessCustomerProfile.updateCustomerProfiles(requestArguments);

        // Retrieve the updatedContact using the same fields
        updatedContact = [SELECT Id, FirstName, LastName, Email, Last_Platform_Event_Applied_Updates__c FROM Contact WHERE Id = :c.Id];

        Test.stopTest();

        // Validate that the specific customerProfile updates were processed successfully -- but no updates were made
        System.assertEquals(updatedContact.Last_Platform_Event_Applied_Updates__c, false, 'Expected that no platformEvent updates were processed');

    }

}
