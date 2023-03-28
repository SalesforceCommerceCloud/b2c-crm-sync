/**
 * @author Abraham David Lloyd
 * @date June 29th, 2021
 *
 * @description This class exercises the successful persistence of a B2C AuthToken and
 * its auditEvent details to the current Salesforce org.
 */
@IsTest
private class B2CIAPersistB2CAuthToken_Test {

    /**
     * @see B2CIAPersistB2CAuthToken.persistAndAuditB2CAuthToken
     * @description This test is used to exercise the persistence of a B2C AuthToken and its
     * audit details for a specific B2C Client ID.
     */
    @IsTest
    static void testPersistAndAuditB2CAuthToken() {

        // Initialize local variables
        B2C_Client_ID__c testClientID;
        List<B2CIARequestB2CAuthTokenResult> authTokenResults;
        B2CIARequestB2CAuthTokenResult authTokenResult;

        // Initialize the results collection
        authTokenResults = new List<B2CIARequestB2CAuthTokenResult>();

        // Initialize the result we'll process
        authTokenResult = new B2CIARequestB2CAuthTokenResult();

        // Create the test ClientID
        testClientID = new B2C_Client_ID__c(
            Name = 'testClientID',
            B2C_Client_ID_Label__c = 'Test B2C ClientID',
            Audit_Authentication_API_Interactions__c = true,
            Is_Active__c = true,
            JWT_Certificate_Name__c = B2CConstant.CERTTEST_VALIDATE_TESTCERTIFICATENAME
        );

        // Insert the ClientID
        Database.insert(testClientID);

        Test.startTest();

            // Define the authToken processing results details
            authTokenResult.b2cClientIdRecordId = testClientID.Id;
            authTokenResult.b2cClientId = testClientID.Name;
            authTokenResult.auditAuthenticationAPIInteractions = true;
            authTokenResult.bypassAuthTokenAuditing = false;
            authTokenResult.persistAuthToken = true;
            authTokenResult.status = 'OK';
            authTokenResult.statusCode = 200;
            authTokenResult.accessToken = 'my-access-token';
            authTokenResult.tokenType = 'Bearer';
            authTokenResult.expiresIn = 1799;
            authTokenResult.accountManagerUrl = 'https://account.demandware.com/dw/sso/access_token';
            authTokenResult.requestBody = 'my-test-body';
            authTokenResult.responseBody = '{ "my-test-result": true }';
            authTokenResult.isError = false;
            authTokenResult.errorMessage = null;

            // Execute the authToken processor and persist / audit
            B2CIAPersistB2CAuthToken.persistAndAuditB2CAuthToken(
              new List<B2CIARequestB2CAuthTokenResult> {
                  authTokenResult
              }
            );

        Test.stopTest();

        // Retrieve the persisted authToken
        List<B2C_AuthToken__c> testAuthToken = [
            SELECT  Id
            FROM    B2C_AuthToken__c
            WHERE   B2C_Client_ID__c = :authTokenResult.b2cClientIdRecordId
            LIMIT   1
        ];

        // Retrieve the audit-record
        List<B2C_Client_ID_Integration_History__c> testIntegrationHistory = [
            SELECT  Id
            FROM    B2C_Client_ID_Integration_History__c
            WHERE   B2C_AuthToken__c = :testAuthToken.get(0).Id
            AND     B2C_Client_ID__c = :authTokenResult.b2cClientIdRecordId
        ];

        // Validate that the authToken and the integration history record(s) were persisted
        System.assert(testAuthToken.size() == 1, 'Expected an authToken to be persisted and mapped to the test B2C ClientID');
        System.assert(testIntegrationHistory.size() == 1, 'Expected an integrationHistory record to be persisted and mapped to the B2C AuthToken and ClientID');

    }

    /**
     * @see B2CIAPersistB2CAuthToken.persistAndAuditB2CAuthToken
     * @description This test is used to exercise the persistence of a B2C AuthToken without
     * its audit details for a specific B2C Client ID.
     */
    @IsTest
    static void testPersistB2CAuthTokenNoAuditing() {

        // Initialize local variables
        B2C_Client_ID__c testClientID;
        List<B2CIARequestB2CAuthTokenResult> authTokenResults;
        B2CIARequestB2CAuthTokenResult authTokenResult;

        // Initialize the results collection
        authTokenResults = new List<B2CIARequestB2CAuthTokenResult>();

        // Initialize the result we'll process
        authTokenResult = new B2CIARequestB2CAuthTokenResult();

        // Create the test ClientID
        testClientID = new B2C_Client_ID__c(
            Name = 'testClientID',
            B2C_Client_ID_Label__c = 'Test B2C ClientID',
            Audit_Authentication_API_Interactions__c = false,
            Is_Active__c = true,
            JWT_Certificate_Name__c = B2CConstant.CERTTEST_VALIDATE_TESTCERTIFICATENAME
        );

        // Insert the ClientID
        Database.insert(testClientID);

        Test.startTest();

            // Define the authToken processing results details
            authTokenResult.b2cClientIdRecordId = testClientID.Id;
            authTokenResult.b2cClientId = testClientID.Name;
            authTokenResult.auditAuthenticationAPIInteractions = false;
            authTokenResult.bypassAuthTokenAuditing = false;
            authTokenResult.persistAuthToken = true;
            authTokenResult.status = 'OK';
            authTokenResult.statusCode = 200;
            authTokenResult.accessToken = 'my-access-token';
            authTokenResult.tokenType = 'Bearer';
            authTokenResult.expiresIn = 1799;
            authTokenResult.accountManagerUrl = 'https://account.demandware.com/dw/sso/access_token';
            authTokenResult.requestBody = 'my-test-body';
            authTokenResult.responseBody = '{ "my-test-result": true }';
            authTokenResult.isError = false;
            authTokenResult.errorMessage = null;

            // Execute the authToken processor and persist / audit
            B2CIAPersistB2CAuthToken.persistAndAuditB2CAuthToken(
                new List<B2CIARequestB2CAuthTokenResult> {
                    authTokenResult
                }
            );

        Test.stopTest();

        // Retrieve the persisted authToken
        List<B2C_AuthToken__c> testAuthToken = [
                SELECT  Id
                FROM    B2C_AuthToken__c
                WHERE   B2C_Client_ID__c = :authTokenResult.b2cClientIdRecordId
                LIMIT   1
        ];

        // Retrieve the audit-record
        List<B2C_Client_ID_Integration_History__c> testIntegrationHistory = [
                SELECT  Id
                FROM    B2C_Client_ID_Integration_History__c
                WHERE   B2C_AuthToken__c = :testAuthToken.get(0).Id
                AND     B2C_Client_ID__c = :authTokenResult.b2cClientIdRecordId
        ];

        // Validate that the authToken was persisted -- but that the integration history record was not created
        System.assert(testAuthToken.size() == 1, 'Expected an authToken to be persisted and mapped to the test B2C ClientID');
        System.assert(testIntegrationHistory.size() == 0, 'Expected no integrationHistory record to be persisted and mapped to the B2C AuthToken and ClientID');

    }

    /**
     * @see B2CIAPersistB2CAuthToken.persistAndAuditB2CAuthToken
     * @description This test is used to exercise bypassing B2C AuthToken and integrationHistory
     * persistence (no record(s) are kept or maintained when the bypass is enabled).
     */
    @IsTest
    static void testBypassPersistB2CAuthToken() {

        // Initialize local variables
        B2C_Client_ID__c testClientID;
        List<B2CIARequestB2CAuthTokenResult> authTokenResults;
        B2CIARequestB2CAuthTokenResult authTokenResult;

        // Initialize the results collection
        authTokenResults = new List<B2CIARequestB2CAuthTokenResult>();

        // Initialize the result we'll process
        authTokenResult = new B2CIARequestB2CAuthTokenResult();

        // Create the test ClientID
        testClientID = new B2C_Client_ID__c(
            Name = 'testClientID',
            B2C_Client_ID_Label__c = 'Test B2C ClientID',
            Audit_Authentication_API_Interactions__c = true,
            Is_Active__c = true,
            JWT_Certificate_Name__c = B2CConstant.CERTTEST_VALIDATE_TESTCERTIFICATENAME
        );

        // Insert the ClientID
        Database.insert(testClientID);

        Test.startTest();

        // Define the authToken processing results details
        authTokenResult.b2cClientIdRecordId = testClientID.Id;
        authTokenResult.b2cClientId = testClientID.Name;
        authTokenResult.auditAuthenticationAPIInteractions = true;
        authTokenResult.bypassAuthTokenAuditing = true;
        authTokenResult.persistAuthToken = true;
        authTokenResult.status = 'OK';
        authTokenResult.statusCode = 200;
        authTokenResult.accessToken = 'my-access-token';
        authTokenResult.tokenType = 'Bearer';
        authTokenResult.expiresIn = 1799;
        authTokenResult.accountManagerUrl = 'https://account.demandware.com/dw/sso/access_token';
        authTokenResult.requestBody = 'my-test-body';
        authTokenResult.responseBody = '{ "my-test-result": true }';
        authTokenResult.isError = false;
        authTokenResult.errorMessage = null;

        // Execute the authToken processor and persist / audit
        B2CIAPersistB2CAuthToken.persistAndAuditB2CAuthToken(
            new List<B2CIARequestB2CAuthTokenResult> {
                authTokenResult
            }
        );

        Test.stopTest();

        // Retrieve the persisted authToken
        List<B2C_AuthToken__c> testAuthToken = [
            SELECT  Id
            FROM    B2C_AuthToken__c
            WHERE   B2C_Client_ID__c = :authTokenResult.b2cClientIdRecordId
            LIMIT   1
        ];

        // Retrieve the audit-record
        List<B2C_Client_ID_Integration_History__c> testIntegrationHistory = [
            SELECT  Id
            FROM    B2C_Client_ID_Integration_History__c
            WHERE   B2C_Client_ID__c = :authTokenResult.b2cClientIdRecordId
        ];

        // Validate that the authToken and integration history were not persisted
        System.assert(testAuthToken.size() == 0, 'Expected no authToken to be persisted and mapped to the test B2C ClientID');
        System.assert(testIntegrationHistory.size() == 0, 'Expected no integrationHistory record to be persisted and mapped to the B2C AuthToken and ClientID');

    }

}
