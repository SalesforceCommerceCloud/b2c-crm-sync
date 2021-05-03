/**
 * @author Eric Schultz
 * @date Feb 27, 2020
 *
 * @see B2CIACustomerResolution.resolve
 * @description This testClass is used to exercise different customerResolution
 * scenarios driven by Contact details.
 */
@IsTest
private class B2CIACustomerResolution_Test extends B2CIACustomerResolution_TestHelper {

    /**
     * @description Setup method that creates the customerList record(s) required to support testing.
     */
    @TestSetup static void setup() {

        // Setup a single customerList we can use for testing / validation
        B2C_CustomerList__c customerList = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
            'Name' => 'customerList',
            'Is_Active__c' => true,
            'API_Url__c' => 'https://www.salesforce.com',
            'B2C_Instance__r.Is_Active__c' => true,
            'B2C_Instance__r.API_Url__c' => 'https://www.salesforce.com',
            'Enable_Profile_Publishing__c' => true,
            'Enable_Profile_Creation__c' => true
        });

        // Setup a second customerList for testing / validation
        B2C_CustomerList__c customerList2 = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
                'Name' => 'customerList2',
                'Is_Active__c' => true,
                'API_Url__c' => 'https://www.salesforce.com',
                'B2C_Instance__r.Is_Active__c' => true,
                'B2C_Instance__r.API_Url__c' => 'https://www.salesforce.com',
                'Enable_Profile_Publishing__c' => true,
                'Enable_Profile_Creation__c' => true
        });

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerId.
     */
    @IsTest
    private static void testResolveB2CCustomerID() {

        // Initialize local variables
        List<List<Contact>> contactResolvedList;
        List<Contact> contactFilteredList;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactFilterMap;
        Map<String, Object> contactToResolveMap;
        Boolean flowIsSuccess;
        List<String> flowErrors;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', 'customerList');
        contactToResolveMap.put('B2C_Customer_ID__c', 'customerId');
        contactToResolveMap.put('Email', 'test@user.com');
        contactToResolveMap.put('LastName', 'Unknown');

        // Create the Contact record to resolve
        contactToResolve = createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            Email = 'test@user.com',
            B2C_CustomerList_ID__c = 'customerList',
            B2C_Customer_ID__c = 'customerId'
        );

        // Initialize the resolved and filtered lists
        contactResolvedList = new List<List<Contact>>();
        contactFilteredList = new List<Contact>();
        contactFilterMap = new Map<String, Object>();

        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------
        Test.startTest();

            // Retrieve the collection of resolved contacts
            contactResolvedList = B2CIACustomerResolution.resolve(new List<Contact>{testContact});

            // Build the filterMap
            contactFilterMap.put('Contact', testContact);
            contactFilterMap.put('ContactMatches', contactResolvedList[0]);

            // Execute the filterMap flow attempt to resolve the specific contact identified
            Flow.Interview.B2C_Commerce_Contact_Filter_Matches contactFilterMatchFlow = new Flow.Interview.B2C_Commerce_Contact_Filter_Matches(contactFilterMap);

            // Initialize the flow and start it
            contactFilterMatchFlow.start();

            // Collect the flow results
            contactFilteredList = (List<Contact>) contactFilterMatchFlow.getVariableValue('ContactMatchesResult');

            // Capture the flow output variables
            flowIsSuccess = (Boolean) contactFilterMatchFlow.getVariableValue('isSuccess');
            flowErrors = (List<String>) contactFilterMatchFlow.getVariableValue('errors');

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Assert that the resolution class and filterFlow return predictable results
        System.assert(contactResolvedList.size() != 0, 'Expected the customerResolution class to return at least one (1) record');
        System.assert(contactFilteredList.size() != 0, 'Expected the filterMatches flow to return at least one (1) record');
        System.assertEquals(true, flowIsSuccess, 'Expected the isSuccess flag to be set to true');
        System.assertEquals(null, flowErrors, 'Expected the errors collection to be empty');
        System.assertEquals(1, contactFilteredList.size(), 'Expected the collection of resolvedContacts to have a length of one');
        System.assertEquals(contactFilteredList[0].Id, contactToResolve.Id, 'Expected the testContact and resolvedContact identifiers to match');

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a B2C customerList and customerNo.
     */
    @IsTest
    private static void testResolveB2CCustomerListCustomerNo() {

        // Initialize local variables
        List<List<Contact>> contactResolvedList;
        List<Contact> contactFilteredList;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactFilterMap;
        Map<String, Object> contactToResolveMap;
        Boolean flowIsSuccess;
        List<String> flowErrors;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', 'customerList');
        contactToResolveMap.put('B2C_Customer_No__c', 'customerNo');
        contactToResolveMap.put('Email', 'test@user.com');
        contactToResolveMap.put('LastName', 'Unknown');

        // Create the Contact record to resolve
        contactToResolve = createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            Email = 'test@user.com',
            B2C_CustomerList_ID__c = 'customerList',
            B2C_Customer_No__c = 'customerNo'
        );

        // Initialize the resolved and filtered lists
        contactResolvedList = new List<List<Contact>>();
        contactFilteredList = new List<Contact>();
        contactFilterMap = new Map<String, Object>();

        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------
        Test.startTest();

            // Retrieve the collection of resolved contacts
            contactResolvedList = B2CIACustomerResolution.resolve(new List<Contact>{testContact});

            // Build the filterMap
            contactFilterMap.put('Contact', testContact);
            contactFilterMap.put('ContactMatches', contactResolvedList[0]);

            // Execute the filterMap flow attempt to resolve the specific contact identified
            Flow.Interview.B2C_Commerce_Contact_Filter_Matches contactFilterMatchFlow = new Flow.Interview.B2C_Commerce_Contact_Filter_Matches(contactFilterMap);

            // Initialize the flow and start it
            contactFilterMatchFlow.start();

            // Collect the flow results
            contactFilteredList = (List<Contact>) contactFilterMatchFlow.getVariableValue('ContactMatchesResult');

            // Capture the flow output variables
            flowIsSuccess = (Boolean) contactFilterMatchFlow.getVariableValue('isSuccess');
            flowErrors = (List<String>) contactFilterMatchFlow.getVariableValue('errors');

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Assert that the resolution class and filterFlow return predictable results
        System.assert(contactResolvedList.size() != 0, 'Expected the customerResolution class to return at least one (1) record');
        System.assert(contactFilteredList.size() != 0, 'Expected the filterMatches flow to return at least one (1) record');
        System.assertEquals(true, flowIsSuccess, 'Expected the isSuccess flag to be set to true');
        System.assertEquals(null, flowErrors, 'Expected the errors collection to be empty');
        System.assertEquals(1, contactFilteredList.size(), 'Expected the collection of resolvedContacts to have a length of one');
        System.assertEquals(contactFilteredList[0].Id, contactToResolve.Id, 'Expected the testContact and resolvedContact identifiers to match');

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList, email address, and lastName.
     */
    @IsTest
    private static void testResolveB2CCustomerListEmailWithLastName() {

        // Initialize local variables
        List<List<Contact>> contactResolvedList;
        List<Contact> contactFilteredList;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactFilterMap;
        Map<String, Object> contactToResolveMap;
        Boolean flowIsSuccess;
        List<String> flowErrors;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', 'customerList');
        contactToResolveMap.put('Email', 'test@user.com');
        contactToResolveMap.put('LastName', 'Smith');

        // Create the Contact record to resolve
        contactToResolve = createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            Email = 'test@user.com',
            B2C_CustomerList_ID__c = 'customerList',
            LastName = 'Smith'
        );

        // Initialize the resolved and filtered lists
        contactResolvedList = new List<List<Contact>>();
        contactFilteredList = new List<Contact>();
        contactFilterMap = new Map<String, Object>();

        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------
        Test.startTest();

            // Retrieve the collection of resolved contacts
            contactResolvedList = B2CIACustomerResolution.resolve(new List<Contact>{testContact});

            // Build the filterMap
            contactFilterMap.put('Contact', testContact);
            contactFilterMap.put('ContactMatches', contactResolvedList[0]);

            // Execute the filterMap flow attempt to resolve the specific contact identified
            Flow.Interview.B2C_Commerce_Contact_Filter_Matches contactFilterMatchFlow = new Flow.Interview.B2C_Commerce_Contact_Filter_Matches(contactFilterMap);

            // Initialize the flow and start it
            contactFilterMatchFlow.start();

            // Collect the flow results
            contactFilteredList = (List<Contact>) contactFilterMatchFlow.getVariableValue('ContactMatchesResult');

            // Capture the flow output variables
            flowIsSuccess = (Boolean) contactFilterMatchFlow.getVariableValue('isSuccess');
            flowErrors = (List<String>) contactFilterMatchFlow.getVariableValue('errors');

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Assert that the resolution class and filterFlow return predictable results
        System.assert(contactResolvedList.size() != 0, 'Expected the customerResolution class to return at least one (1) record');
        System.assert(contactFilteredList.size() != 0, 'Expected the filterMatches flow to return at least one (1) record');
        System.assertEquals(true, flowIsSuccess, 'Expected the isSuccess flag to be set to true');
        System.assertEquals(null, flowErrors, 'Expected the errors collection to be empty');
        System.assertEquals(1, contactFilteredList.size(), 'Expected the collection of resolvedContacts to have a length of one');
        System.assertEquals(contactFilteredList[0].Id, contactToResolve.Id, 'Expected the testContact and resolvedContact identifiers to match');

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to resolve
     * a Contact record via a customerList and email address -- and an unknown lastName.  The lastName
     * uses the default lastName leveraged by b2c-crm-sync for email / customerList scenarios.
     */
    @IsTest
    private static void testResolveB2CCustomerListEmailWithUnknownLastName() {

        // Initialize local variables
        List<List<Contact>> contactResolvedList;
        List<Contact> contactFilteredList;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactFilterMap;
        Map<String, Object> contactToResolveMap;
        Boolean flowIsSuccess;
        List<String> flowErrors;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', 'customerList');
        contactToResolveMap.put('Email', 'test@user.com');
        contactToResolveMap.put('LastName', 'Unknown');

        // Create the Contact record to resolve
        contactToResolve = createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
            Email = 'test@user.com',
            B2C_CustomerList_ID__c = 'customerList',
            LastName = 'Smith'
        );

        // Initialize the resolved and filtered lists
        contactResolvedList = new List<List<Contact>>();
        contactFilteredList = new List<Contact>();
        contactFilterMap = new Map<String, Object>();

        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------
        Test.startTest();

        // Retrieve the collection of resolved contacts
        contactResolvedList = B2CIACustomerResolution.resolve(new List<Contact>{testContact});

        // Build the filterMap
        contactFilterMap.put('Contact', testContact);
        contactFilterMap.put('ContactMatches', contactResolvedList[0]);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        Flow.Interview.B2C_Commerce_Contact_Filter_Matches contactFilterMatchFlow = new Flow.Interview.B2C_Commerce_Contact_Filter_Matches(contactFilterMap);

        // Initialize the flow and start it
        contactFilterMatchFlow.start();

        // Collect the flow results
        contactFilteredList = (List<Contact>) contactFilterMatchFlow.getVariableValue('ContactMatchesResult');

        // Capture the flow output variables
        flowIsSuccess = (Boolean) contactFilterMatchFlow.getVariableValue('isSuccess');
        flowErrors = (List<String>) contactFilterMatchFlow.getVariableValue('errors');

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Assert that the resolution class and filterFlow return predictable results
        System.assert(contactResolvedList.size() != 0, 'Expected the customerResolution class to return at least one (1) record');
        System.assert(contactFilteredList.size() != 0, 'Expected the filterMatches flow to return at least one (1) record');
        System.assertEquals(true, flowIsSuccess, 'Expected the isSuccess flag to be set to true');
        System.assertEquals(null, flowErrors, 'Expected the errors collection to be empty');
        System.assertEquals(1, contactFilteredList.size(), 'Expected the collection of resolvedContacts to have a length of one');
        System.assertEquals(contactFilteredList[0].Id, contactToResolve.Id, 'Expected the testContact and resolvedContact identifiers to match');

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to confirm
     * that resolution will not occur on records with different B2C customerIds.
     */
    @IsTest
    private static void testDoesNotResolveTwoB2CCustomerIDs() {

        // Initialize local variables
        List<List<Contact>> contactResolvedList;
        List<Contact> contactFilteredList;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactFilterMap;
        Map<String, Object> contactToResolveMap;
        Boolean flowIsSuccess;
        List<String> flowErrors;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', 'customerList');
        contactToResolveMap.put('B2C_Customer_ID__c', 'customerId1');
        contactToResolveMap.put('Email', 'test@user.com');
        contactToResolveMap.put('LastName', 'Smith');

        // Create the Contact record to resolve
        contactToResolve = createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
                Email = 'test@user.com',
                B2C_Customer_ID__c = 'customerId2',
                B2C_CustomerList_ID__c = 'customerList',
                LastName = 'Smith'
        );

        // Initialize the resolved and filtered lists
        contactResolvedList = new List<List<Contact>>();
        contactFilteredList = new List<Contact>();
        contactFilterMap = new Map<String, Object>();

        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------
        Test.startTest();

        // Retrieve the collection of resolved contacts
        contactResolvedList = B2CIACustomerResolution.resolve(new List<Contact>{testContact});

        // Build the filterMap
        contactFilterMap.put('Contact', testContact);
        contactFilterMap.put('ContactMatches', contactResolvedList[0]);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        Flow.Interview.B2C_Commerce_Contact_Filter_Matches contactFilterMatchFlow = new Flow.Interview.B2C_Commerce_Contact_Filter_Matches(contactFilterMap);

        // Initialize the flow and start it
        contactFilterMatchFlow.start();

        // Collect the flow results
        contactFilteredList = (List<Contact>) contactFilterMatchFlow.getVariableValue('ContactMatchesResult');

        // Capture the flow output variables
        flowIsSuccess = (Boolean) contactFilterMatchFlow.getVariableValue('isSuccess');
        flowErrors = (List<String>) contactFilterMatchFlow.getVariableValue('errors');

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Assert that the resolution class and filterFlow return predictable results
        System.assertEquals(1, contactResolvedList.size(), 'Expected the customerResolution class to return one (1) records');
        System.assertEquals(null, contactFilteredList, 'Expected the filterMatches flow to return zero records');
        System.assertEquals(false, flowIsSuccess, 'Expected the isSuccess flag to be set to false -- the customerIds do not match');
        System.assert(flowErrors.size() > 0, 'Expected the errors collection to contain at least one (1) error');

    }

    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to confirm
     * that resolution will not occur on records with the same customerList and email -- but
     * different lastNames.
     */
    @IsTest
    private static void testDoesNotResolveContactWithDifferentLastName() {

        // Initialize local variables
        List<List<Contact>> contactResolvedList;
        List<Contact> contactFilteredList;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactFilterMap;
        Map<String, Object> contactToResolveMap;
        Boolean flowIsSuccess;
        List<String> flowErrors;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', 'customerList');
        contactToResolveMap.put('Email', 'test@user.com');
        contactToResolveMap.put('LastName', 'Smith');

        // Create the Contact record to resolve
        contactToResolve = createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
                Email = 'test@user.com',
                B2C_CustomerList_ID__c = 'customerList',
                LastName = 'Jones'
        );

        // Initialize the resolved and filtered lists
        contactResolvedList = new List<List<Contact>>();
        contactFilteredList = new List<Contact>();
        contactFilterMap = new Map<String, Object>();

        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------
        Test.startTest();

        // Retrieve the collection of resolved contacts
        contactResolvedList = B2CIACustomerResolution.resolve(new List<Contact>{testContact});

        // Build the filterMap
        contactFilterMap.put('Contact', testContact);
        contactFilterMap.put('ContactMatches', contactResolvedList[0]);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        Flow.Interview.B2C_Commerce_Contact_Filter_Matches contactFilterMatchFlow = new Flow.Interview.B2C_Commerce_Contact_Filter_Matches(contactFilterMap);

        // Initialize the flow and start it
        contactFilterMatchFlow.start();

        // Collect the flow results
        contactFilteredList = (List<Contact>) contactFilterMatchFlow.getVariableValue('ContactMatchesResult');

        // Capture the flow output variables
        flowIsSuccess = (Boolean) contactFilterMatchFlow.getVariableValue('isSuccess');
        flowErrors = (List<String>) contactFilterMatchFlow.getVariableValue('errors');

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Assert that the resolution class and filterFlow return predictable results
        System.assertEquals(1, contactResolvedList.size(), 'Expected the customerResolution class to return one (1) records');
        System.assertEquals(null, contactFilteredList, 'Expected the filterMatches flow to return zero records');
        System.assertEquals(true, flowIsSuccess, 'Expected the isSuccess flag to be set to true -- the lastNames do not match');
        System.assertEquals(null, flowErrors, 'Expected the errors collection to contain zero errors');

    }


    /**
     * @see B2CIACustomerResolution.findDupes
     * @description This test-case exercises the CustomerResolution IA and attempts to confirm
     * that resolution will not occur on records with different customerList attributes -- but
     * similar non-identifier contact properties.
     */
    @IsTest
    private static void testDoesNotResolveContactWithDifferentB2CCustomerListIDs() {

        // Initialize local variables
        List<List<Contact>> contactResolvedList;
        List<Contact> contactFilteredList;
        Contact contactToResolve;
        Contact testContact;
        Map<String, Object> contactFilterMap;
        Map<String, Object> contactToResolveMap;
        Boolean flowIsSuccess;
        List<String> flowErrors;

        // Initialize the map describing the contact to create
        contactToResolveMap = new Map<String, Object>();

        // Define the map representing the Account / Contact record
        contactToResolveMap.put('B2C_CustomerList_ID__c', 'customerList');
        contactToResolveMap.put('Email', 'test@user.com');
        contactToResolveMap.put('LastName', 'Smith');

        // Create the Contact record to resolve
        contactToResolve = createContact(contactToResolveMap);

        // Define the Contact record to resolve
        testContact = new Contact(
                Email = 'test@user.com',
                B2C_CustomerList_ID__c = 'customerList2',
                LastName = 'Jones'
        );

        // Initialize the resolved and filtered lists
        contactResolvedList = new List<List<Contact>>();
        contactFilteredList = new List<Contact>();
        contactFilterMap = new Map<String, Object>();

        //-------------------------------------------
        // Test: Start exercising the resolutionFlow
        //-------------------------------------------
        Test.startTest();

        // Retrieve the collection of resolved contacts
        contactResolvedList = B2CIACustomerResolution.resolve(new List<Contact>{testContact});

        // Build the filterMap
        contactFilterMap.put('Contact', testContact);
        contactFilterMap.put('ContactMatches', contactResolvedList[0]);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        Flow.Interview.B2C_Commerce_Contact_Filter_Matches contactFilterMatchFlow = new Flow.Interview.B2C_Commerce_Contact_Filter_Matches(contactFilterMap);

        // Initialize the flow and start it
        contactFilterMatchFlow.start();

        // Collect the flow results
        contactFilteredList = (List<Contact>) contactFilterMatchFlow.getVariableValue('ContactMatchesResult');

        // Capture the flow output variables
        flowIsSuccess = (Boolean) contactFilterMatchFlow.getVariableValue('isSuccess');
        flowErrors = (List<String>) contactFilterMatchFlow.getVariableValue('errors');

        //-------------------------------------------
        // Test: Finish exercising the resolutionFlow
        //-------------------------------------------
        Test.stopTest();

        // Assert that the resolution class and filterFlow return predictable results
        System.assertEquals(1, contactResolvedList.size(), 'Expected the customerResolution class to return one (1) records');
        System.assertEquals(null, contactFilteredList, 'Expected the filterMatches flow to return zero records');
        System.assertEquals(true, flowIsSuccess, 'Expected the isSuccess flag to be set to true');
        System.assertEquals(null, flowErrors, 'Expected the errors collection to contain zero errors');

    }

}
