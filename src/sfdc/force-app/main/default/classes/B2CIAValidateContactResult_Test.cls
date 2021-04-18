/**
 * @author Abraham David Lloyd
 * @date April 17th, 2021
 *
 * @description This is the test-class for the B2CIAValidateContactResult class -- and
 * validates the creation of integration permissions based on source properties.
 */
@IsTest
private class B2CIAValidateContactResult_Test {

    @IsTest
    static void testInactiveCustomerList() {

        // Initialize local Variables
        B2CIAValidateContactInput input;
        B2CIAValidateContactResult validateContactResult;

        // Initialize the input-list
        input = new B2CIAValidateContactInput();

        // Default the contact used for testing
        input.contact = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
                'B2C_Disable_Integration__c' => false
        });

        // Default the customerList used for testing
        input.customerList = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
                'API_URL__c' => 'https://www.salesforce.com',
                'B2C_Instance__r.API_URL__c' => 'https://www.salesforce.com',
                'Enable_Profile_Retrieval__c' => true,
                'Enable_Profile_Publishing__c' => true,
                'Enable_Profile_Creation__c' => true,
                'Enable_Profile_Updates__c' => true,
                'Is_Active__c' => false
        });

        // Default the instance used for testing
        input.b2cInstance = (B2C_Instance__c)TestDataFactory.createSObject('B2C_Instance__c', new Map<String,Object>{
                'API_URL__c' => 'https://www.salesforce.com',
                'Is_Active__c' => true
        });

        // Default the processMode
        input.processMode = B2CConstant.Contact_Integration_ProcessMode_Retrieve;

        // Initialize the contactResult
        validateContactResult = new B2CIAValidateContactResult();

        Test.startTest();

        // Set the integration options using the specified input
        validateContactResult.setIntegrationOptions(input);

        Test.stopTest();

        // Validate that the integration process is disabled since the B2C CustomerList is inActive
        System.assert(validateContactResult.allowIntegrationProcess == false, '-- Integration should not be enabled with an inActive B2C CustomerList');

    }

}
