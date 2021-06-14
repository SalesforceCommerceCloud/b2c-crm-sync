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
        String JSONString;
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
            Named_Credential_Developer_Name__c = 'testNamedCredential',
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
        contactInput.processMode = B2CConstant.Contact_Integration_ProcessMode_Publish;
        contactInput.customerList = tmpCustomerList;

        Test.startTest();

            // Attempt to create the publish platformEvent
            output = B2CProcessContactHelper.createPublishPlatformEvent(contactInput, JSONString);

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
        contactInput.processMode = B2CConstant.Contact_Integration_ProcessMode_Retrieve;

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

        B2C_Instance__c instance = new B2C_Instance__c(
            Name = 'INST',
            API_Url__c = 'https://www.salesforce.com'
        );

        Database.insert( instance );

        B2C_CustomerList__c customerList = new B2C_CustomerList__c(
            Name = 'SF',
            API_Url__c = 'https://www.salesforce.com',
            B2C_Instance__c = instance.Id
        );

        Database.insert( customerList );

        Contact c = new Contact(
            LastName = 'lastname',
            B2C_CustomerList__c = customerList.Id
        );

        Database.insert( c );

        c = [SELECT Id, B2C_Instance__c,B2C_CustomerList__c,B2C_CustomerList_ID__c FROM Contact WHERE Id = :c.Id LIMIT 1];

        Test.startTest();

            Map<String, B2C_CustomerList__c> m = B2CProcessContactHelper.updateCustomerListMap(
                c.B2C_CustomerList_ID__c,
                new Map<String,B2C_CustomerList__c>{
                }
            );

            Map<String, B2C_Instance__c> n = B2CProcessContactHelper.updateInstanceMap(
                c.B2C_Instance__c,
                new Map<String,B2C_Instance__c>{
                }
            );

            B2CProcessContactHelper.getValidateContactInput(
                c,
                instance,
                customerList
            );

        Test.stopTest();

    }

}
