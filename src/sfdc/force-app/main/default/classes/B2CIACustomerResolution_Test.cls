/**
 * @author Eric Schultz
 * @date Feb 27, 2020
 *
 * @description Test
 */
@IsTest
private class B2CIACustomerResolution_Test {

    @IsTest
    static void testFoundDuplicateByContactId() {

        Account a = new Account(
            Name = 'Account'
        );

        Database.insert( a );

        Contact c = new Contact(
            AccountId = a.Id,
            LastName = 'lastname'
        );

        Database.insert( c );

        List<List<Contact>> contactListList = new List<List<Contact>>();

        List<List<Contact>> contactDupeListList = new List<List<Contact>>();

        contactListList.add( 
            new List<Contact>{
                c
            }
        );

        Test.startTest();

            contactDupeListList = B2CIACustomerResolution.resolve(
                contactListList
            );

        Test.stopTest();

        System.assertEquals(
            contactDupeListList.size(),
            1
        );

        System.assertEquals(
            contactDupeListList[0][0].Id,
            c.Id
        );

    }


    @IsTest
    static void testFoundDuplicateByB2CCustomerId() {

        Account a = new Account(
            Name = 'Account'
        );

        Database.insert( a );

        Contact c = new Contact(
            AccountId = a.Id,
            LastName = 'lastname',
            B2C_Customer_ID__c = 'abc'
        );

        Database.insert( c );

        List<List<Contact>> contactListList = new List<List<Contact>>();

        List<List<Contact>> contactDupeListList = new List<List<Contact>>();

        contactListList.add( 
            new List<Contact>{
                new Contact(
                    B2C_Customer_ID__c = 'abc'
                )
            }
        );

        Test.startTest();

            contactDupeListList = B2CIACustomerResolution.resolve(
                contactListList
            );

        Test.stopTest();

        System.assertEquals(
            contactDupeListList.size(),
            1
        );

        System.assertEquals(
            contactDupeListList[0][0].Id,
            c.Id
        );

    }


    @IsTest
    static void testNotFoundDuplicateContactId() {

        Account a = new Account(
            Name = 'Account'
        );

        Database.insert( a );

        Contact c = new Contact(
            AccountId = a.Id,
            LastName = 'lastname',
            B2C_Customer_ID__c = 'abc'
        );

        Database.insert( c );

        List<List<Contact>> contactListList = new List<List<Contact>>();

        List<List<Contact>> contactDupeListList = new List<List<Contact>>();

        contactListList.add( 
            new List<Contact>{
                new Contact(
                    B2C_Customer_ID__c = 'def'
                )
            }
        );

        Test.startTest();

            contactDupeListList = B2CIACustomerResolution.resolve(
                contactListList
            );

        Test.stopTest();

        System.assertEquals(
            contactDupeListList.size(),
            1
        );

        System.assertNotEquals(
            contactDupeListList[0][0].Id,
            c.Id
        );

    }
}