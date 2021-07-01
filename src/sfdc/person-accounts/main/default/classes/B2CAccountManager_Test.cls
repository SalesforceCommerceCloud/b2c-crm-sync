/**
 * @author Eric Schultz
 * @date July 1st, 2021
 * @description This class is used to exercise the B2CAccountManager class.
*/

@IsTest
public class B2CAccountManager_Test {

    /**
     * @see B2CAccountManager
     * @description This test verifies that a Contact can be retrieved from a personAccount
     * leveraging the account and personAccount recordType.
     */
    @IsTest
    static void testGetPublishContact() {

        // Initialize local variables
        Boolean isSuccess = true;

        // Retrieve the personAccount recordTypeId
        Account a = new Account(
            RecordTypeId = [
                SELECT  Id
                FROM    RecordType
                WHERE   SobjectType='Account'
                AND     IsPersonType=TRUE
                LIMIT   1].Id
        );

        Test.startTest();

            try {

                // Attempt to retrieve a publishedContact using the specified recordType
                B2CAccountManager.getPublishContact(
                    a,
                    B2CMetaFieldMappings.getFieldMappings('Contact')
                );

            } catch (Exception e) {

                // Flag that an error was caught
                isSuccess = false;

            }

        Test.stopTest();

        // Validate that no error was thrown
        System.assert(isSuccess, 'Expected no error to be caught; please review test results for more details');

    }
}
