/**
 * @author Abraham David Lloyd
 * @date July 4th, 2021
 *
 * @description This class is to validate that the B2CProcessContact's verifyRecord
 * subFlow.  It confirms that the subFlow validation performs as expected
 */
@IsTest
private class B2CProcessContact_VerifyRecord_Test {

    /**
     * @description This method is used to create the base test-data that will be leveraged
     * by the unit-tests for the B2CCommerce_Process_Contact_VerifyRecord flow.
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
            'Is_Active__c' => true
        });

        // Validate that all of the test-data is created
        System.assert(customerList != null, 'Expected a customerList to be created');
        System.assert(clientId != null, 'Expected an clientId to be created');
        System.assert(instance != null, 'Expected an instance to be created');

    }

    /**
     * @description This method is used to validate that providing a Contact record with
     * no valid ContactID will generate a failure.
     */
    @IsTest
    static void testContactIDInvalidIDFailure() {

        // Seed the testData
        prepareTestData();

        // Initialize local Variables
        Map<String, Object> flowArguments;
        Flow.Interview verifyRecordFlow;
        Contact testContact;

        // Initialize the flow outputVariables
        Contact verifiedContact;
        Account parentAccount;
        B2C_CustomerList__c parentB2CCustomerList;
        Boolean isVerfied;
        Boolean hasError;
        List<String> errorMessages;

        // Retrieve the testContact
        testContact = new Contact(
          Id = '0035400000hi3aoAAB'
        );

        flowArguments = new Map<String, Object>();
        flowArguments.put('sourceContact', testContact);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        verifyRecordFlow = Flow.Interview.createInterview('B2CCommerce_Process_Contact_VerifyRecord', flowArguments);

        Test.startTest();

            // Initialize the flow and start it
            verifyRecordFlow.start();

            // Retrieve the processing results from the flow
            verifiedContact = (Contact) verifyRecordFlow.getVariableValue('verifiedContact');
            parentAccount = (Account) verifyRecordFlow.getVariableValue('parentAccount');
            parentB2CCustomerList = (B2C_CustomerList__c) verifyRecordFlow.getVariableValue('parentB2CCustomerList');
            isVerfied = (Boolean) verifyRecordFlow.getVariableValue('isVerfied');
            hasError = (Boolean) verifyRecordFlow.getVariableValue('hasError');
            errorMessages = (List<String>) verifyRecordFlow.getVariableValue('errorMessage');

        Test.stopTest();

        // Verify that the contact wasn't verified -- we expected a failure because it had no AccountID
        System.assertEquals(verifiedContact, null, 'Did not expect a verifiedContact to be present in the flowResults');
        System.assertEquals(parentAccount, null,  'Did not expect a parentAccount to be present in the flowResults');
        System.assertEquals(hasError, true, 'Expected an error to be caught because this Contact could not be verified');
        System.assertEquals(isVerfied, false, 'Expected that the Contact would not be verified');
        System.assert(errorMessages.size() > 0, 'Expected an errorMessage to be included in the flow result');

    }

    /**
     * @description This method is used to validate that providing a Contact record with
     * no parentAccount record will generate a failure.
     */
    @IsTest
    static void testContactIDNoAccountFailure() {

        // Seed the testData
        prepareTestData();

        // Initialize local Variables
        Map<String, Object> flowArguments;
        Flow.Interview verifyRecordFlow;

        // Initialize the flow outputVariables
        Contact verifiedContact;
        Account parentAccount;
        B2C_CustomerList__c parentB2CCustomerList;
        Boolean isVerfied;
        Boolean hasError;
        List<String> errorMessages;

        // Initialize the testContact record
        Contact testContact = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'Anonymous',
            'LastName' => 'Customer',
            'Email' => 'test-user@b2csa.qa.salesforce.com'
        });

        // Initialize the flow arguments
        flowArguments = new Map<String, Object>();
        flowArguments.put('sourceContact', testContact);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        verifyRecordFlow = Flow.Interview.createInterview('B2CCommerce_Process_Contact_VerifyRecord', flowArguments);

        Test.startTest();

            // Initialize the flow and start it
            verifyRecordFlow.start();

            // Retrieve the processing results from the flow
            verifiedContact = (Contact) verifyRecordFlow.getVariableValue('verifiedContact');
            parentAccount = (Account) verifyRecordFlow.getVariableValue('parentAccount');
            parentB2CCustomerList = (B2C_CustomerList__c) verifyRecordFlow.getVariableValue('parentB2CCustomerList');
            isVerfied = (Boolean) verifyRecordFlow.getVariableValue('isVerfied');
            hasError = (Boolean) verifyRecordFlow.getVariableValue('hasError');
            errorMessages = (List<String>) verifyRecordFlow.getVariableValue('errorMessage');

        Test.stopTest();

        // Verify that the contact wasn't verified -- we expected a failure because it had no AccountID
        System.assert(verifiedContact != null, 'Expected a verifiedContact to be present in the flowResults');
        System.assertEquals(parentAccount, null,  'Did not expect a parentAccount to be present in the flowResults');
        System.assertEquals(parentB2CCustomerList, null,  'Did not expect a parentB2CCustomerList to be present in the flowResults');
        System.assertEquals(hasError, true, 'Expected an error to be caught because this Contact has no parent Account');
        System.assertEquals(isVerfied, false, 'Expected that the Contact would not be verified');
        System.assert(errorMessages.size() > 0, 'Expected an errorMessage to be included in the flow result');

    }

    /**
     * @description This method is used to validate that providing a Contact record with
     * no parentB2CCustomerList record will generate a failure.
     */
    @IsTest
    static void testContactIDNoCustomerListFailure() {

        // Seed the testData
        prepareTestData();

        // Initialize local Variables
        Map<String, Object> flowArguments;
        Flow.Interview verifyRecordFlow;

        // Initialize the flow outputVariables
        Contact verifiedContact;
        Account parentAccount;
        B2C_CustomerList__c parentB2CCustomerList;
        Boolean isVerfied;
        Boolean hasError;
        List<String> errorMessages;

        // Initialize the testContact record
        Account testAccount = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'Name' => 'Anonymous Customer',
            'RecordTypeId' => B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getAccountRecordTypeDeveloperName()).Id
        });

        // Initialize the testContact record with the AccountId
        Contact testContact = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'Anonymous',
            'LastName' => 'Customer',
            'Email' => 'test-user@b2csa.qa.salesforce.com',
            'AccountId' => testAccount.Id
        });

        // Initialize the flow arguments
        flowArguments = new Map<String, Object>();
        flowArguments.put('sourceContact', testContact);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        verifyRecordFlow = Flow.Interview.createInterview('B2CCommerce_Process_Contact_VerifyRecord', flowArguments);

        Test.startTest();

            // Initialize the flow and start it
            verifyRecordFlow.start();

            // Retrieve the processing results from the flow
            verifiedContact = (Contact) verifyRecordFlow.getVariableValue('verifiedContact');
            parentAccount = (Account) verifyRecordFlow.getVariableValue('parentAccount');
            parentB2CCustomerList = (B2C_CustomerList__c) verifyRecordFlow.getVariableValue('parentB2CCustomerList');
            isVerfied = (Boolean) verifyRecordFlow.getVariableValue('isVerfied');
            hasError = (Boolean) verifyRecordFlow.getVariableValue('hasError');
            errorMessages = (List<String>) verifyRecordFlow.getVariableValue('errorMessage');

        Test.stopTest();

        // Verify that the contact wasn't verified -- we expected a failure because it had no B2C CustomerList
        System.assert(verifiedContact != null, 'Expected a verifiedContact to be present in the flowResults');
        System.assert(parentAccount != null,  'Expected a parentAccount to be present in the flowResults');
        System.assertEquals(parentB2CCustomerList, null,  'Did not expect a parent B2C CustomerList to be present in the flowResults');
        System.assertEquals(hasError, true, 'Expected an error to be caught because this Contact has no parent B2C CustomerList');
        System.assertEquals(isVerfied, false, 'Expected that the Contact would not be verified');
        System.assert(errorMessages.size() > 0, 'Expected an errorMessage to be included in the flow result');

    }

    /**
     * @description This method is used to validate that providing a Contact record with
     * no valid B2C CustomerID will generate a failure message.  sourceContacts with a
     * contactId are directly verified; otherwise, all we can validate is the identifier
     * provided.
     */
    @IsTest
    static void testB2CCustomerIDInvalidIDFailure() {

        // Seed the testData
        prepareTestData();

        // Initialize local Variables
        Map<String, Object> flowArguments;
        Flow.Interview verifyRecordFlow;
        Contact testContact;

        // Initialize the flow outputVariables
        Contact verifiedContact;
        Account parentAccount;
        B2C_CustomerList__c parentB2CCustomerList;
        Boolean isVerfied;
        Boolean hasError;
        List<String> errorMessages;

        // Retrieve the testContact
        testContact = new Contact(
            B2C_Customer_ID__c = '0035400000hi3aoAAB'
        );

        // Initialize the flow arguments
        flowArguments = new Map<String, Object>();
        flowArguments.put('sourceContact', testContact);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        verifyRecordFlow = Flow.Interview.createInterview('B2CCommerce_Process_Contact_VerifyRecord', flowArguments);

        Test.startTest();

            // Initialize the flow and start it
            verifyRecordFlow.start();

            // Retrieve the processing results from the flow
            verifiedContact = (Contact) verifyRecordFlow.getVariableValue('verifiedContact');
            parentAccount = (Account) verifyRecordFlow.getVariableValue('parentAccount');
            parentB2CCustomerList = (B2C_CustomerList__c) verifyRecordFlow.getVariableValue('parentB2CCustomerList');
            isVerfied = (Boolean) verifyRecordFlow.getVariableValue('isVerfied');
            hasError = (Boolean) verifyRecordFlow.getVariableValue('hasError');
            errorMessages = (List<String>) verifyRecordFlow.getVariableValue('errorMessage');

        Test.stopTest();

        // Verify that the contact wasn't verified -- we expected a failure because it had no AccountID
        System.assertEquals(verifiedContact, null, 'Did not expect a verifiedContact to be present in the flowResults');
        System.assertEquals(parentAccount, null,  'Did not expect a parentAccount to be present in the flowResults');
        System.assertEquals(hasError, false, 'Did not expect an error flag as an unresolved B2C CustomerID is a valid scenario');
        System.assertEquals(isVerfied, false, 'Expected that the Contact would not be verified');
        System.assert(errorMessages.size() > 0, 'Expected an errorMessage to be included in the flow result');

    }

    /**
     * @description This method is used to validate that providing a Contact record with
     * a B2C CustomerID and no parentAccount record will generate a failure message.  Only sourceContacts
     * with a ContactID are verified across Accounts and B2C CustomerLists.
     */
    @IsTest
    static void testB2CCustomerIDNoAccountFailure() {

        // Seed the testData
        prepareTestData();

        // Initialize local Variables
        Map<String, Object> flowArguments;
        Flow.Interview verifyRecordFlow;

        // Initialize the flow outputVariables
        Contact verifiedContact;
        Account parentAccount;
        B2C_CustomerList__c parentB2CCustomerList;
        Boolean isVerfied;
        Boolean hasError;
        List<String> errorMessages;

        // Initialize the testContact record
        TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'Anonymous',
            'LastName' => 'Customer',
            'Email' => 'test-user@b2csa.qa.salesforce.com',
            'B2C_Customer_ID__c' => 'my-test-customerId'
        });

        // Initialize the flow arguments
        flowArguments = new Map<String, Object>();
        flowArguments.put('sourceContact', new Contact(
            B2C_Customer_ID__c = 'my-test-customerId'
        ));

        // Execute the filterMap flow attempt to resolve the specific contact identified
        verifyRecordFlow = Flow.Interview.createInterview('B2CCommerce_Process_Contact_VerifyRecord', flowArguments);

        Test.startTest();

            // Initialize the flow and start it
            verifyRecordFlow.start();

            // Retrieve the processing results from the flow
            verifiedContact = (Contact) verifyRecordFlow.getVariableValue('verifiedContact');
            parentAccount = (Account) verifyRecordFlow.getVariableValue('parentAccount');
            parentB2CCustomerList = (B2C_CustomerList__c) verifyRecordFlow.getVariableValue('parentB2CCustomerList');
            isVerfied = (Boolean) verifyRecordFlow.getVariableValue('isVerfied');
            hasError = (Boolean) verifyRecordFlow.getVariableValue('hasError');
            errorMessages = (List<String>) verifyRecordFlow.getVariableValue('errorMessage');

        Test.stopTest();

        // Verify that the contact wasn't verified -- we expected a failure because it had no AccountID
        System.assertEquals(null, verifiedContact, 'Did not expect a verifiedContact to be present in the flowResults');
        System.assertEquals(null, parentAccount,  'Did not expect a parentAccount to be present in the flowResults');
        System.assertEquals(null, parentB2CCustomerList,  'Did not expect a parentB2CCustomerList to be present in the flowResults');
        System.assertEquals(hasError, false, 'Did not expect an error flag as the Account validation will occur after resolution');
        System.assertEquals(isVerfied, false, 'Expected that the Contact would not be verified');
        System.assert(errorMessages.size() > 0, 'Expected an errorMessage to be included in the flow result');

    }

    /**
     * @description This method is used to validate that providing a Contact record with
     * no parentB2CCustomerList record will generate a failure.  It leverages a B2C Customer ID
     * as the main identifier to leverage.  Only sourceContacts with a ContactID will be fully
     * verified -- all other contacts must go through the resolution process.
     */
    @IsTest
    static void testB2CCustomerIDNoCustomerListFailure() {

        // Seed the testData
        prepareTestData();

        // Initialize local Variables
        Map<String, Object> flowArguments;
        Flow.Interview verifyRecordFlow;

        // Initialize the flow outputVariables
        Contact verifiedContact;
        Account parentAccount;
        B2C_CustomerList__c parentB2CCustomerList;
        Boolean isVerfied;
        Boolean hasError;
        List<String> errorMessages;

        // Initialize the testContact record
        Account testAccount = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'Name' => 'Anonymous Customer',
            'RecordTypeId' => B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getAccountRecordTypeDeveloperName()).Id
        });

        // Initialize the testContact record with the AccountId
        TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'Anonymous',
            'LastName' => 'Customer',
            'Email' => 'test-user@b2csa.qa.salesforce.com',
            'B2C_Customer_ID__c' => 'my-test-customerId',
            'AccountId' => testAccount.Id
        });

        // Initialize the flow arguments
        flowArguments = new Map<String, Object>();
        flowArguments.put('sourceContact', new Contact(
            B2C_Customer_ID__c = 'my-test-customerId'
        ));

        // Execute the filterMap flow attempt to resolve the specific contact identified
        verifyRecordFlow = Flow.Interview.createInterview('B2CCommerce_Process_Contact_VerifyRecord', flowArguments);

        Test.startTest();

            // Initialize the flow and start it
            verifyRecordFlow.start();

            // Retrieve the processing results from the flow
            verifiedContact = (Contact) verifyRecordFlow.getVariableValue('verifiedContact');
            parentAccount = (Account) verifyRecordFlow.getVariableValue('parentAccount');
            parentB2CCustomerList = (B2C_CustomerList__c) verifyRecordFlow.getVariableValue('parentB2CCustomerList');
            isVerfied = (Boolean) verifyRecordFlow.getVariableValue('isVerfied');
            hasError = (Boolean) verifyRecordFlow.getVariableValue('hasError');
            errorMessages = (List<String>) verifyRecordFlow.getVariableValue('errorMessage');

        Test.stopTest();

        // Verify that the contact wasn't verified -- we expected a failure because it had no B2C CustomerList
        System.assertEquals(null, verifiedContact, 'Did not expect a verifiedContact to be present in the flowResults');
        System.assertEquals(null, parentAccount,  'Did not expect a parentAccount to be present in the flowResults');
        System.assertEquals(null, parentB2CCustomerList,  'Did not expect a parentB2CCustomerList to be present in the flowResults');
        System.assertEquals(hasError, false, 'Did not expect an error flag as the B2C CustomerList validation will occur after resolution');
        System.assertEquals(false, isVerfied, 'Expected that the Contact would not be verified');
        System.assert(errorMessages.size() > 0, 'Expected an errorMessage to be included in the flow result');

    }

    /**
     * @description This method is used to validate that providing a Contact record with
     * a valid parent Account and B2C CustomerList will result in successful validation.
     * It leverages a B2C CustomerID to perform validation.  Only sourceContacts
     * with a ContactID are verified across Accounts and B2C CustomerLists.
     */
    @IsTest
    static void testB2CCustomerIDSuccess() {

        // Seed the testData
        prepareTestData();

        // Initialize local Variables
        Map<String, Object> flowArguments;
        Flow.Interview verifyRecordFlow;

        // Initialize the flow outputVariables
        Contact verifiedContact;
        Account parentAccount;
        B2C_CustomerList__c parentB2CCustomerList;
        Boolean isVerfied;
        Boolean hasError;
        List<String> errorMessages;

        // Retrieve the test customerList
        B2C_CustomerList__c testCustomerList = [
            SELECT  Id
            FROM    B2C_CustomerList__c
            LIMIT   1
        ];

        // Initialize the testContact record
        Account testAccount = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'Name' => 'Anonymous Customer',
            'RecordTypeId' => B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getAccountRecordTypeDeveloperName()).Id
        });

        // Initialize the testContact record with the AccountId and customerListId
        TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'Anonymous',
            'LastName' => 'Customer',
            'Email' => 'test-user@b2csa.qa.salesforce.com',
            'B2C_Customer_ID__c' => 'my-test-customerId',
            'AccountId' => testAccount.Id,
            'B2C_CustomerList__c' => testCustomerList.Id
        });

        // Initialize the flow arguments
        flowArguments = new Map<String, Object>();
        flowArguments.put('sourceContact', new Contact(
            B2C_Customer_ID__c = 'my-test-customerId'
        ));

        // Execute the filterMap flow attempt to resolve the specific contact identified
        verifyRecordFlow = Flow.Interview.createInterview('B2CCommerce_Process_Contact_VerifyRecord', flowArguments);

        Test.startTest();

            // Initialize the flow and start it
            verifyRecordFlow.start();

            // Retrieve the processing results from the flow
            verifiedContact = (Contact) verifyRecordFlow.getVariableValue('verifiedContact');
            parentAccount = (Account) verifyRecordFlow.getVariableValue('parentAccount');
            parentB2CCustomerList = (B2C_CustomerList__c) verifyRecordFlow.getVariableValue('parentB2CCustomerList');
            isVerfied = (Boolean) verifyRecordFlow.getVariableValue('isVerfied');
            hasError = (Boolean) verifyRecordFlow.getVariableValue('hasError');
            errorMessages = (List<String>) verifyRecordFlow.getVariableValue('errorMessage');

        Test.stopTest();

        // Verify that the contact was verified -- we expected success because it's well-formed
        System.assertEquals(null, verifiedContact, 'Did not expect a verifiedContact to be present in the flowResults');
        System.assertEquals(null, parentAccount,  'Did not expect a parentAccount to be present in the flowResults');
        System.assertEquals(null, parentB2CCustomerList,  'Did not expect a parentB2CCustomerList to be present in the flowResults');
        System.assertEquals(hasError, false, 'Did not expect an error to be caught -- as it needs to go through the resolution process');
        System.assertEquals(isVerfied, false, 'Did not expect that the Contact would be verified -- as it needs to go through the resolution process');
        System.assert(errorMessages.size() > 0, 'Expected an errorMessage to be included in the flow result');

    }

}
