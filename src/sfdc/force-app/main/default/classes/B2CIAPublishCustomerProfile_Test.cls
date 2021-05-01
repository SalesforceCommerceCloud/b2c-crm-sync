/**
 * @author Eric Schultz
 * @date April 11th, 2021
 *
 * @description 
*/
@IsTest
private class B2CIAPublishCustomerProfile_Test {

    /**
     * @see B2CIAValidateContact.validateContact
     * @description
     */
    @IsTest
    static void isValid() {
        List<B2CIAPublishCustomerProfileInput> inputList = new List<B2CIAPublishCustomerProfileInput>();
        B2CIAPublishCustomerProfileInput input = new B2CIAPublishCustomerProfileInput();

        Contact c = new Contact(
            LastName = 'lastname',
            Total_Updates_to_B2C_Commerce__c = 0,
            Last_Update_Pushed_to_B2C_Commerce__c = System.Datetime.now(),
            Last_Platform_Event_Applied_Updates__c = false,
            Last_Platform_Event_Processed_Date__c = System.Datetime.now()
        );

        Database.insert( c );

        input.namedCredential = 'NamedCredential';
        input.apiVersion = 'apiVersion';
        input.b2cCustomerListId = 'id';
        input.b2cCustomerNo = 'customerno';
        input.b2cCustomerId = 'customerid';
        input.crmCustomerListId = 'crmCustomerListId';
        input.crmContactId = c.Id;
        input.crmContact = c;
        input.b2cProfileJSON = '{}';

        inputList.add( input );

        Test.startTest();
            Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerListsSites'));
            B2CIAPublishCustomerProfile.publishCustomerProfile( inputList );
        Test.stopTest();
    }
}