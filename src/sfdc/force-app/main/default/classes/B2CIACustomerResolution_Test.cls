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

    // Initialize the test variables describing contact attributes
    public static String testCustomerListID = 'customerList';
    public static String testCustomerListID1 = 'customerList1';
    public static String testCustomerListID2 = 'customerList2';
    public static String testCustomerID = 'customerId';
    public static String testCustomerID1 = 'customerId1';
    public static String testCustomerID2 = 'customerId2';
    public static String testEmail = 'test@user.com';
    public static String testEmail1 = 'test@one.user.com';
    public static String testEmail2 = 'test@two.user.com';
    public static String testCustomerNo = 'customerNo';
    public static String testCustomerNo1 = 'customerNo1';
    public static String testCustomerNo2 = 'customerNo2';
    public static String testLastName = 'LastName';
    public static String testLastName1 = 'LastName1';
    public static String testLastName2 = 'LastName2';
    public static String testLastName3 = 'LastName3';
    public static String testLastNameDefault = 'Unknown';

    /**
     * @description Setup method that creates the customerList record(s) required to support testing.
     */
    @TestSetup static void setup() {

        // Setup a single customerList we can use for testing / validation
        TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
            'Name' => 'customerList',
            'Is_Active__c' => true,
            'API_Url__c' => 'https://www.salesforce.com',
            'B2C_Instance__r.Is_Active__c' => true,
            'B2C_Instance__r.API_Url__c' => 'https://www.salesforce.com',
            'Enable_Profile_Publishing__c' => true,
            'Enable_Profile_Creation__c' => true
        });

        // Setup a second customerList for testing / validation
        TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
            'Name' => 'customerList1',
            'Is_Active__c' => true,
            'API_Url__c' => 'https://www.salesforce.com',
            'B2C_Instance__r.Is_Active__c' => true,
            'B2C_Instance__r.API_Url__c' => 'https://www.salesforce.com',
            'Enable_Profile_Publishing__c' => true,
            'Enable_Profile_Creation__c' => true
        });

        // Setup a third customerList for testing / validation
        TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
            'Name' => 'customerList2',
            'Is_Active__c' => true,
            'API_Url__c' => 'https://www.salesforce.com',
            'B2C_Instance__r.Is_Active__c' => true,
            'B2C_Instance__r.API_Url__c' => 'https://www.salesforce.com',
            'Enable_Profile_Publishing__c' => true,
            'Enable_Profile_Creation__c' => true
        });

    }

    //----------------------------------------------------------------
    // START: Plumbing and Error Handling
    //----------------------------------------------------------------

    @IsTest
    private static void testResolveFailure() {

        // Initialize local variables
        List<B2CIACustomerResolutionResult> resolutionResults;
        List<List<Contact>> testContacts;

        Test.startTest();

            // Initialize the testContacts collection
            testContacts = new List<List<Contact>>();

            // Attempt to resolve the empty resultSet
            resolutionResults = B2CIACustomerResolution.resolve(testContacts);

        Test.stopTest();

        // Iterate over the collection of resolutionResults
        for (B2CIACustomerResolutionResult thisResult: resolutionResults) {

            // Validate than an error was thrown by the resolveMethod
            System.assert(thisResult.isError, 'Expected an error to be thrown as no sourceContacts were passed to the resolve() method');

        }

    }

    //----------------------------------------------------------------
    //   END: Plumbing and Error Handling
    //----------------------------------------------------------------

    //----------------------------------------------------------------
    // START: B2C CustomerID
    //----------------------------------------------------------------


    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerId.  It resolves a single record from
     * a single record.
     */
    @IsTest
    private static void testResolveByB2CCustomerIDNoCListSingleResult() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_ID__c', testCustomerID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_Customer_ID__c = testCustomerID
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the single result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and customerId.  It resolves a single record from
     * a single record.
     */
    @IsTest
    private static void testResolveByB2CCustomerIDSingleResult() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_ID__c', testCustomerID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            B2C_Customer_ID__c = testCustomerID
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the single result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and customerId.  It resolves a single record from
     * multiple records.
     */
    @IsTest
    private static void testResolveByB2CCustomerIDSingleResultFromMultiple() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_ID__c', testCustomerID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record with a different customerId
        contactToResolveMap.put('B2C_Customer_ID__c', testCustomerID1);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a third contact record with a different customerId
        contactToResolveMap.put('B2C_Customer_ID__c', testCustomerID2);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            B2C_Customer_ID__c = testCustomerID
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the single result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and customerId.  It resolves no records from
     * multiple records due to mis-matched customerId values.
     */
    @IsTest
    private static void testResolveByB2CCustomerIDZeroResultsFromMultiple() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_ID__c', testCustomerID1);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record with a different customerId
        contactToResolveMap.put('B2C_Customer_ID__c', testCustomerID2);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            B2C_Customer_ID__c = testCustomerID
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the zero-result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateZeroResultsFromMultiple(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and customerId.  It throws an error resulting from
     * mismatched secondary ID values.
     */
    @IsTest
    private static void testResolveByB2CCustomerIDValidationErrorCustomerNo() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_ID__c', testCustomerID);
        contactToResolveMap.put('B2C_Customer_No__c', testCustomerNo);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            B2C_Customer_ID__c = testCustomerID,
            B2C_Customer_No__c = testCustomerNo1
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the validationError occurred
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateValidationError(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and customerId.  It throws an error resulting from
     * mismatched secondary ID values.
     */
    @IsTest
    private static void testResolveByB2CCustomerIDValidationErrorCustomerList() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_ID__c', testCustomerID);
        contactToResolveMap.put('B2C_Customer_No__c', testCustomerNo);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID1,
            B2C_Customer_ID__c = testCustomerID,
            B2C_Customer_No__c = testCustomerNo
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the validationError occurred
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateValidationError(flowResults);

    }

    //----------------------------------------------------------------
    //   END: B2C CustomerID
    //----------------------------------------------------------------

    //----------------------------------------------------------------
    // START: B2C CustomerListID / B2C Customer No
    //----------------------------------------------------------------

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and customerNo.  It resolves a single record from
     * a single record.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDB2CCustomerNoSingleResult() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_No__c', testCustomerNo);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            B2C_Customer_No__c = testCustomerNo
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the single result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and customerNo.  It resolves a single record from
     * multiple records.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDB2CCustomerNoSingleResultFromMultiple() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_No__c', testCustomerNo);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record with a different customerNo
        contactToResolveMap.put('B2C_Customer_No__c', testCustomerNo1);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a third contact record with a different customerId
        contactToResolveMap.put('B2C_Customer_No__c', testCustomerNo2);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            B2C_Customer_No__c = testCustomerNo
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the single result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and customerNo.  It resolves no records from
     * multiple records due to mis-matched customerId values.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDB2CCustomerNoZeroResultsFromMultiple() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_No__c', testCustomerNo1);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record with a different customerId
        contactToResolveMap.put('B2C_Customer_No__c', testCustomerNo2);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            B2C_Customer_No__c = testCustomerNo
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the zero-result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateZeroResultsFromMultiple(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and customerNo.  It resolves multiple records resulting
     * from duplicates found in the platform.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDB2CCustomerNoMultipleResults() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_No__c', testCustomerNo);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second and third contact record (as duplicates)
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            B2C_Customer_No__c = testCustomerNo
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the zero-result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateMultipleResults(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and customerNo.  It throws an error resulting from
     * mismatched secondary ID values.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDB2CCustomerNoValidationErrorCustomerListID() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_ID__c', testCustomerID);
        contactToResolveMap.put('B2C_Customer_No__c', testCustomerNo);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            B2C_Customer_ID__c = testCustomerID1,
            B2C_Customer_No__c = testCustomerNo
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

        // Execute the flow results
        flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the validationError occurred
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateValidationError(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and customerNo.  It throws an error resulting from
     * mismatched secondary ID values.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDB2CCustomerNoValidationErrorCustomerID() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_ID__c', testCustomerID);
        contactToResolveMap.put('B2C_Customer_No__c', testCustomerNo);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID1,
            B2C_Customer_ID__c = testCustomerID,
            B2C_Customer_No__c = testCustomerNo
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the validationError occurred
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateValidationError(flowResults);

    }

    //----------------------------------------------------------------
    //   END: B2C CustomerListID / B2C Customer No
    //----------------------------------------------------------------

    //----------------------------------------------------------------
    // START: B2C CustomerListID / Email / LastName
    //----------------------------------------------------------------

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList, Email, and LastName.  It resolves a single record from
     * a single record.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailLastNameSingleResult() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail,
            LastName = testLastName
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the single result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList, Email, and LastName.  It resolves a single record from
     * multiple records.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailLastNameSingleResultFromMultiple() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record with a different customerListID
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID1);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a third contact record with a different customerListID
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID2);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail,
            LastName = testLastName
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the single result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList, Email, and LastName.  It resolves no records from
     * multiple records due to mis-matched email values.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailLastNameZeroResultsFromMultipleEmails() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record with a different Email / LastName
        contactToResolveMap.put('Email', testEmail1);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail2,
            LastName = testLastName
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the zero-result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateZeroResultsFromMultiple(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList, Email, and LastName.  It resolves no records from
     * multiple records due to mis-matched lastName values.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailLastNameZeroResultsFromMultipleLastNames() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record with a different Email / LastName
        contactToResolveMap.put('LastName', testLastName1);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a third contact record with a different Email / LastName
        contactToResolveMap.put('LastName', testLastName2);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail,
            LastName = testLastName3
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the zero-result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateMultipleResults(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList, Email, and LastName.  It resolves multiple records resulting
     * from duplicates found in the platform.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailLastNameMultipleResults() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second and third contact record (as duplicates)
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail,
            LastName = testLastName
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the zero-result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateMultipleResults(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList, Email, and LastName.  It throws an error resulting from
     * mismatched secondary ID values.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailLastNameNoValidationErrorCustomerID() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_ID__c', testCustomerID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            B2C_Customer_ID__c = testCustomerID1,
            Email = testEmail,
            LastName = testLastName
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the validationError occurred
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateValidationError(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList, Email, and LastName.  It throws an error resulting from
     * mismatched secondary ID values.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailLastNameNoValidationErrorCustomerNo() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_No__c', testCustomerNo);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
                B2C_CustomerList_ID__c = testCustomerListID,
                B2C_Customer_No__c = testCustomerNo1,
                Email = testEmail,
                LastName = testLastName
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the validationError occurred
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateValidationError(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList, Email, and LastName.  It resolves a single record from
     * a single record that has the default lastName.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailLastNameSingleResultDefaultLastName() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastNameDefault);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail,
            LastName = testLastName
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the single result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList, Email, and LastName.  It resolves multiple records from
     * multiple records that have the default lastName.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailLastNameZeroResultsFromMultipleDefaultLastNames() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastNameDefault);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create multiple contact records
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail,
            LastName = testLastName
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the filter result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateMultipleResults(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList, Email, and LastName.  It resolves a single record from
     * multiple records using the default lastName.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailLastNameSingleResultFromMultipleDefaultLastNames() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastNameDefault);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record with a different customerListID
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID1);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a third contact record with a different customerListID
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID2);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
                B2C_CustomerList_ID__c = testCustomerListID,
                Email = testEmail,
                LastName = testLastName
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the single result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList, Email, and LastName.  It resolves a single record from
     * multiple records using the default / customer-specific lastNames.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailLastNameSingleResultFromMultipleMixedLastNames() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record with a different lastName
        contactToResolveMap.put('LastName', testLastNameDefault);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a third contact record with a different customerListID
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID1);
        contactToResolveMap.put('LastName', testLastNameDefault);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a fourth contact record with a different customerListID
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID2);
        contactToResolveMap.put('LastName', testLastName);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail,
            LastName = testLastName
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the single result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    //----------------------------------------------------------------
    //   END: B2C CustomerListID / Email / LastName
    //----------------------------------------------------------------

    //----------------------------------------------------------------
    // START: B2C CustomerListID / Email
    //----------------------------------------------------------------

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and Email.  It resolves a single record from
     * a single record.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailSingleResult() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the single result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and Email.  It resolves a single record from
     * a single record with the default lastName.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailSingleResultLastNameDefault() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastNameDefault);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the single result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and Email.  It resolves a single record from
     * multiple records.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailSingleResultFromMultiple() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record with a different customerListID
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID1);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a third contact record with a different customerListID
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID2);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the single result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and Email.  It resolves a single record from
     * multiple records.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailSingleResultFromMultipleLastNameDefault() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastNameDefault);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record with a different customerListID
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID1);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a third contact record with a different customerListID
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID2);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the single result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and Email.  It resolves no records from
     * multiple records due to mis-matched email values.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailZeroResultsFromMultipleEmails() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record with a different Email / LastName
        contactToResolveMap.put('Email', testEmail1);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail2
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the zero-result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateZeroResultsFromMultiple(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and Email.  It resolves no records from
     * multiple records due to mis-matched lastName values.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailZeroResultsFromMultipleB2CCustomerListIDs() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record with a different Email / LastName
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID1);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID2,
            Email = testEmail
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the zero-result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateZeroResultsFromMultiple(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and Email.  It resolves multiple records resulting
     * from duplicates found in the platform.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailMultipleResults() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second and third contact record (as duplicates)
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the zero-result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateMultipleResults(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and Email.  It resolves multiple records resulting
     * from duplicates found in the platform.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailMultipleResultsLastNames() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record (as a duplicate)
        contactToResolveMap.put('LastName', testLastName1);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a third contact record (as a duplicate)
        contactToResolveMap.put('LastName', testLastName2);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the zero-result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateMultipleResults(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and Email.  It resolves multiple records resulting
     * from duplicates found in the platform.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailMultipleResultsLastNameDefault() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastNameDefault);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second and third contact record (as duplicates)
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the zero-result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateMultipleResults(flowResults);

    }


    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and Email.  It throws an error resulting from
     * mismatched secondary ID values.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailNoValidationErrorCustomerID() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_ID__c', testCustomerID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            B2C_Customer_ID__c = testCustomerID1,
            Email = testEmail
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the validationError occurred
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateValidationError(flowResults);

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and Email.  It throws an error resulting from
     * mismatched secondary ID values.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailNoValidationErrorCustomerNo() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('B2C_Customer_No__c', testCustomerNo);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            B2C_Customer_No__c = testCustomerNo1,
            Email = testEmail
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the validationError occurred
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateValidationError(flowResults);

    }

    //----------------------------------------------------------------
    //   END: B2C CustomerListID / Email
    //----------------------------------------------------------------

    //----------------------------------------------------------------
    // BEGIN: Misc Tests (edge cases)
    //----------------------------------------------------------------

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList, Email, and LastName.  It should resolve a contact record
     * that matches on email and lastName -- but has no customerList association.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailLastNameSingleResultByEmailLastNameNoCustomerList() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail,
            LastName = testLastName
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the contact was successfully resolved
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }


    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList, Email, and LastName.  It resolves its own record.
     */
    @IsTest
    private static void testResolveByB2CCustomerListIDEmailLastNameSingleExact() {

        // Initialize local variables
        Map<String, Object> flowResults;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactToResolveMap;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', testCustomerListID);
        contactToResolveMap.put('Email', testEmail);
        contactToResolveMap.put('LastName', testLastName);

        // Create the Contact record to resolve
        contactToResolve = B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a second contact record (as a duplicate)
        contactToResolveMap.put('LastName', testLastName1);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Create a third contact record (as a duplicate)
        contactToResolveMap.put('LastName', testLastName2);
        B2CIACustomerResolution_TestHelper.createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            B2C_CustomerList_ID__c = testCustomerListID,
            Email = testEmail,
            LastName = testLastName
        );

        Test.startTest();
        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------

            // Execute the flow results
            flowResults = B2CIACustomerResolution_TestHelper.executeResolutionProcess(testContact);

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Validate the zero-result details
        System.assert(flowResults != null, 'Expected the flowResults to represent an instantiated map');
        B2CIACustomerResolution_TestHelper.validateSingleResult(flowResults, contactToResolve);

    }

    //----------------------------------------------------------------
    //   END: Misc Tests (edge cases)
    //----------------------------------------------------------------


}
