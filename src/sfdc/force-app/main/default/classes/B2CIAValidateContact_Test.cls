/**
 * @author Eric Schultz
 * @date April 11th, 2021
 *
 * @description This test class exercises our validateContact logic.
*/
@IsTest
private class B2CIAValidateContact_Test {

    /**
     * @see B2CIAValidateContact.validateContact
     * @description This is used to confirm that we can validate a contactRecord successfully and determine
     * the integration status / available integration options for a given contact record.
     */
    @IsTest
    static void isValid() {

        // Initialize local variables
        List<B2CIAValidateContactInput> inputList = new List<B2CIAValidateContactInput>();
        B2CIAValidateContactInput input = new B2CIAValidateContactInput();
        List<B2CIAValidateContactResult> validationResult = new List<B2CIAValidateContactResult>();
        String errorMessage;

        // Default the errorMessage
        errorMessage = '-- Expected the integrationStatus to be true; integration should be enabled';

        // Define the contact that will be exercised
        input.contact = (Contact)TestDataFactory.createSObject(
            'Contact',
            new Map<String,Object>{
                'B2C_Disable_Integration__c' => false
             }
        );

        // Define the customerList that will parent the Contact
        input.customerList = (B2C_CustomerList__c)TestDataFactory.createSObject(
            'B2C_CustomerList__c',
            new Map<String,Object>{
                'API_URL__c' => 'https://www.salesforce.com',
                'B2C_Instance__r.API_URL__c' => 'https://www.salesforce.com',
                'Enable_Profile_Retrieval__c' => true,
                'Enable_Profile_Publishing__c' => true,
                'Enable_Profile_Creation__c' => true,
                'Enable_Profile_Updates__c' => true,
                'Is_Active__c' => true
            }
        );

        // Initialize the b2cInstance that will parent the customerList
        input.b2cInstance = (B2C_Instance__c)TestDataFactory.createSObject(
            'B2C_Instance__c',
            new Map<String,Object>{
                'API_URL__c' => 'https://www.salesforce.com',
                'Is_Active__c' => true
            }
        );

        // Define the processMode to employ
        input.processMode = B2CConstant.CONTACT_INTEGRATION_PROCESSMODE_RETRIEVE;

        // Add the invocableAction arguments to the parent collection
        inputList.add( input );

        Test.startTest();

            // Exercise the contactValidation action
            validationResult = B2CIAValidateContact.validateContact(inputList);

        Test.stopTest();

        // Validate that the testResults are successful
        for (B2CIAValidateContactResult thisValidationResult : validationResult) {

            // Assert that the integration status is enabled / active
            System.assert(thisValidationResult.allowIntegrationProcess, errorMessage);

        }

    }

    /**
     * @see B2CIAValidateContact.validateContact
     * @description This is used to confirm that we can validate a contactRecord successfully and determine
     * the integration status / available integration options for a given contact record.  This method
     * validates failures (we cannot integrate).
     */
    @IsTest
    static void isDisabled() {

        // Initialize local variables
        List<B2CIAValidateContactInput> inputList = new List<B2CIAValidateContactInput>();
        B2CIAValidateContactInput input = new B2CIAValidateContactInput();
        List<B2CIAValidateContactResult> validationResult = new List<B2CIAValidateContactResult>();
        String errorMessage;

        // Default the errorMessage
        errorMessage = '-- Expected the integrationStatus to be true; integration should be enabled';

        // Define the contact that will be exercised; disable integration
        input.contact = (Contact)TestDataFactory.createSObject(
            'Contact',
            new Map<String,Object>{
                'B2C_Disable_Integration__c' => true
            }
        );


        // Define the customerList that will parent the Contact
        input.customerList = (B2C_CustomerList__c)TestDataFactory.createSObject(
            'B2C_CustomerList__c',
            new Map<String,Object>{
                'API_URL__c' => 'https://www.salesforce.com',
                'B2C_Instance__r.API_URL__c' => 'https://www.salesforce.com',
                'Enable_Profile_Retrieval__c' => true,
                'Enable_Profile_Publishing__c' => true,
                'Enable_Profile_Creation__c' => true,
                'Enable_Profile_Updates__c' => true,
                'Is_Active__c' => true
            }
        );

        // Initialize the b2cInstance that will parent the customerList
        input.b2cInstance = (B2C_Instance__c)TestDataFactory.createSObject(
            'B2C_Instance__c',
            new Map<String,Object>{
                'API_URL__c' => 'https://www.salesforce.com',
                'Is_Active__c' => true
            }
        );

        // Define the processMode to employ
        input.processMode = B2CConstant.CONTACT_INTEGRATION_PROCESSMODE_RETRIEVE;

        // Add the invocableAction arguments to the parent collection
        inputList.add( input );

        Test.startTest();

            // Exercise the contactValidation action
            validationResult = B2CIAValidateContact.validateContact(inputList);

        Test.stopTest();

        // Validate that the testResults are successful
        for (B2CIAValidateContactResult thisValidationResult : validationResult) {

            // Assert that the integration status is enabled / active
            System.assertEquals(thisValidationResult.allowIntegrationProcess, false, errorMessage);

        }

    }

}
