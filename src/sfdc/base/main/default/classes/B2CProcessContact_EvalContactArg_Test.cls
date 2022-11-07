/**
 * @author Abraham David Lloyd
 * @date July 4th, 2021
 *
 * @description This class is to validate that the B2CProcessContact's Evaluate
 * ContactArgument subFlow.
 */
@IsTest
private class B2CProcessContact_EvalContactArg_Test {

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
            'OCAPI_Version_No__c' => 'v20_10'
        });

        // Validate that all of the test-data is created
        System.assert(customerList != null, 'Expected a customerList to be created');
        System.assert(clientId != null, 'Expected an clientId to be created');
        System.assert(instance != null, 'Expected an instance to be created');

    }

    /**
     * @description This test attempts to resolve a Contact profile that does not exist with
     * a valid B2C CustomerList.  It should return no error with a valid successFlag, a recognized
     * B2C CustomerList, and no errors.
     */
    @IsTest
    static void testSourceContactB2CCustomerListValidSuccess() {

        // Seed the testData
        prepareTestData();

        // Initialize local Variables
        Map<String, Object> flowArguments;
        Flow.Interview evalContactArgumentFlow;

        // Initialize the testContact record
        Contact sourceContact = new Contact(
            FirstName = 'Anonymous',
            LastName = 'Customer',
            Email = 'test-user@b2csa.qa.salesforce.com',
            B2C_Customer_ID__c = 'bcdKh1ixccNKau8lFXjFMaTEoj',
            B2C_CustomerList_ID__c = 'RefArch',
            B2C_Customer_No__c = '00013505'
        );

        // Initialize the flow outputVariables
        List<String> errorMessage;
        Boolean hasError;
        Boolean hasIdentifiers;
        Boolean isSuccess;
        Boolean isVerified;
        Account parentAccount;
        B2C_CustomerList__c parentB2CCustomerList;
        Contact flowSourceContact;
        Contact verifiedContact;

        // Initialize the flow arguments
        flowArguments = new Map<String, Object>();
        flowArguments.put('sourceContact', sourceContact);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        evalContactArgumentFlow = Flow.Interview.createInterview('B2CCommerce_Process_Contact_EvaluateContactArgument', flowArguments);

        Test.startTest();

            // Initialize the flow and start it
            evalContactArgumentFlow.start();

            // Retrieve the output arguments
            errorMessage = (List<String>) evalContactArgumentFlow.getVariableValue('ErrorMessage');
            hasError = (Boolean) evalContactArgumentFlow.getVariableValue('hasError');
            hasIdentifiers = (Boolean) evalContactArgumentFlow.getVariableValue('hasIdentifiers');
            isSuccess = (Boolean) evalContactArgumentFlow.getVariableValue('isSuccess');
            isVerified = (Boolean) evalContactArgumentFlow.getVariableValue('isVerified');
            parentAccount = (Account) evalContactArgumentFlow.getVariableValue('parentAccount');
            parentB2CCustomerList = (B2C_CustomerList__c) evalContactArgumentFlow.getVariableValue('parentB2CCustomerList');
            flowSourceContact = (Contact) evalContactArgumentFlow.getVariableValue('sourceContact');
            verifiedContact = (Contact) evalContactArgumentFlow.getVariableValue('verifiedContact');

        Test.stopTest();

        // Verify that the resolutionAttempt was successful
        System.assertEquals(true, isSuccess, 'Expected the isSuccess flag to be set to true');
        System.assertEquals(false, hasError, 'Expected the hasError flag to be false');
        System.assertEquals(null, parentAccount, 'Expected no parentAccount to be returned');
        System.assert(parentB2CCustomerList != null, 'Expected a valid B2C CustomerList to be returned');
        System.assert(flowSourceContact != null, 'Expected a valid sourceContact to be provided with the flowResults');

    }

    /**
     * @description This test attempts to resolve a Contact profile that does not exist with
     * an in-valid B2C CustomerList.  It should return an error with no parentCustomerList
     * identified.
     */
    @IsTest
    static void testSourceContactB2CCustomerListInValidFailure() {

        // Seed the testData
        prepareTestData();

        // Initialize local Variables
        Map<String, Object> flowArguments;
        Flow.Interview evalContactArgumentFlow;

        // Initialize the testContact record
        Contact sourceContact = new Contact(
            FirstName = 'Anonymous',
            LastName = 'Customer',
            Email = 'test-user@b2csa.qa.salesforce.com',
            B2C_Customer_ID__c = 'bcdKh1ixccNKau8lFXjFMaTEoj',
            B2C_CustomerList_ID__c = 'Unknown',
            B2C_Customer_No__c = '00013505'
        );

        // Initialize the flow outputVariables
        List<String> errorMessage;
        Boolean hasError;
        Boolean hasIdentifiers;
        Boolean isSuccess;
        Boolean isVerified;
        Account parentAccount;
        B2C_CustomerList__c parentB2CCustomerList;
        Contact flowSourceContact;
        Contact verifiedContact;

        // Initialize the flow arguments
        flowArguments = new Map<String, Object>();
        flowArguments.put('sourceContact', sourceContact);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        evalContactArgumentFlow = Flow.Interview.createInterview('B2CCommerce_Process_Contact_EvaluateContactArgument', flowArguments);

        Test.startTest();

            // Initialize the flow and start it
            evalContactArgumentFlow.start();

            // Retrieve the output arguments
            errorMessage = (List<String>) evalContactArgumentFlow.getVariableValue('ErrorMessage');
            hasError = (Boolean) evalContactArgumentFlow.getVariableValue('hasError');
            hasIdentifiers = (Boolean) evalContactArgumentFlow.getVariableValue('hasIdentifiers');
            isSuccess = (Boolean) evalContactArgumentFlow.getVariableValue('isSuccess');
            isVerified = (Boolean) evalContactArgumentFlow.getVariableValue('isVerified');
            parentAccount = (Account) evalContactArgumentFlow.getVariableValue('parentAccount');
            parentB2CCustomerList = (B2C_CustomerList__c) evalContactArgumentFlow.getVariableValue('parentB2CCustomerList');
            flowSourceContact = (Contact) evalContactArgumentFlow.getVariableValue('sourceContact');
            verifiedContact = (Contact) evalContactArgumentFlow.getVariableValue('verifiedContact');

        Test.stopTest();

        // Verify that the resolutionAttempt was successful
        System.assertEquals(false, isSuccess, 'Expected the isSuccess flag to be set to false');
        System.assertEquals(true, hasError, 'Expected the hasError flag to be true');
        System.assert(ErrorMessage.size() > 0, 'Expected at least one (1) error to be returned by this flow');
        System.assertEquals(null, parentAccount, 'Expected no parentAccount to be returned');
        System.assertEquals(null, parentB2CCustomerList, 'Expected no parent B2C CustomerList to be returned');
        System.assert(flowSourceContact != null, 'Expected a valid sourceContact to be provided with the flowResults');

    }

    /**
     * @description This test attempts to resolve a Contact profile that exists by
     * the B2C CustomerID value. It expects to resolve a Contact using the B2C Customer ID.
     */
    @IsTest
    static void testResolveByB2CCustomerIDSuccess() {

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
        Account testAccount = (Account) TestDataFactory.createSObject('Account', new Map<String,Object>{
            'Name' => 'Registered Customer',
            'RecordTypeId' => B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getAccountRecordTypeDeveloperName()).Id
        });

        // Initialize the testContact record with the AccountId
        Contact myTestContact = (Contact) TestDataFactory.createSObject('Contact', new Map<String,Object>{
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
        Flow.Interview evalContactArgumentFlow;

        // Initialize the testContact record
        Contact sourceContact = new Contact(
            B2C_Customer_ID__c = 'test-customerid'
        );

        // Initialize the flow outputVariables
        List<String> errorMessage;
        Boolean hasError;
        Boolean hasIdentifiers;
        Boolean isSuccess;
        Boolean isVerified;
        Account parentAccount;
        B2C_CustomerList__c parentB2CCustomerList;
        Contact flowSourceContact;
        Contact verifiedContact;

        // Initialize the flow arguments
        flowArguments = new Map<String, Object>();
        flowArguments.put('sourceContact', sourceContact);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        evalContactArgumentFlow = Flow.Interview.createInterview('B2CCommerce_Process_Contact_EvaluateContactArgument', flowArguments);

        Test.startTest();

            // Initialize the flow and start it
            evalContactArgumentFlow.start();

            // Retrieve the output arguments
            errorMessage = (List<String>) evalContactArgumentFlow.getVariableValue('ErrorMessage');
            hasError = (Boolean) evalContactArgumentFlow.getVariableValue('hasError');
            hasIdentifiers = (Boolean) evalContactArgumentFlow.getVariableValue('hasIdentifiers');
            isSuccess = (Boolean) evalContactArgumentFlow.getVariableValue('isSuccess');
            isVerified = (Boolean) evalContactArgumentFlow.getVariableValue('isVerified');
            parentAccount = (Account) evalContactArgumentFlow.getVariableValue('parentAccount');
            parentB2CCustomerList = (B2C_CustomerList__c) evalContactArgumentFlow.getVariableValue('parentB2CCustomerList');
            flowSourceContact = (Contact) evalContactArgumentFlow.getVariableValue('sourceContact');
            verifiedContact = (Contact) evalContactArgumentFlow.getVariableValue('verifiedContact');

        Test.stopTest();

        // Verify that the resolutionAttempt was successful
        System.assertEquals(true, isSuccess, 'Expected the isSuccess flag to be set to true');
        System.assertEquals(false, hasError, 'Expected the hasError flag to be false');
        System.assertEquals(null, parentAccount, 'Did not expect a parentAccount to be returned');
        System.assertEquals(null, parentB2CCustomerList, 'DId not expected a parent B2C CustomerList to be returned');
        System.assert(flowSourceContact != null, 'Expected a valid sourceContact to be provided with the flowResults');

    }

}
