/**
 * @author Eric Schultz
 * @date July 1st, 2021
 * @description This class is used to exercise the processPeronAccount trigger used
 * to identify customerProfile changes -- and hand them off to B2C Commerce.
 */
@IsTest
public class B2CProcessPersonAccount_Test {

    /**
     * @see B2CProcessPersonAccount.Trigger
     * @description This test exercises the processAccount trigger and verifies that personAccount
     * updates can be processed and those changes applied to B2C Commerce.
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

        // Create the testAccount record
        Account a = new Account(
            RecordTypeId = [
                SELECT  Id
                FROM    RecordType
                WHERE   SobjectType='Account'
                AND     IsPersonType=TRUE
                LIMIT   1
            ].Id,
            LastName = 'lastname',
            B2C_Customer_No__pc = '123',
            B2C_CustomerList__pc = customerList.Id,
            PersonEmail = 'a@a.com',
            B2C_Disable_Integration__pc = false
        );

        // Insert the test account record
        Database.insert(a);

        Test.startTest();

            // Update a property on the personAccount
            a.PersonEmail = 'b@b.com';
            Database.update(a);

        Test.stopTest();

    }

}
