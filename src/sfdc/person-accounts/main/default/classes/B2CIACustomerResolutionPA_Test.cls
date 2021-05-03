/**
 * @author Eric Schultz
 * @date April 21th, 2021
 *
 * @description
 * Tests included
 *      Matches by customerid
 *      Matches customerno and customerlist
 *      Does not match 2 contacts spanning different customerlists
 *      Matches just last name and email
 *      Does not match contact with different last name
 *      Matches email, last name, customer list id
 *      Does not match different customer ids
*/

@IsTest
private class B2CIACustomerResolutionPA_Test {

    @TestSetup static void setup() {
        B2C_CustomerList__c customerList = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
            'Name' => 'customerList',
            'Is_Active__c' => true,
            'API_Url__c' => 'https://www.salesforce.com',
            'B2C_Instance__r.Is_Active__c' => true,
            'B2C_Instance__r.API_Url__c' => 'https://www.salesforce.com',
            'Enable_Profile_Publishing__c' => true,
            'Enable_Profile_Creation__c' => true
        });
    }

    /**
     * @see B2CIACustomerResolution.resolve
     * @description
     * Given
     *      Existing person account with a last name, email, customer id
     * When
     *      We resolve with a customer with a different last name, email, but same customer id
     * Then
     *      We will be returned the existing person account
     */
    /* */
    @IsTest
    static void resolvesCustomerId() {

        Account account = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'PersonEmail' => 'differntemail@email.com',
            'LastName' => 'DifferentLastName',
            'B2C_Customer_ID__pc' => 'customerid',
            'RecordTypeId' => [SELECT Id FROM RecordType WHERE DeveloperName = 'PersonAccount' LIMIT 1].Id
        });

        Contact c1 = new Contact(
            Email = 'email@email.com',
            LastName = 'LastName',
            B2C_Customer_ID__c = 'customerid'
        );

        List<List<Contact>> contactResolvedList = new List<List<Contact>>();
        List<Contact> contactFilteredList = new List<Contact>();

        Test.startTest();

            contactResolvedList = B2CIACustomerResolution.resolve(
                new List<Contact>{ c1 }
            );

            Map<String, Object> contactFilterMap = new Map<String, Object>();

            contactFilterMap.put(
                'Contact',
                c1
            );

            contactFilterMap.put(
                'ContactMatches',
                contactResolvedList[0]
            );

            Flow.Interview.B2C_Commerce_Contact_Filter_Matches contactFilterMatchFlow = new Flow.Interview.B2C_Commerce_Contact_Filter_Matches(contactFilterMap);
            contactFilterMatchFlow.start();

            contactFilteredList = (List<Contact>)(contactFilterMatchFlow.getVariableValue('ContactMatchesResult'));

        Test.stopTest();

        System.assertEquals(
            contactFilteredList[0].Id,
            [SELECT Id FROM Contact WHERE AccountId = :account.Id LIMIT 1].Id
        );
    }

    /**
     * @see B2CIACustomerResolution.resolve
     * @description
     * Given
     *      Existing person account with a last name, email, customer id, customer list id
     * When
     *      We resolve with a customer with a different last name, email, but same customer no and customer list id
     * Then
     *      We will be returned the existing person account
     */
    /* */
    @IsTest
    static void resolvesCustomerNoAndCustomerList() {

        Account account = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'PersonEmail' => 'differntemail@email.com',
            'LastName' => 'DifferentLastName',
            'B2C_Customer_No__pc' => 'customerNo',
            'B2C_CustomerList_ID__pc' => 'customerList',
            'RecordTypeId' => [SELECT Id FROM RecordType WHERE DeveloperName = 'PersonAccount' LIMIT 1].Id
        });

        Contact c1 = new Contact(
            Email = 'email@email.com',
            LastName = 'LastName',
            B2C_Customer_No__c = 'customerNo',
            B2C_CustomerList_ID__c = 'customerList'
        );

        List<List<Contact>> contactResolvedList = new List<List<Contact>>();
        List<Contact> contactFilteredList = new List<Contact>();

        Test.startTest();

            contactResolvedList = B2CIACustomerResolution.resolve(
                new List<Contact>{ c1 }
            );

            Map<String, Object> contactFilterMap = new Map<String, Object>();

            contactFilterMap.put(
                'Contact',
                c1
            );

            contactFilterMap.put(
                'ContactMatches',
                contactResolvedList[0]
            );


            Flow.Interview.B2C_Commerce_Contact_Filter_Matches contactFilterMatchFlow = new Flow.Interview.B2C_Commerce_Contact_Filter_Matches(contactFilterMap);
            contactFilterMatchFlow.start();

            contactFilteredList = (List<Contact>)(contactFilterMatchFlow.getVariableValue('ContactMatchesResult'));

        Test.stopTest();

        System.assertEquals(
            contactFilteredList[0].Id,
            [SELECT Id FROM Contact WHERE AccountId = :account.Id LIMIT 1].Id
        );
    }

    /**
     * @see B2CIACustomerResolution.resolve
     * @description
     * Given
     *      Existing person account with a last name, customer list id and email
     * When
     *      We resolve with a customer with same list name and email and a customer list
     * Then
     *      We will be returned the existing person account
     */
    /* */
    @IsTest
    static void resolvesContactWithCustomerListIdLastNameAndEmail() {

        Account account = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'PersonEmail' => 'email@email.com',
            'LastName' => 'LastName',
            'B2C_CustomerList_ID__pc' => 'CustomerList',
            'RecordTypeId' => [SELECT Id FROM RecordType WHERE DeveloperName = 'PersonAccount' LIMIT 1].Id
        });

        Contact c1 = new Contact(
            Email = 'email@email.com',
            LastName = 'LastName',
            B2C_CustomerList_ID__c = 'CustomerList'
        );

        List<List<Contact>> contactResolvedList = new List<List<Contact>>();
        List<Contact> contactFilteredList = new List<Contact>();

        Test.startTest();

            contactResolvedList = B2CIACustomerResolution.resolve(
                new List<Contact>{ c1 }
            );

            Map<String, Object> contactFilterMap = new Map<String, Object>();

            contactFilterMap.put(
                'Contact',
                c1
            );

            contactFilterMap.put(
                'ContactMatches',
                contactResolvedList[0]
            );

            Flow.Interview.B2C_Commerce_Contact_Filter_Matches contactFilterMatchFlow = new Flow.Interview.B2C_Commerce_Contact_Filter_Matches(contactFilterMap);
            contactFilterMatchFlow.start();

            contactFilteredList = (List<Contact>)(contactFilterMatchFlow.getVariableValue('ContactMatchesResult'));

        Test.stopTest();

        System.assertEquals(
            contactFilteredList[0].Id,
            [SELECT Id FROM Contact WHERE AccountId = :account.Id LIMIT 1].Id
        );
    }

    /**
     * @see B2CIACustomerResolution.resolve
     * @description
     * Given
     *      Existing person account with customer id
     * When
     *      We resolve with a customer with different customer id, same email, last name
     * Then
     *      We will be returned the existing person account
     */
    /* */
    @IsTest
    static void doesNotResolveDifferentCustomerIds() {

        Account account = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'PersonEmail' => 'email@email.com',
            'LastName' => 'LastName',
            'B2C_Customer_ID__pc' => 'CustomerId',
            'B2C_CustomerList_ID__pc' => 'customerList',
            'RecordTypeId' => [SELECT Id FROM RecordType WHERE DeveloperName = 'PersonAccount' LIMIT 1].Id
        });

        Contact c1 = new Contact(
            Email = 'email@email.com',
            LastName = 'LastName',
            B2C_CustomerList_ID__c = 'customerList',
            B2C_Customer_ID__c = 'CustomerId2'
        );

        List<List<Contact>> contactResolvedList = new List<List<Contact>>();
        List<Contact> contactFilteredList = new List<Contact>();

        Test.startTest();

            contactResolvedList = B2CIACustomerResolution.resolve(
                new List<Contact>{ c1 }
            );

            Map<String, Object> contactFilterMap = new Map<String, Object>();

            contactFilterMap.put(
                'Contact',
                c1
            );

            contactFilterMap.put(
                'ContactMatches',
                contactResolvedList[0]
            );

            Flow.Interview.B2C_Commerce_Contact_Filter_Matches contactFilterMatchFlow = new Flow.Interview.B2C_Commerce_Contact_Filter_Matches(contactFilterMap);
            contactFilterMatchFlow.start();

            contactFilteredList = (List<Contact>)(contactFilterMatchFlow.getVariableValue('ContactMatchesResult'));

        Test.stopTest();

        System.assertEquals(
            contactFilteredList,
            null
        );
    }

    /**
     * @see B2CIACustomerResolution.resolve
     * @description
     * Given
     *      2 different customer lists and one person account existing for customer list 1
     * When
     *      We resolve with a customer with same last name and email with a different customer list
     * Then
     *      We will be returned a new contact
     */
    /* */
    @IsTest
    static void createTwoContactsSpanningDifferentCustomerListIds() {

        Account account = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'PersonEmail' => 'email@email.com',
            'LastName' => 'LastName',
            'B2C_CustomerList_ID__pc' => 'customerList',
            'RecordTypeId' => [SELECT Id FROM RecordType WHERE DeveloperName = 'PersonAccount' LIMIT 1].Id
        });

        Contact c1 = new Contact(
            Email = 'email@email.com',
            LastName = 'LastName',
            B2C_CustomerList_ID__c = 'CustomerList2'
        );

        List<List<Contact>> contactResolvedList = new List<List<Contact>>();
        List<Contact> contactFilteredList = new List<Contact>();

        Test.startTest();

            contactResolvedList = B2CIACustomerResolution.resolve(
                new List<Contact>{ c1 }
            );

            Map<String, Object> contactFilterMap = new Map<String, Object>();

            contactFilterMap.put(
                'Contact',
                c1
            );

            contactFilterMap.put(
                'ContactMatches',
                contactResolvedList[0]
            );

            Flow.Interview.B2C_Commerce_Contact_Filter_Matches contactFilterMatchFlow = new Flow.Interview.B2C_Commerce_Contact_Filter_Matches(contactFilterMap);
            contactFilterMatchFlow.start();

            contactFilteredList = (List<Contact>)(contactFilterMatchFlow.getVariableValue('ContactMatchesResult'));

        Test.stopTest();

        System.assertEquals(
            contactFilteredList,
            null
        );
    }

    /**
     * @see B2CIACustomerResolution.resolve
     * @description
     * Given
     *      Existing person account with a last name and email
     * When
     *      We resolve with a customer with same list name and email and a customer list
     * Then
     *      We will be returned the existing person account
     */
    /* */
    @IsTest
    static void resolvesContactWithLastNameAndEmail() {

        Account account = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'PersonEmail' => 'email@email.com',
            'LastName' => 'LastName',
            'RecordTypeId' => [SELECT Id FROM RecordType WHERE DeveloperName = 'PersonAccount' LIMIT 1].Id
        });

        Contact c1 = new Contact(
            Email = 'email@email.com',
            LastName = 'LastName',
            B2C_CustomerList_ID__c = 'CustomerList'
        );

        List<List<Contact>> contactResolvedList = new List<List<Contact>>();
        List<Contact> contactFilteredList = new List<Contact>();

        Test.startTest();

            contactResolvedList = B2CIACustomerResolution.resolve(
                new List<Contact>{ c1 }
            );

            Map<String, Object> contactFilterMap = new Map<String, Object>();

            contactFilterMap.put(
                'Contact',
                c1
            );

            contactFilterMap.put(
                'ContactMatches',
                contactResolvedList[0]
            );

            Flow.Interview.B2C_Commerce_Contact_Filter_Matches contactFilterMatchFlow = new Flow.Interview.B2C_Commerce_Contact_Filter_Matches(contactFilterMap);
            contactFilterMatchFlow.start();

            contactFilteredList = (List<Contact>)(contactFilterMatchFlow.getVariableValue('ContactMatchesResult'));

        Test.stopTest();

        System.assertEquals(
            contactFilteredList[0].Id,
            [SELECT Id FROM Contact WHERE AccountId = :account.Id LIMIT 1].Id
        );
    }


    /**
     * @see B2CIACustomerResolution.resolve
     * @description
     * Given
     *      Existing person account with a last name and email
     * When
     *      We resolve with a customer with same list, email but different last name
     * Then
     *      We will be returned a new contact
     */
    /* */
    @IsTest
    static void doesNotResolveContactWithDifferentLastName() {

        Account account = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'PersonEmail' => 'email@email.com',
            'LastName' => 'DifferentLastName',
            'B2C_CustomerList_ID__pc' => 'CustomerList',
            'RecordTypeId' => [SELECT Id FROM RecordType WHERE DeveloperName = 'PersonAccount' LIMIT 1].Id
        });

        Contact c1 = new Contact(
            Email = 'email@email.com',
            LastName = 'LastName',
            B2C_CustomerList_ID__c = 'CustomerList'
        );

        List<List<Contact>> contactResolvedList = new List<List<Contact>>();
        List<Contact> contactFilteredList = new List<Contact>();

        Test.startTest();

            contactResolvedList = B2CIACustomerResolution.resolve(
                new List<Contact>{ c1 }
            );

            Map<String, Object> contactFilterMap = new Map<String, Object>();

            contactFilterMap.put(
                'Contact',
                c1
            );

            contactFilterMap.put(
                'ContactMatches',
                contactResolvedList[0]
            );

            Flow.Interview.B2C_Commerce_Contact_Filter_Matches contactFilterMatchFlow = new Flow.Interview.B2C_Commerce_Contact_Filter_Matches(contactFilterMap);
            contactFilterMatchFlow.start();

            contactFilteredList = (List<Contact>)(contactFilterMatchFlow.getVariableValue('ContactMatchesResult'));

        Test.stopTest();

        System.assertEquals(
            contactFilteredList,
            null
        );
    }

}
