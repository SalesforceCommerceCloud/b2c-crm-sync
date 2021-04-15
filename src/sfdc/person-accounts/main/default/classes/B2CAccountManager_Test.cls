@IsTest
public class B2CAccountManager_Test {

    /**
     * @see B2CAccountManager
     * @description 
     */
    @IsTest
    static void testGetPublishContact() {

        Account a = new Account(
            RecordTypeId = [SELECT Name, SobjectType,IsPersonType 
            FROM RecordType 
            WHERE SobjectType='Account' AND IsPersonType=True LIMIT 1].Id
        );

        Test.startTest();

            B2CAccountManager.getPublishContact(
                a,
                B2C_Integration_Field_Mappings__mdt.getAll().values()
            );

        Test.stopTest();
    }
}
