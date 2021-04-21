@IsTest
public class B2CAccountManager_Test {

    /**
     * @see B2CAccountManager
     * @description
     */
    @IsTest
    static void testGetPublishContact() {

        Account a = new Account(
            RecordTypeId = [
                SELECT
                    Id
                FROM
                    RecordType
                WHERE
                        SobjectType='Account'
                    AND IsPersonType=TRUE
                LIMIT
            1].Id
        );

        Test.startTest();

            B2CAccountManager.getPublishContact(
                a,
                B2CMetaFieldMappings.getFieldMappings('Contact')
            );

        Test.stopTest();
    }
}
