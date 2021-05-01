/**
 * @author Eric Schultz
 * @date August 11th, 2020
 *
 * @description
 */
@IsTest
public with sharing class B2CContactManagerTest {

    /**
     * @see B2CContactManager.getContactById
     * @description
     */
    @IsTest
    static void getContact() {

        Contact c = new Contact(
            LastName = 'lastname'
        );

        Database.insert( c );


        Test.startTest();

            B2CContactManager.getContactById(
                c.Id,
                true,
                B2CMetaFieldMappings.getFieldMappings('Contact')
            );

        Test.stopTest();
    }

    /**
     * @see B2CContactManager.getPublishProfile
     * @description
     */
    @IsTest
    static void getPublishProfile() {

        Contact c = new Contact(
            LastName = 'lastname'
        );

        Database.insert( c );

        Test.startTest();

            B2CContactManager.getPublishProfile(
                c,
                B2CMetaFieldMappings.getFieldMappings('Contact')
            );

        Test.stopTest();

    }

}
