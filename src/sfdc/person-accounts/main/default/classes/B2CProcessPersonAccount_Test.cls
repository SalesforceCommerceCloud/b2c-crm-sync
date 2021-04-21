@IsTest
public class B2CProcessPersonAccount_Test {

    /**
     * @see B2CProcessPersonAccount.Trigger
     * @description 
     */
    @IsTest
    static void testProcess() {

        // Create test-data to seed an active B2C Commerce CustomerList
        B2C_CustomerList__c customerList = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
            'Name' => 'customerList',
            'Is_Active__c' => true,
            'API_Url__c' => 'https://www.salesforce.com',
            'B2C_Instance__r.Is_Active__c' => true,
            'B2C_Instance__r.API_Url__c' => 'https://www.salesforce.com',
            'Enable_Profile_Publishing__c' => true
        });
        
        Account a = new Account(
            RecordTypeId = [
                SELECT
                    Id  
                FROM
                    RecordType 
                WHERE
                        SobjectType='Account' 
                    AND IsPersonType=True
                LIMIT
            1].Id,
            LastName = 'lastname',
            B2C_Customer_No__pc = '123',
            B2C_CustomerList__pc = customerList.Id,
            PersonEmail = 'a@a.com',
            B2C_Disable_Integration__pc = false
        );

        

        Database.insert( a );


        Test.startTest();

            a.PersonEmail = 'b@b.com';
            Database.update( a );

        Test.stopTest();
    }
}