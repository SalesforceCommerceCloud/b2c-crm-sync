/**
 * @author Eric Schultz
 * @date April 21th, 2021
 *
 * @description This class exercises customerResolution for personAccounts.
 *
 * - Matches by customerid
 * - Matches customerno and customerlist
 * - Does not match 2 contacts spanning different customerlists
 * - Matches just last name and email
 * - Does not match contact with different last name
 * - Matches email, last name, customer list id
 * - Does not match different customer ids
*/
@IsTest
public class B2CIACustomerResolutionPA_Test {

    /**
     * @description This method creates the default customerList leveraged by personAccounts as part
     * of the resolution process (each Contact / PersonAccount must be associated to a customerList).
     */
    @TestSetup static void setup() {
        TestDataFactory.createSObject(
            'B2C_CustomerList__c',
            new Map<String,Object>{
                'Name' => 'customerList',
                'Is_Active__c' => true,
                'API_Url__c' => 'https://www.salesforce.com',
                'B2C_Instance__r.Is_Active__c' => true,
                'B2C_Instance__r.API_Url__c' => 'https://www.salesforce.com',
                'Enable_Profile_Publishing__c' => true,
                'Enable_Profile_Creation__c' => true
            }
        );

    }

    /**
     * @see B2CIACustomerResolution.resolve
     * @description
     * Given: Existing person account with a last name, email, customer id
     *  When: We resolve with a customer with a different last name, email, but same customer id
     *  Then: We will be returned the existing person account
     **/
    @IsTest
    static void resolvesCustomerId() {
        // Create the test / parent Account
        Account account = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'PersonEmail' => 'differntemail@email.com',
            'LastName' => 'DifferentLastName',
            'B2C_Customer_ID__pc' => 'customerid',
            'RecordTypeId' => B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getPersonAccountRecordTypeDeveloperName()).Id
        });

        // Create the childContact
        Contact c1 = new Contact(
            Email = 'email@email.com',
            LastName = 'LastName',
            B2C_Customer_ID__c = 'customerid'
        );

        // Create the local working variables
        List<B2CIACustomerResolutionResult> contactResolvedList = new List<B2CIACustomerResolutionResult>();
        List<Contact> contactFilteredList = new List<Contact>();
        List<Contact> resolutionContactList = new List<Contact>();
        List<List<Contact>> resolutionArguments = new List<List<Contact>>();

        Test.startTest();

            // Initialize the resolution arguments
            resolutionContactList.add(c1);
            resolutionArguments.add(resolutionContactList);

            // Create the list of resolved contacts
            contactResolvedList = B2CIACustomerResolution.resolve(resolutionArguments);

            // Default the working collections leveraged by the resolution / filter process
            B2CIACustomerResolutionResult resolutionResults = contactResolvedList.get(0);
            Map<String, Object> contactFilterMap = new Map<String, Object>();

            // Add the test contact to the flowArguments
            contactFilterMap.put(
                'Contact',
                c1
            );

            // Add the matches to the flowArguments
            contactFilterMap.put(
                'ContactMatches',
                resolutionResults.contactList
            );

            // Create the flow interview to process the arguments
            Flow.Interview.B2CCommerce_Process_ContactFilterMatches contactFilterMatchFlow =
                new Flow.Interview.B2CCommerce_Process_ContactFilterMatches(contactFilterMap);

            // Start the flow
            contactFilterMatchFlow.start();

            // Retrieve the list of filtered contacts
            contactFilteredList = (List<Contact>)(contactFilterMatchFlow.getVariableValue('ContactMatchesResult'));

        Test.stopTest();

        // Validate that our contact was matched-up
        System.assertEquals(
            contactFilteredList[0].Id,
            [SELECT Id FROM Contact WHERE AccountId = :account.Id LIMIT 1].Id
        );

    }

    /**
     * @see B2CIACustomerResolution.resolve
     * @description
     * Given: Existing person account with a last name, email, customer id, customer list id
     *  When: We resolve with a customer with a different last name, email, but same customer no and customer list id
     *  Then: We will be returned the existing person account
     */
    @IsTest
    static void resolvesCustomerNoAndCustomerList() {

        // Create the test / parent Account
        Account account = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'PersonEmail' => 'differntemail@email.com',
            'LastName' => 'DifferentLastName',
            'B2C_Customer_No__pc' => 'customerNo',
            'B2C_CustomerList_ID__pc' => 'customerList',
            'RecordTypeId' => B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getPersonAccountRecordTypeDeveloperName()).Id
        });

        // Create the childContact
        Contact c1 = new Contact(
            Email = 'email@email.com',
            LastName = 'LastName',
            B2C_Customer_No__c = 'customerNo',
            B2C_CustomerList_ID__c = 'customerList'
        );

        // Create the local working variables
        List<B2CIACustomerResolutionResult> contactResolvedList = new List<B2CIACustomerResolutionResult>();
        List<Contact> contactFilteredList = new List<Contact>();
        List<Contact> resolutionContactList = new List<Contact>();
        List<List<Contact>> resolutionArguments = new List<List<Contact>>();

        Test.startTest();

            // Initialize the resolution arguments
            resolutionContactList.add(c1);
            resolutionArguments.add(resolutionContactList);

            // Create the list of resolved contacts
            contactResolvedList = B2CIACustomerResolution.resolve(resolutionArguments);

            // Default the working collections leveraged by the resolution / filter process
            B2CIACustomerResolutionResult resolutionResults = contactResolvedList.get(0);
            Map<String, Object> contactFilterMap = new Map<String, Object>();

            // Add the test contact to the flowArguments
            contactFilterMap.put(
                'Contact',
                c1
            );

            // Add the matches to the flowArguments
            contactFilterMap.put(
                'ContactMatches',
                resolutionResults.contactList
            );

            // Create the flow interview to process the arguments
            Flow.Interview.B2CCommerce_Process_ContactFilterMatches contactFilterMatchFlow = new Flow.Interview.B2CCommerce_Process_ContactFilterMatches(contactFilterMap);

            // Start the flow
            contactFilterMatchFlow.start();

            // Retrieve the list of filtered contacts
            contactFilteredList = (List<Contact>)(contactFilterMatchFlow.getVariableValue('ContactMatchesResult'));

        Test.stopTest();

        // Validate that our contact was matched-up
        System.assertEquals(
            contactFilteredList[0].Id,
            [SELECT Id FROM Contact WHERE AccountId = :account.Id LIMIT 1].Id
        );

    }

    /**
     * @see B2CIACustomerResolution.resolve
     * @description
     * Given: Existing person account with a last name, customer list id and email
     *  When: We resolve with a customer with same list name and email and a customer list
     *  Then: We will be returned the existing person account
     */
    @IsTest
    static void resolvesContactWithCustomerListIdLastNameAndEmail() {
        // Create the test / parent Account
        Account account = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'PersonEmail' => 'email@email.com',
            'LastName' => 'LastName',
            'B2C_CustomerList_ID__pc' => 'CustomerList',
            'RecordTypeId' => B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getPersonAccountRecordTypeDeveloperName()).Id
        });

        // Create the childContact
        Contact c1 = new Contact(
            Email = 'email@email.com',
            LastName = 'LastName',
            B2C_CustomerList_ID__c = 'CustomerList'
        );

        // Create the local working variables
        List<B2CIACustomerResolutionResult> contactResolvedList = new List<B2CIACustomerResolutionResult>();
        List<Contact> contactFilteredList = new List<Contact>();
        List<Contact> resolutionContactList = new List<Contact>();
        List<List<Contact>> resolutionArguments = new List<List<Contact>>();

        Test.startTest();

            // Initialize the resolution arguments
            resolutionContactList.add(c1);
            resolutionArguments.add(resolutionContactList);

            // Create the list of resolved contacts
            contactResolvedList = B2CIACustomerResolution.resolve(resolutionArguments);

            // Default the working collections leveraged by the resolution / filter process
            B2CIACustomerResolutionResult resolutionResults = contactResolvedList.get(0);
            Map<String, Object> contactFilterMap = new Map<String, Object>();

            // Add the test contact to the flowArguments
            contactFilterMap.put(
                'Contact',
                c1
            );

            // Add the matches to the flowArguments
            contactFilterMap.put(
                'ContactMatches',
                resolutionResults.contactList
            );

            // Create the flow interview to process the arguments
            Flow.Interview.B2CCommerce_Process_ContactFilterMatches contactFilterMatchFlow = new Flow.Interview.B2CCommerce_Process_ContactFilterMatches(contactFilterMap);

            // Start the flow
            contactFilterMatchFlow.start();

            // Retrieve the list of filtered contacts
            contactFilteredList = (List<Contact>)(contactFilterMatchFlow.getVariableValue('ContactMatchesResult'));

        Test.stopTest();

        // Validate that our contact was matched-up
        System.assertEquals(
            contactFilteredList[0].Id,
            [SELECT Id FROM Contact WHERE AccountId = :account.Id LIMIT 1].Id,
            'Ids should match'
        );

    }

    /**
     * @see B2CIACustomerResolution.resolve
     * @description
     * Given: Existing person account with customer id
     *  When: We resolve with a customer with different customer id, same email, last name
     *  Then: We will be returned the existing person account
     */
    @IsTest
    static void doesNotResolveDifferentCustomerIds() {
        // Create the test / parent Account
        TestDataFactory.createSObject('Account', new Map<String,Object>{
            'PersonEmail' => 'email@email.com',
            'LastName' => 'LastName',
            'B2C_Customer_ID__pc' => 'CustomerId',
            'B2C_CustomerList_ID__pc' => 'customerList',
            'RecordTypeId' => B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getPersonAccountRecordTypeDeveloperName()).Id
        });

        // Create the childContact
        Contact c1 = new Contact(
            Email = 'email@email.com',
            LastName = 'LastName',
            B2C_CustomerList_ID__c = 'customerList',
            B2C_Customer_ID__c = 'CustomerId2'
        );

        // Create the local working variables
        List<B2CIACustomerResolutionResult> contactResolvedList = new List<B2CIACustomerResolutionResult>();
        List<Contact> contactFilteredList = new List<Contact>();
        List<Contact> resolutionContactList = new List<Contact>();
        List<List<Contact>> resolutionArguments = new List<List<Contact>>();

        Test.startTest();

            // Initialize the resolution arguments
            resolutionContactList.add(c1);
            resolutionArguments.add(resolutionContactList);

            // Create the list of resolved contacts
            contactResolvedList = B2CIACustomerResolution.resolve(resolutionArguments);

            // Default the working collections leveraged by the resolution / filter process
            B2CIACustomerResolutionResult resolutionResults = contactResolvedList.get(0);
            Map<String, Object> contactFilterMap = new Map<String, Object>();

            // Add the test contact to the flowArguments
            contactFilterMap.put(
                'Contact',
                c1
            );

            // Add the matches to the flowArguments
            contactFilterMap.put(
                'ContactMatches',
                resolutionResults.contactList
            );

            // Create the flow interview to process the arguments
            Flow.Interview.B2CCommerce_Process_ContactFilterMatches contactFilterMatchFlow = new Flow.Interview.B2CCommerce_Process_ContactFilterMatches(contactFilterMap);

            // Start the flow
            contactFilterMatchFlow.start();

            // Retrieve the list of filtered contacts
            contactFilteredList = (List<Contact>)(contactFilterMatchFlow.getVariableValue('ContactMatchesResult'));

        Test.stopTest();

        // Validate that our contact was matched-up
        System.assertEquals(
            contactFilteredList,
            null
        );

    }

    /**
     * @see B2CIACustomerResolution.resolve
     * @description
     * Given: 2 different customer lists and one person account existing for customer list 1
     *  When: We resolve with a customer with same last name and email with a different customer list
     *  Then: We will be returned a new contact
     */
    @IsTest
    static void createTwoContactsSpanningDifferentCustomerListIds() {
        // Create the test / parent Account
        TestDataFactory.createSObject('Account', new Map<String,Object>{
            'PersonEmail' => 'email@email.com',
            'LastName' => 'LastName',
            'B2C_CustomerList_ID__pc' => 'customerList',
            'RecordTypeId' => B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getPersonAccountRecordTypeDeveloperName()).Id
        });

        // Create the childContact
        Contact c1 = new Contact(
            Email = 'email@email.com',
            LastName = 'LastName',
            B2C_CustomerList_ID__c = 'CustomerList2'
        );

        // Create the local working variables
        List<B2CIACustomerResolutionResult> contactResolvedList = new List<B2CIACustomerResolutionResult>();
        List<Contact> contactFilteredList = new List<Contact>();
        List<Contact> resolutionContactList = new List<Contact>();
        List<List<Contact>> resolutionArguments = new List<List<Contact>>();

        Test.startTest();

            // Initialize the resolution arguments
            resolutionContactList.add(c1);
            resolutionArguments.add(resolutionContactList);

            // Create the list of resolved contacts
            contactResolvedList = B2CIACustomerResolution.resolve(resolutionArguments);

            // Default the working collections leveraged by the resolution / filter process
            B2CIACustomerResolutionResult resolutionResults = contactResolvedList.get(0);
            Map<String, Object> contactFilterMap = new Map<String, Object>();

            // Add the test contact to the flowArguments
            contactFilterMap.put(
                'Contact',
                c1
            );

            // Add the matches to the flowArguments
            contactFilterMap.put(
                'ContactMatches',
                resolutionResults.contactList
            );

            // Create the flow interview to process the arguments
            Flow.Interview.B2CCommerce_Process_ContactFilterMatches contactFilterMatchFlow = new Flow.Interview.B2CCommerce_Process_ContactFilterMatches(contactFilterMap);

            // Start the flow
            contactFilterMatchFlow.start();

            // Retrieve the list of filtered contacts
            contactFilteredList = (List<Contact>)(contactFilterMatchFlow.getVariableValue('ContactMatchesResult'));

        Test.stopTest();

        // Validate that our contact was matched-up
        System.assertEquals(
            contactFilteredList,
            null
        );

    }

    /**
     * @see B2CIACustomerResolution.resolve
     * @description
     * Given: Existing person account with a last name and email
     *  When: We resolve with a customer with same list name and email and a customer list
     *  Then: We will be returned the existing person account
     */
    @IsTest
    static void resolvesContactWithLastNameAndEmail() {
        // Create the test / parent Account
        Account account = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'PersonEmail' => 'email@email.com',
            'LastName' => 'LastName',
            'RecordTypeId' => B2CIACustomerResolution_TestHelper.getRecordType(B2CConfigurationManager.getPersonAccountRecordTypeDeveloperName()).Id
        });

        // Create the childContact
        Contact c1 = new Contact(
            Email = 'email@email.com',
            LastName = 'LastName',
            B2C_CustomerList_ID__c = 'CustomerList'
        );

        // Create the local working variables
        List<B2CIACustomerResolutionResult> contactResolvedList = new List<B2CIACustomerResolutionResult>();
        List<Contact> contactFilteredList = new List<Contact>();
        List<Contact> resolutionContactList = new List<Contact>();
        List<List<Contact>> resolutionArguments = new List<List<Contact>>();

        Test.startTest();

            // Initialize the resolution arguments
            resolutionContactList.add(c1);
            resolutionArguments.add(resolutionContactList);

            // Create the list of resolved contacts
            contactResolvedList = B2CIACustomerResolution.resolve(resolutionArguments);

            // Default the working collections leveraged by the resolution / filter process
            B2CIACustomerResolutionResult resolutionResults = contactResolvedList.get(0);
            Map<String, Object> contactFilterMap = new Map<String, Object>();

            // Add the test contact to the flowArguments
            contactFilterMap.put(
                'Contact',
                c1
            );

            // Add the matches to the flowArguments
            contactFilterMap.put(
                'ContactMatches',
                resolutionResults.contactList
            );

            // Create the flow interview to process the arguments
            Flow.Interview.B2CCommerce_Process_ContactFilterMatches contactFilterMatchFlow = new Flow.Interview.B2CCommerce_Process_ContactFilterMatches(contactFilterMap);

            // Start the flow
            contactFilterMatchFlow.start();

            // Retrieve the list of filtered contacts
            contactFilteredList = (List<Contact>)(contactFilterMatchFlow.getVariableValue('ContactMatchesResult'));

        Test.stopTest();

        // Validate that our contact was matched-up
        System.assertEquals(
            contactFilteredList[0].Id,
            [SELECT Id FROM Contact WHERE AccountId = :account.Id LIMIT 1].Id
        );

    }

}
