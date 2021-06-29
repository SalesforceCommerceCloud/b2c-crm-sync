/**
 * @author Abraham David Lloyd
 * @date June 29th, 2021
 *
 * @description This class exercises the successful and failed retrieval of the B2C AuthToken
 * via the B2C Commerce Account Manager leveraging JWT token-exchange.
 */
@IsTest
private class B2CIARequestB2CAuthToken_Test {

    /**
     * @see B2CIARequestB2CAuthToken.getB2CAuthTokenViaJWT
     * @description This test is used to exercise the retrieval of a B2C AuthToken's success scenario.
     * It validates that a successful token-retrieval is successfully processed.
     */
    @IsTest
    static void testIsSuccess() {

        // Initialize local variables
        B2C_Client_ID__c testClientID = new B2C_Client_ID__c(
            Name = 'my-test-clientId',
            B2C_Client_ID_Label__c = 'My Test ClientID',
            JWT_Certificate_Name__c = B2CConstant.CertTest_Validate_TestCertificateName,
            Is_Active__c = true,
            Audit_Authentication_API_Interactions__c = true
        );

        // Save the testClientID
        Database.insert(testClientID);

        // Initialize the result collection
        List<B2CIARequestB2CAuthTokenResult> tokenResultList = new List<B2CIARequestB2CAuthTokenResult>();

        Test.startTest();

            // Set the mock-generator for the current request (modeling success)
            Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('AccessTokenSuccess'));

            // Initialize the input argument collection
            B2CIARequestB2CAuthTokenInput req = new B2CIARequestB2CAuthTokenInput();

            // Seed the input arguments
            req.b2cClientIdRecordId = testClientID.Id;
            req.b2cClientId = testClientID.Name;
            req.jwtCertificate = testClientID.JWT_Certificate_Name__c;
            req.auditAuthenticationAPIInteractions = testClientID.Audit_Authentication_API_Interactions__c;
            req.bypassAuthTokenAuditing = false;

            // Request the authToken and validate the results
            tokenResultList = B2CIARequestB2CAuthToken.getB2CAuthTokenViaJWT(
                new List<B2CIARequestB2CAuthTokenInput>{
                    req
                }
            );

        Test.stopTest();

        // Validate that the request processed successfully
        System.assertEquals(tokenResultList.size() > 0, true, 'Expected a result to be processed and returned in the results');
        System.assertEquals(tokenResultList.get(0).statusCode, 200, 'Expected a successful http statusCode to be returned as part of this request');
        System.assertEquals(tokenResultList.get(0).accessToken, B2CConstant.AuthTest_AuthToken, 'Expected the accessToken to equal the test tokenValue.');

    }

    /**
     * @see B2CIARequestB2CAuthToken.getB2CAuthTokenViaJWT
     * @description This test is used to exercise the retrieval of a B2C AuthToken's failure scenario.
     * It validates that a token-retrieval failure is successfully processed.
     */
    @IsTest
    static void testIsFailure() {

        // Initialize local variables
        B2C_Client_ID__c testClientID = new B2C_Client_ID__c(
            Name = 'my-test-clientId',
            B2C_Client_ID_Label__c = 'My Test ClientID',
            JWT_Certificate_Name__c = B2CConstant.CertTest_Validate_TestCertificateName,
            Is_Active__c = true,
            Audit_Authentication_API_Interactions__c = true
        );

        // Save the testClientID
        Database.insert(testClientID);

        // Initialize the result collection
        List<B2CIARequestB2CAuthTokenResult> tokenResultList = new List<B2CIARequestB2CAuthTokenResult>();

        Test.startTest();

            // Set the mock-generator for the current request (modeling failure)
            Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('AccessTokenFailure'));

            // Initialize the input argument collection
            B2CIARequestB2CAuthTokenInput req = new B2CIARequestB2CAuthTokenInput();

            // Seed the input arguments
            req.b2cClientIdRecordId = testClientID.Id;
            req.b2cClientId = testClientID.Name;
            req.jwtCertificate = testClientID.JWT_Certificate_Name__c;
            req.auditAuthenticationAPIInteractions = testClientID.Audit_Authentication_API_Interactions__c;
            req.bypassAuthTokenAuditing = false;

            // Request the authToken and validate the results
            tokenResultList = B2CIARequestB2CAuthToken.getB2CAuthTokenViaJWT(
                new List<B2CIARequestB2CAuthTokenInput>{
                    req
                }
            );

        Test.stopTest();

        // Validate that the request processed successfully
        System.assertEquals(tokenResultList.size() > 0, true, 'Expected a result to be processed and returned in the results');
        System.assertEquals(tokenResultList.get(0).statusCode, 401, 'Expected a failure http statusCode to be returned as part of this request');

    }

}
