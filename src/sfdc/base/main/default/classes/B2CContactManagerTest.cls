/**
 * @author Eric Schultz
 * @date August 11th, 2020
 *
 * @description This test is used to exercise the B2CContactManager class.
 */
@IsTest
public with sharing class B2CContactManagerTest {

    /**
     * @see B2CContactManager.getContactById
     * @description Validate that we can retrieve a contact by the Id.
     */
    @IsTest
    static void getContact() {

        // Initialize local Variables
        Contact testContact;
        Contact c = new Contact(LastName = 'lastname');

        // Create the contact
        Database.insert( c );

        Test.startTest();

            // Attempt to retrieve the contact record
            testContact = B2CContactManager.getContactById(
                c.Id,
                true,
                B2CMetaFieldMappings.getFieldMappings('Contact')
            );

        Test.stopTest();

        // Validate that the contact was retrieved
        System.assert(testContact != null, 'Expected to retrieve a contactRecord using the Id specified');

    }

    /**
     * @see B2CContactManager.getPublishProfile
     * @description This method is used to verify that we can retrieve a publish profile for an existing Contact.
     */
    @IsTest
    static void getPublishProfile() {

        // Initialize local Variables
        String errorMessage;
        Map<String, Object> testContact;
        Contact c = new Contact(LastName = 'lastname');

        // Create the contact
        Database.insert( c );

        Test.startTest();

            // Attempt to retrieve the publish profile
            testContact = B2CContactManager.getPublishProfile(
                c,
                B2CMetaFieldMappings.getFieldMappings('Contact')
            );

        Test.stopTest();

        // Default the error message
        errorMessage = 'Expected to retrieve a publishProfile containing the lastName key';

        // Validate that the publish profile was retrieved
        System.assert(testContact.containsKey('last_name'), errorMessage);

    }

}
