/**
 * @author Eric Schultz
 * @date April 11th, 2021
 *
 * @description 
*/
@IsTest
private class B2CIAValidateContact_Test {

    /**
     * @see B2CIAValidateContact.validateContact
     * @description
     */
    @IsTest
    static void isValid() {

        List<B2CIAValidateContactInput> inputList = new List<B2CIAValidateContactInput>();

        B2CIAValidateContactInput input = new B2CIAValidateContactInput();

        input.contact = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'B2C_Disable_Integration__c' => false
        });
        input.customerList = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
            'API_URL__c' => 'https://www.salesforce.com',
            'B2C_Instance__r.API_URL__c' => 'https://www.salesforce.com',
            'Enable_Profile_Retrieval__c' => true,
            'Enable_Profile_Publishing__c' => true,
            'Enable_Profile_Creation__c' => true,
            'Enable_Profile_Updates__c' => true,
            'Is_Active__c' => true
        });
        input.b2cInstance = (B2C_Instance__c)TestDataFactory.createSObject('B2C_Instance__c', new Map<String,Object>{
            'API_URL__c' => 'https://www.salesforce.com',
            'Is_Active__c' => true
        });
        input.processMode = B2CConstant.Contact_Integration_ProcessMode_Retrieve;

        inputList.add( input );

        Test.startTest();

            B2CIAValidateContact.validateContact(
                inputList
            );

        Test.stopTest();
    }


    @IsTest
    static void isDisabled() {

        List<B2CIAValidateContactInput> inputList = new List<B2CIAValidateContactInput>();

        B2CIAValidateContactInput input = new B2CIAValidateContactInput();

        input.contact = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'B2C_Disable_Integration__c' => true
        });
        input.customerList = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
            'API_URL__c' => 'https://www.salesforce.com',
            'B2C_Instance__r.API_URL__c' => 'https://www.salesforce.com',
            'Enable_Profile_Retrieval__c' => true,
            'Enable_Profile_Publishing__c' => true,
            'Enable_Profile_Creation__c' => true,
            'Enable_Profile_Updates__c' => true,
            'Is_Active__c' => true
        });
        input.b2cInstance = (B2C_Instance__c)TestDataFactory.createSObject('B2C_Instance__c', new Map<String,Object>{
            'API_URL__c' => 'https://www.salesforce.com',
            'Is_Active__c' => true
        });
        input.processMode = B2CConstant.Contact_Integration_ProcessMode_Retrieve;

        inputList.add( input );

        Test.startTest();

            B2CIAValidateContact.validateContact(
                inputList
            );

        Test.stopTest();
    }
}