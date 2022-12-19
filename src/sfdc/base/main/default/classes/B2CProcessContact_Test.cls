/**
 * @author Abraham David Lloyd
 * @date June 29th, 2021
 *
 * @description This class is to validate that the B2CProcessContact trigger behavior.
 */
@IsTest
private class B2CProcessContact_Test {

    /**
     * @description This test validates that the process trigger can update a
     * contact and process successfully when a contact lacks an Account and B2C
     * customerProfile identifiers.
     */
    @IsTest
    static void testCreateContactWithoutAccountB2CCustomerListCustomerNo() {

        // Initialize local variables
        Database.SaveResult processingResult;
        Boolean errorThrown = false;
        Contact testContact = new Contact(
            FirstName = 'Anonymous',
            LastName = 'Customer',
            Email = 'anonymous@b2csa.qa.salesforce.com'
        );

        Test.startTest();

            try {

                // Create the Contact record
                Database.insert(testContact);

                // Update the email address for the testContact
                testContact.Email = 'anon@b2csa.qa.salesforce.com';

                // Process the update and invoke the trigger
                processingResult = Database.update(testContact);

            } catch (Exception e) {

                // Flag that an error was thrown
                errorThrown = true;

            }

        Test.stopTest();

        // Validate that the update was successfully processed
        System.assert(errorThrown == false, 'Expected this test to execute without an error being thrown');
        System.assert(processingResult.isSuccess() == true, 'Expected the update statement to be successful');

    }

    /**
     * @description This test validates that the process trigger can update a
     * contact and process successfully when a contact has an Account and lacks B2C
     * customerProfile identifiers.
     */
    @IsTest
    static void testUpdateContactWithAccountWithoutB2CCustomerListCustomerNo() {

        // Initialize local variables
        Database.SaveResult processingResult;
        Boolean errorThrown = false;

        // Initialize the Account / Contact details
        Account testAccount = new Account(
            Name = 'Anonymous Customer',
            RecordTypeId = B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getAccountRecordTypeDeveloperName()).Id
        );

        // Create the parent Account record
        Database.insert(testAccount);

        Contact testContact = new Contact(
            AccountId = testAccount.Id,
            FirstName = 'Anonymous',
            LastName = 'Customer',
            Email = 'anonymous@b2csa.qa.salesforce.com'
        );

        // Create the child Contact record
        Database.insert(testContact);

        Test.startTest();

            try {

                // Update the email address for the testContact
                testContact.Email = 'anon@b2csa.qa.salesforce.com';

                // Process the update and invoke the trigger
                processingResult = Database.update(testContact);

            } catch (Exception e) {

                // Flag that an error was thrown
                errorThrown = true;

            }

        Test.stopTest();

        // Validate that the update was successfully processed
        System.assert(errorThrown == false, 'Expected this test to execute without an error being thrown');
        System.assert(processingResult.isSuccess() == true, 'Expected the update statement to be successful');

    }

    /**
     * @description This test validates that the process trigger can update a
     * contact and process successfully when a contact has an Account and B2C
     * customerProfile identifiers.
     */
    @IsTest
    static void testUpdateContactWithAccountB2CCustomerListCustomerNo() {

        // Initialize local variables
        Database.SaveResult processingResult;
        Boolean errorThrown = false;

        // Initialize the B2C Instance details
        B2C_Instance__c testInstance = new B2C_Instance__c(
            Name = 'test-001',
            API_Url__c = 'https://www.example.com',
            Is_Active__c = true
        );

        // Create the instance record
        Database.insert(testInstance);

        // Initialize the B2C CustomerList details
        B2C_CustomerList__c testCustomerList = new B2C_CustomerList__c(
            Name = 'RefArch',
            B2C_Instance__c = testInstance.Id,
            API_Url__c = 'https://www.example.com',
            Is_Active__c = true,
            Enable_Profile_Creation__c = true,
            Enable_Profile_Publishing__c = true,
            Enable_Profile_Retrieval__c = true,
            Enable_Profile_Updates__c = true
        );

        // Create the customerList record
        Database.insert(testCustomerList);

        // Initialize the Account
        Account testAccount = new Account(
            Name = 'Anonymous Customer',
            RecordTypeId = B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getAccountRecordTypeDeveloperName()).Id
        );

        // Create the Account record
        Database.insert(testAccount);

        // Initialize the Contact
        Contact testContact = new Contact(
            AccountId = testAccount.Id,
            B2C_CustomerList__c = testCustomerList.Id,
            B2C_Customer_No__c = '9999999',
            FirstName = 'Anonymous',
            LastName = 'Customer',
            Email = 'anonymous@b2csa.qa.salesforce.com'
        );

        // Create the Contact record
        Database.insert(testContact);

        Test.startTest();

            try {

                // Update the email address for the testContact
                testContact.Email = 'anon@b2csa.qa.salesforce.com';

                // Process the update and invoke the trigger
                processingResult = Database.update(testContact);

            } catch (Exception e) {

                // Flag that an error was thrown
                errorThrown = true;

            }

        Test.stopTest();

        // Validate that the update was successfully processed
        System.assert(errorThrown == false, 'Expected this test to execute without an error being thrown');
        System.assert(processingResult.isSuccess() == true, 'Expected the update statement to be successful');

    }

    /**
     * @description This test validates that the process trigger bypasses processing Contact
     * updates if the platformEvent flag is set to true (this prevents a circular loop).
     */
    @IsTest
    static void testBypassPlatformEventCreation() {

        // Initialize local variables
        Database.SaveResult processingResult;
        Boolean errorThrown = false;

        // Initialize the B2C Instance details
        B2C_Instance__c testInstance = new B2C_Instance__c(
            Name = 'test-001',
            API_Url__c = 'https://www.example.com',
            Is_Active__c = true
        );

        // Create the instance record
        Database.insert(testInstance);

        // Initialize the B2C CustomerList details
        B2C_CustomerList__c testCustomerList = new B2C_CustomerList__c(
            Name = 'RefArch',
            B2C_Instance__c = testInstance.Id,
            API_Url__c = 'https://www.example.com',
            Is_Active__c = true,
            Enable_Profile_Creation__c = true,
            Enable_Profile_Publishing__c = true,
            Enable_Profile_Retrieval__c = true,
            Enable_Profile_Updates__c = true
        );

        // Create the customerList record
        Database.insert(testCustomerList);

        // Initialize the Account
        Account testAccount = new Account(
            Name = 'Anonymous Customer',
            RecordTypeId = B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getAccountRecordTypeDeveloperName()).Id
        );

        // Create the Account record
        Database.insert(testAccount);

        // Initialize the Contact
        Contact testContact = new Contact(
            AccountId = testAccount.Id,
            B2C_CustomerList__c = testCustomerList.Id,
            B2C_Customer_No__c = '9999999',
            FirstName = 'Anonymous',
            LastName = 'Customer',
            Email = 'anonymous@b2csa.qa.salesforce.com'
        );

        // Create the Contact record
        Database.insert(testContact);

        Test.startTest();

            try {

                // Update the email address for the testContact
                testContact.Email = 'anon@b2csa.qa.salesforce.com';
                testContact.Updated_by_B2C_Platform_Event__c = true;

                // Process the update and invoke the trigger
                processingResult = Database.update(testContact);

            } catch (Exception e) {

                // Flag that an error was thrown
                errorThrown = true;

            }

        Test.stopTest();

        // Validate that the update was successfully processed
        System.assert(errorThrown == false, 'Expected this test to execute without an error being thrown');
        System.assert(processingResult.isSuccess() == true, 'Expected the update statement to be successful');

    }


}
