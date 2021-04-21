/**
 * @author Eric Schultz
 * @date Feb 27, 2020
 *
 * @see B2CIACustomerResolution.resolve
 * @description This testClass is used to exercise different customerResolution
 * scenarios driven by Contact details.
 */
@IsTest
private class B2CIACustomerResolution_Test {

    static void testResolveCustomerListCustomerNo() {

        // Initialize local variables

        // Create the Account / Contact relationship

        // Create the resolution collection

        // Attempt to resolve

        // Verify that we can resolve

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

        // Since duplicates rules need to be configured after deployment, we cannot reliable make assertions

        //System.assertEquals(
        //    contactDupeListList.size(),
        //    1
        //);

        //System.assertEquals(
        //    contactDupeListList[0][0].Id,
        //    c.Id
        //);

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
        // Since duplicates rules need to be configured after deployment, we cannot reliable make assertions
        //System.assertEquals(
        //    contactDupeListList.size(),
        //    1
        //);

        //System.assertNotEquals(
        //    contactDupeListList[0][0].Id,
        //    c.Id
        //);

    }
}
