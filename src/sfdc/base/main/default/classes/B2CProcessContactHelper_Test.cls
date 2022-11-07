/**
 * @author Eric Schultz
 * @date April 11th, 2021
 *
 * @description
*/
@IsTest
private class B2CProcessContactHelper_Test {

    /**
     * @see B2CProcessContactHelper.createPublishPlatformEvent
     * @description Helper method to exercise the creation of the publishPlatformEvent.  This validates that the
     * platformEvent record validation operates as expected and returns an error in the response.
     */
    @IsTest
    static void testCreatePublishPlatformEventValidationError() {

        // Initialize local Variables
        B2CIAValidateContactInput contactInput;
        Database.SaveResult output;
        String jsonString;
        B2C_CustomerList__c tmpCustomerList;
        Boolean threwException;

        // Initialize the input property
        contactInput = new B2CIAValidateContactInput();

        // Default the exception flag
        threwException = false;

        // Define the b2cInstance
        contactInput.b2cInstance = new B2C_Instance__c(
            Name = 'INST',
            API_Url__c = 'https://www.salesforce.com',
            Is_Active__c = true
        );

        Database.insert( contactInput.b2cInstance );

        // Define the customerList
        contactInput.customerList = new B2C_CustomerList__c(
            B2C_Instance__c = contactInput.b2cInstance.Id,
            Name = 'My CustomerList',

            // Include a malformed url (expecting '/s/') to force the baseUrl formula to fail
            API_Url__c = 'https://www.salesforce.com',
            Enable_Profile_Retrieval__c = true,
            Enable_Profile_Publishing__c = true,
            Enable_Profile_Creation__c = true,
            Enable_Profile_Updates__c =true,
            Is_Active__c = true,
            OCAPI_Version_No__c = 'v20_10'
        );

        Database.insert( contactInput.customerList );

        // Re-retrieve the customerList definition to include formula calculations
        tmpCustomerList = [
            SELECT  Id,
                    Name,
                    B2C_Instance__c,
                    API_Url__c,
                    Base_API_Url__c,
                    Named_Credential_Developer_Name__c,
                    Enable_Profile_Retrieval__c,
                    Enable_Profile_Publishing__c,
                    Enable_Profile_Creation__c,
                    Enable_Profile_Updates__c,
                    Is_Active__c,
                    OCAPI_Version_No__c
            FROM    B2C_CustomerList__c
            WHERE   Id = :contactInput.customerList.Id
            LIMIT   1
        ];

        // Define the contact
        contactInput.contact = new Contact(
            B2C_CustomerList__c = contactInput.customerList.Id,
            LastName = 'Smith',
            B2C_Disable_Integration__c = false,
            Audit_OCAPI_API_Response__c = true,
            B2C_Customer_No__c = '9999999'
        );

        Database.insert( contactInput.contact );

        // Default the processMode for this test
        contactInput.processMode = B2CConstant.CONTACT_INTEGRATION_PROCESSMODE_PUBLISH;
        contactInput.customerList = tmpCustomerList;

        Test.startTest();

            // Attempt to create the publish platformEvent
            output = EventBus.publish(B2CProcessContactHelper.createPublishPlatformEvent(contactInput, jsonString));

        Test.stopTest();

        // Validate that the platformEvent was not created due to a data / validation failure
        System.assertEquals(output.success, false, 'Expected a database failure when attempting to create this platformEvent.');

    }

    /**
     * @see B2CProcessContactHelper.getValidateContactResult
     * @description Helper method to exercise the retrieval of the contact and related environment
     * validation results.  We test to see if expected values are returned and present.
     */
    @IsTest
    static void testGetValidateContactResult() {

        // Initialize local Variables
        B2CIAValidateContactInput contactInput;
        B2CIAValidateContactResult output;

        // Initialize the input property
        contactInput = new B2CIAValidateContactInput();
        output = new B2CIAValidateContactResult();

        // Create the working / default instance
        contactInput.b2cInstance = (B2C_Instance__c)TestDataFactory.createSObject('B2C_Instance__c', new Map<String,Object>{
                'API_Url__c' => 'https://www.salesforce.com',
                'Is_Active__c' => true
        });

        // Create the working / default customerList
        contactInput.customerList = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
                'B2C_Instance__c' => contactInput.b2cInstance.Id,
                'API_Url__c' => 'https://www.salesforce.com/s/mystorefront-url/',
                'Enable_Profile_Retrieval__c' => true,
                'Enable_Profile_Publishing__c' => true,
                'Enable_Profile_Creation__c' => true,
                'Enable_Profile_Updates__c' => true,
                'Is_Active__c' => true
        });

        // Create the working contact record
        contactInput.contact = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
                'B2C_CustomerList__c' => contactInput.customerList.Id,
                'B2C_Disable_Integration__c' => false
        });

        // Default the processMode for this test
        contactInput.processMode = B2CConstant.CONTACT_INTEGRATION_PROCESSMODE_RETRIEVE;

        Test.startTest();

            // Attempt to retrieve the integration options for this combination
            output = B2CProcessContactHelper.getValidateContactResult(contactInput);

        Test.stopTest();

        // Validate that the attributes exposed by the validation result return expected values
        System.assert(output.allowIntegrationProcess, 'Expected allowIntegrationProcess=true; please check the IA attributes and try again.');
        System.assertEquals(contactInput.b2cInstance.Id, output.b2cInstance.Id, 'Expected the b2cInstance identifiers to match.');
        System.assertEquals(contactInput.customerList.Id, output.customerList.Id, 'Expected the customerList identifiers to match.');
        System.assertEquals(contactInput.contact.Id, output.contact.Id, 'Expected the contact identifiers to match.');

    }

    /**
     * @see B2CProcessContactHelper.updateInstanceMap
     * @description Helper function to exercise the creation of the instance maps used
     * during integration processes for B2C Customer Profiles / Contacts / personAccounts.
     */
    @IsTest
    static void testUpdateInstanceMap() {

        // Initialize the b2cInstance
        B2C_Instance__c instance = new B2C_Instance__c(
            Name = 'INST',
            API_Url__c = 'https://www.salesforce.com'
        );

        Database.insert( instance );

        // Initialize the b2cCustomerList
        B2C_CustomerList__c customerList = new B2C_CustomerList__c(
            Name = 'SF',
            API_Url__c = 'https://www.salesforce.com',
            B2C_Instance__c = instance.Id
        );

        Database.insert( customerList );

        // Initialize the relatedContacts
        Contact c = new Contact(
            LastName = 'lastname',
            B2C_CustomerList__c = customerList.Id
        );

        Database.insert( c );

        // Retrieve the contact record to process
        c = [SELECT Id, B2C_Instance__c,B2C_CustomerList__c,B2C_CustomerList_ID__c FROM Contact WHERE Id = :c.Id LIMIT 1];

        Test.startTest();

            // Process the contact record and retrieve the validatedInput class
            B2CIAValidateContactInput validatedInput = B2CProcessContactHelper.getValidateContactInput(
                c,
                instance,
                customerList
            );

        Test.stopTest();

        // Evaluate if the returned class contains key properties
        System.assertEquals(validatedInput.processMode, B2CConstant.CONTACT_INTEGRATION_PROCESSMODE_PUBLISH, 'Expected the processMode returned by the class to equal the publish processMode default');
        System.assertEquals(validatedInput.contact.Id, c.Id, 'Expected the contactIdentifiers to be aligned');

    }

    /**
     * @see B2CProcessContactHelper.updateCustomerListMap
     * @description Helper function to exercise the look-up of B2C CustomerLists as part
     * of contact processing.
     */
    @IsTest
    static void testB2CCustomerListMapLookup() {

        // Initialize the current instance
        B2C_Instance__c instance = new B2C_Instance__c(
            Name = 'INST',
            API_Url__c = 'https://www.salesforce.com'
        );

        // Create the instance
        Database.insert( instance );

        // Initialize a related B2C CustomerList
        B2C_CustomerList__c customerList = new B2C_CustomerList__c(
            Name = 'SF',
            API_Url__c = 'https://www.salesforce.com',
            B2C_Instance__c = instance.Id
        );

        // Create the customerList
        Database.insert( customerList );

        Test.startTest();

            // Initialize the customerList map and seed it with the test data
            Map<String, B2C_CustomerList__c> customerListMap = new Map<String, B2C_CustomerList__c>();
            customerListMap.put(customerList.Name, customerList);

            // Test exercising the updated customerList map
            Map<String, B2C_CustomerList__c> m = B2CProcessContactHelper.updateCustomerListMap(
                customerList.Name,
                customerListMap
            );

        Test.stopTest();

        // Evaluate if the returned map contains the customerList specified
        System.assert(m.containsKey(customerList.Name), 'Expected the map to include the customerList specified that was pre-seeded');

    }

    /**
     * @see B2CProcessContactHelper.updateInstanceMap
     * @description Helper function to exercise the look-up of B2C Instance as part
     * of contact processing.
     */
    @IsTest
    static void testB2CInstanceMapLookup() {

        // Initialize the current instance
        B2C_Instance__c instance = new B2C_Instance__c(
            Name = 'INST',
            API_Url__c = 'https://www.salesforce.com'
        );

        // Create the instance
        Database.insert( instance );

        Test.startTest();

            // Initialize the instance map and seed it with the test data
            Map<String, B2C_Instance__c> instanceMap = new Map<String, B2C_Instance__c>();
            instanceMap.put(instance.Name, instance);

            // Test exercising the updated customerList map
            Map<String, B2C_Instance__c> m = B2CProcessContactHelper.updateInstanceMap(
                instance.Name,
                instanceMap
            );

        Test.stopTest();

        // Evaluate if the returned map contains the instance specified
        System.assert(m.containsKey(instance.Name), 'Expected the map to include the instance specified that was pre-seeded');

    }

    /**
     * @see B2CProcessContactHelper.processTrigger
     * @description This test exercises the processContact trigger-logic and verifies that contact
     * updates can be processed without throwing an error (these updates are exercised via our
     * multi-cloud unit-tests).
     */
    @IsTest
    static void testProcessTrigger() {

        // Initialize local Variables
        List<Contact> triggerNew = new List<Contact>();
        List<Contact> triggerOld = new List<Contact>();

        // Initialize local variables
        triggerNew = new List<Contact>();
        triggerOld = new List<Contact>();
        Boolean isSuccess = true;

        // Create test-data to seed an active instance
        B2C_Instance__c instance = new B2C_Instance__c(
            Name = 'instance',
            Is_Active__c = true,
            API_Url__c = 'https://www.salesforce.com'
        );

        // Create the instance
        Database.insert(instance);

        // Create test-data to seed an active B2C Commerce CustomerList
        B2C_CustomerList__c customerList = new B2C_CustomerList__c(
            Name = 'customerList',
            B2C_Instance__c = instance.Id,
            Is_Active__c = true,
            Enable_Profile_Publishing__c =true,
            API_Url__c = 'https://www.salesforce.com'
        );

        // Create the customerList
        Database.insert(customerList);

        // Create the testAccount record
        Account a = new Account(
            Name = 'Anonymous Customer',
            RecordTypeId = [
                SELECT  Id
                FROM    RecordType
                WHERE   DeveloperName = :B2CConfigurationManager.getAccountRecordTypeDeveloperName()
            ].Id
        );

        // Insert the test account record
        Database.insert(a);

        // Create the testContact record
        Contact c = new Contact(
            AccountId = a.Id,
            FirstName = 'firstname',
            LastName = 'lastname',
            B2C_Customer_ID__c = 'abcd',
            B2C_Customer_No__c = '123',
            B2C_CustomerList__c = customerList.Id,
            Email = 'a@a.com',
            B2C_Is_Enabled__c = true,
            B2C_Disable_Integration__c = false,
            Updated_by_B2C_Platform_Event__c = false
        );

        // Insert the test contact record
        Database.insert(c);

        // Retrieve the full contact-details we need for processing
        List<Contact> sourceContacts = new Query('Contact').selectAllFields().byId(c.Id).setLimit(1).run();
        Contact sourceContact = sourceContacts.get(0);

        // Clone the test contact and make updates
        Contact newContact = sourceContact.clone(true, true);
        Contact oldContact = sourceContact.clone(true, true);

        Test.startTest();

            // Update the contactRecord
            newContact.Email = 'b@b.com';

            // Add the new and old contacts to the working collections
            triggerNew.add(newContact);
            triggerOld.add(oldContact);

            try {

                // Process the trigger collections and reconcile the platformEvent updates
                B2CProcessContactHelper.processTrigger(triggerNew, triggerOld);

            } catch (Exception e) {

                // Flag that an error was caught
                isSuccess = false;

            }

        Test.stopTest();

        // Validate that no error was thrown
        System.assert(isSuccess, 'Expected no error to be caught; please review test results for more details');

    }

    /**
     * @see B2CProcessContactHelper.processTrigger
     * @description This test exercises the processContact trigger and verifies that contact
     * updates can be processed without throwing an error (these updates are exercised via our
     * multi-cloud unit-tests).
     */
    @IsTest
    static void testProcess() {

        // Initialize local variables
        Boolean isSuccess = true;

        // Create test-data to seed an active B2C Commerce CustomerList
        B2C_CustomerList__c customerList = (B2C_CustomerList__c)TestDataFactory.createSObject(
                'B2C_CustomerList__c', new Map<String,Object>{
            'Name' => 'customerList',
            'Is_Active__c' => true,
            'API_Url__c' => 'https://www.salesforce.com',
            'B2C_Instance__r.Is_Active__c' => true,
            'B2C_Instance__r.API_Url__c' => 'https://www.salesforce.com',
            'Enable_Profile_Publishing__c' => true
        });

        // Create the testAccount record
        Account a = new Account(
            Name = 'Anonymous Customer',
            RecordTypeId = [
                SELECT  Id
                FROM    RecordType
                WHERE   DeveloperName = :B2CConfigurationManager.getAccountRecordTypeDeveloperName()
            ].Id
        );

        // Insert the test account record
        Database.insert(a);

        // Create the testContact record
        Contact c = new Contact(
            AccountId = a.Id,
            LastName = 'lastname',
            B2C_Customer_No__c = '123',
            B2C_CustomerList__c = customerList.Id,
            Email = 'a@a.com',
            B2C_Disable_Integration__c = false
        );

        // Insert the test contact record
        Database.insert(c);

        Test.startTest();

            try {

                // Update a property on the Contact
                c.Email = 'b@b.com';
                Database.update(c);

            } catch (Exception e) {

                // Flag that an error was thrown
                isSuccess = false;

            }

        Test.stopTest();

        // Validate that no error was thrown
        System.assert(isSuccess, 'Expected no error to be caught; please review test results for more details');

    }

}
