/**
 * @author Abraham David Lloyd
 * @date July 4th, 2021
 *
 * @description This class is to validate that the B2CProcessContact's HelperServiceEntry
 * subFlow.  It confirms that the subFlow validation performs as expected and successfully
 * manages the resolution of customers via contactDefinitions.
 */
@IsTest
private class B2CProcessContact_ServiceEntry_Test {

    /**
     * @description This method is used to create the base test-data that will be leveraged
     * by the unit-tests for the B2CCommerce_Process_Contact_HelperServiceEntry flow.
     */
    @IsTest
    static void prepareTestData() {

        // Initialize the clientId to use during testing
        B2C_Client_ID__c clientId = (B2C_Client_ID__c)TestDataFactory.createSObject('B2C_Client_ID__c', new Map<String,Object>{
            'Name' => 'my-test-clientId',
            'B2C_Client_ID_Label__c' => 'My Test ClientID',
            'JWT_Certificate_Name__c' => B2CConstant.CERTTEST_VALIDATE_TESTCERTIFICATENAME,
            'Is_Active__c' => true,
            'Audit_Authentication_API_Interactions__c' => true
        });

        // Initialize the test instance
        B2C_Instance__c instance = (B2C_Instance__c)TestDataFactory.createSObject('B2C_Instance__c', new Map<String,Object>{
            'Name' => 'testInstance',
            'API_Url__c' => 'https://test.com',
            'B2C_Client_ID__c' => clientId.Id,
            'Is_Active__c' => true
        });

        // Initialize the test customerList
        B2C_CustomerList__c customerList = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
            'Name' => 'RefArch',
            'B2C_Instance__c' => instance.Id,
            'B2C_Client_ID__c' => clientId.Id,
            'CustomerList_ID__c' => 'RefArch',
            'API_Url__c' => 'https://test.com',
            'OCAPI_Version_No__c' => 'v20_10',
            'Is_Active__c' => true,
            'Enable_Profile_Updates__c' => true,
            'Enable_Profile_Retrieval__c' => true,
            'Enable_Profile_Creation__c' => true,
            'Enable_Profile_Publishing__c' => true
        });

        // Validate that all of the test-data is created
        System.assert(customerList != null, 'Expected a customerList to be created');
        System.assert(clientId != null, 'Expected an clientId to be created');
        System.assert(instance != null, 'Expected an instance to be created');

    }

    /**
     * @description This test exercises resolution of an existing Contact record
     * using a ContactID as an identifier.  It should generate a success.
     */
    @IsTest
    static void testResolveContactContactIDSuccess() {
        // Seed the testData
        prepareTestData();

        // Retrieve the test customerList
        B2C_CustomerList__c testCustomerList = [
            SELECT  Id,
                    Name
            FROM    B2C_CustomerList__c
            LIMIT   1
        ];

        // Initialize the testContact record
        Account testAccount = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'Name' => 'Registered Customer',
            'RecordTypeId' => B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getAccountRecordTypeDeveloperName()).Id
        });

        // Initialize the testContact record with the AccountId
        Contact testContact = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'Anonymous',
            'LastName' => 'Customer',
            'Email' => 'test-user@b2csa.qa.salesforce.com',
            'AccountId' => testAccount.Id,
            'B2C_CustomerList__c' => testCustomerList.Id,
            'B2C_CustomerList_ID__c' => testCustomerList.Name,
            'B2C_Customer_ID__c' => 'test-customerid',
            'B2C_Customer_No__c' => 'test-customerno'
        });

        // Initialize local Variables
        Map<String, Object> flowArguments;
        Flow.Interview serviceEntryFlow;

        // Initialize the testContact record
        Contact sourceContact = new Contact(
            Id = testContact.Id
        );

        // Initialize the flow outputVariables
        Account account;
        Contact contact;
        Contact contactToResolve;
        List<String> errorMessage;
        Boolean isSuccess;
        Account parentAccount;
        B2C_CustomerList__c parentB2CCustomerList;
        Decimal resolutionCount;
        List<Contact> resolvedContacts;
        Contact verifiedContact;

        // Initialize the flow arguments
        flowArguments = new Map<String, Object>();
        flowArguments.put('sourceContact', sourceContact);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        serviceEntryFlow = Flow.Interview.createInterview(
            'B2CCommerce_Process_Contact_HelperServiceEntry',
            flowArguments
        );

        Test.startTest();

            // Initialize the flow and start it
            serviceEntryFlow.start();

            // Pull all the variables from the flow results
            account = (Account) serviceEntryFlow.getVariableValue('Account');
            contact = (Contact) serviceEntryFlow.getVariableValue('Contact');
            contactToResolve = (Contact) serviceEntryFlow.getVariableValue('contactToResolve');
            errorMessage = (List<String>) serviceEntryFlow.getVariableValue('ErrorMessage');
            isSuccess = (Boolean) serviceEntryFlow.getVariableValue('isSuccess');
            parentAccount = (Account) serviceEntryFlow.getVariableValue('parentAccount');
            parentB2CCustomerList = (B2C_CustomerList__c) serviceEntryFlow.getVariableValue('parentB2CCustomerList');
            resolutionCount = (Decimal) serviceEntryFlow.getVariableValue('ResolutionCount');
            resolvedContacts = (List<Contact>) serviceEntryFlow.getVariableValue('resolvedContacts');
            verifiedContact = (Contact) serviceEntryFlow.getVariableValue('verifiedContact');

        Test.stopTest();

        // Verify that the contact was verified -- we expected success because it's well-formed
        System.assert(account != null, 'Expected a parentAccount to be resolved');
        System.assert(contact != null, 'Expected a resolvedContact');
        System.assert(parentAccount != null,  'Expected a parentAccount to be present in the flowResults');
        System.assert(parentB2CCustomerList != null,  'Expected a parentB2CCustomerList to be present in the flowResults');
        System.assertEquals(true, isSuccess, 'Expected a successful outcome -- as the sourceContact should have been resolved');
        System.assertEquals(1, resolutionCount, 'Expected a single record to be resolved for this sourceContact');

    }

    /**
     * @description This test exercises resolution of an existing Contact record
     * using a customerId as an identifier.  It should generate a success.
     */
    @IsTest
    static void testResolveContactCustomerIDSuccess() {
        // Seed the testData
        prepareTestData();

        // Retrieve the test customerList
        B2C_CustomerList__c testCustomerList = [
            SELECT  Id,
                    Name
            FROM    B2C_CustomerList__c
            LIMIT   1
        ];

        // Initialize the testContact record
        Account testAccount = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'Name' => 'Registered Customer',
            'RecordTypeId' => B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getAccountRecordTypeDeveloperName()).Id
        });

        // Initialize the testContact record with the AccountId
        TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'Anonymous',
            'LastName' => 'Customer',
            'Email' => 'test-user@b2csa.qa.salesforce.com',
            'AccountId' => testAccount.Id,
            'B2C_CustomerList__c' => testCustomerList.Id,
            'B2C_CustomerList_ID__c' => testCustomerList.Name,
            'B2C_Customer_ID__c' => 'test-customerid',
            'B2C_Customer_No__c' => 'test-customerno'
        });

        // Initialize local Variables
        Map<String, Object> flowArguments;
        Flow.Interview serviceEntryFlow;

        // Initialize the testContact record
        Contact sourceContact = new Contact(
            B2C_Customer_ID__c = 'test-customerid'
        );

        // Initialize the flow outputVariables
        Account account;
        Contact contact;
        Contact contactToResolve;
        List<String> errorMessage;
        Boolean isSuccess;
        Account parentAccount;
        B2C_CustomerList__c parentB2CCustomerList;
        Decimal resolutionCount;
        List<Contact> resolvedContacts;
        Contact verifiedContact;

        // Initialize the flow arguments
        flowArguments = new Map<String, Object>();
        flowArguments.put('sourceContact', sourceContact);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        serviceEntryFlow = Flow.Interview.createInterview(
            'B2CCommerce_Process_Contact_HelperServiceEntry',
            flowArguments
        );

        Test.startTest();

            // Initialize the flow and start it
            serviceEntryFlow.start();

            // Pull all the variables from the flow results
            account = (Account) serviceEntryFlow.getVariableValue('Account');
            contact = (Contact) serviceEntryFlow.getVariableValue('Contact');
            contactToResolve = (Contact) serviceEntryFlow.getVariableValue('contactToResolve');
            errorMessage = (List<String>) serviceEntryFlow.getVariableValue('ErrorMessage');
            isSuccess = (Boolean) serviceEntryFlow.getVariableValue('isSuccess');
            parentAccount = (Account) serviceEntryFlow.getVariableValue('parentAccount');
            parentB2CCustomerList = (B2C_CustomerList__c) serviceEntryFlow.getVariableValue('parentB2CCustomerList');
            resolutionCount = (Decimal) serviceEntryFlow.getVariableValue('ResolutionCount');
            resolvedContacts = (List<Contact>) serviceEntryFlow.getVariableValue('resolvedContacts');
            verifiedContact = (Contact) serviceEntryFlow.getVariableValue('verifiedContact');

        Test.stopTest();

        // Verify that the contact was verified -- we expected success because it's well-formed
        System.assert(account != null, 'Expected a parentAccount to be resolved');
        System.assert(contact != null, 'Expected a resolvedContact');
        System.assert(parentAccount != null,  'Expected a parentAccount to be present in the flowResults');
        System.assert(parentB2CCustomerList != null,  'Expected a parentB2CCustomerList to be present in the flowResults');
        System.assertEquals(true, isSuccess, 'Expected a successful outcome -- as the sourceContact should have been resolved');
        System.assertEquals(1, resolutionCount, 'Expected a single record to be resolved for this sourceContact');

    }

}
