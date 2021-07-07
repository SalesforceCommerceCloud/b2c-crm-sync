/**
 * @author Abraham David Lloyd
 * @date June 28th, 2021
 *
 * @description This class is used to validate that we can call the getAuthToken flow via Apex
 * and leverage it internally within classes to retrieve authTokens from Account Manager.
 */
@IsTest
private class B2CAUthTokenHelper_Test {

    /**
     * @see B2CAuthTokenHelper.getB2CAuthToken
     * @description This test exercises the helper-method wrapper for the flow used to
     * retrieve an accessToken from the configured B2C Commerce AccountManager.  The test
     * successfully retrieves an authToken but does not persist it.
     */
    @IsTest
    static void testGetB2CAuthTokenWithoutAuditingSuccess() {

        // Initialize local variables
        Map<String, Object> authTokenResults;
        B2C_Client_ID__c definedClientID;

        // Initialize the test B2C ClientID
        B2C_Client_ID__c testClientID = new B2C_Client_ID__c(
            Name = 'my-test-clientId',
            B2C_Client_ID_Label__c = 'My Test ClientID',
            JWT_Certificate_Name__c = B2CConstant.CERTTEST_VALIDATE_TESTCERTIFICATENAME,
            Is_Active__c = true,
            Audit_Authentication_API_Interactions__c = true
        );

        // Save the testClientID
        Database.insert(testClientID);

        // Retrieve the full-details for the testClientID
        definedClientID = [
            SELECT  Id,
                    Name,
                    B2C_Client_ID_Label__c,
                    JWT_Certificate_Name__c,
                    Is_Active__c,
                    Is_Certificate_Verified__c,
                    Audit_Authentication_API_Interactions__c,
                    IsDeleted
            FROM    B2C_Client_ID__c
            WHERE   Id = :testClientID.Id
        ];

        Test.startTest();

            // Set the mock-generator for the current request (modeling success)
            Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('AccessTokenSuccess'));

            // Attempt to retrieve a B2C AuthToken via the flow-wrapper
            authTokenResults = B2CAuthTokenHelper.getB2CAuthToken(definedClientID, true);

        Test.stopTest();

        // Validate that the request processed successfully
        System.assertEquals(authTokenResults.get('B2CAuthToken'), B2CConstant.AUTHTEST_AUTHTOKEN, 'Expected the authToken to match the default / test authToken constant');
        System.assertEquals(authTokenResults.get('IsSuccess'), true, 'Expected a success response of true for the authToken request');

    }

    /**
     * @see B2CAuthTokenHelper.getB2CAuthToken
     * @description This test exercises the helper-method wrapper for the flow used to
     * retrieve an accessToken from the configured B2C Commerce AccountManager.  The test
     * fails at retrieve an authToken.
     */
    @IsTest
    static void testGetB2CAuthTokenWithoutAuditingFailure() {

        // Initialize local variables
        Map<String, Object> authTokenResults;
        B2C_Client_ID__c definedClientID;

        // Initialize the test B2C ClientID
        B2C_Client_ID__c testClientID = new B2C_Client_ID__c(
                Name = 'my-test-clientId',
                B2C_Client_ID_Label__c = 'My Test ClientID',
                JWT_Certificate_Name__c = B2CConstant.CERTTEST_VALIDATE_TESTCERTIFICATENAME,
                Is_Active__c = true,
                Audit_Authentication_API_Interactions__c = true
        );

        // Save the testClientID
        Database.insert(testClientID);

        // Retrieve the full-details for the testClientID
        definedClientID = [
                SELECT  Id,
                        Name,
                        B2C_Client_ID_Label__c,
                        JWT_Certificate_Name__c,
                        Is_Active__c,
                        Is_Certificate_Verified__c,
                        Audit_Authentication_API_Interactions__c,
                        IsDeleted
                FROM    B2C_Client_ID__c
                WHERE   Id = :testClientID.Id
        ];

        Test.startTest();

            // Set the mock-generator for the current request (modeling success)
            Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('AccessTokenFailure'));

            // Attempt to retrieve a B2C AuthToken via the flow-wrapper
            authTokenResults = B2CAuthTokenHelper.getB2CAuthToken(definedClientID, true);

        Test.stopTest();

        // Validate that the request processed successfully
        System.assertEquals(authTokenResults.get('B2CAuthToken'), null, 'Did not expected an authToken to be seeded as an error was caught');
        System.assertEquals(authTokenResults.get('IsSuccess'), false, 'Expected a failed success response as an error was caught');

    }

}
