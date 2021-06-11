/**
 * @author Abraham David Lloyd
 * @date June 10th, 2021
 *
 * @see B2CJWTHelper
 * @description This class is the test class that exercises the B2CJWTHelper class methods.
 */
@IsTest
private class B2CJWTHelper_Test {

    // Default the test constants
    public static String testAlgorithm = 'TEST123';
    public static String B2CClientID = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    public static String audienceUrl = 'https://sandbox.us01.dx.commercecloud.salesforce.com';
    public static Integer expiresInMinutes = 25;
    public static String testCertificateName = 'certificateDoesNotExist';

    @IsTest
    static void testBase64UrlEncode() {

        // Initialize local variables
        String TestStringToEncode;
        Blob TestStringAsBlob;
        String TestStringAsEncoded;
        Blob TestStringAsDecodedBlob;
        String TestStringAsDecoded;

        // Default the test string to encode
        TestStringToEncode = 'test-string-to-base64-encode';
        TestStringAsBlob = Blob.valueOf(TestStringToEncode) ;

        Test.startTest();

            // Encode the test string base64 / url-encoded style
            TestStringAsEncoded = B2CJWTHelper.base64UrlEncode(TestStringAsBlob);

        Test.stopTest();

        // Decode the encodedString to a Blob and restore back to a string
        TestStringAsDecodedBlob = EncodingUtil.base64Decode(TestStringAsEncoded);
        TestStringAsDecoded = TestStringAsDecodedBlob.toString();

        // Confirm that the encoded / decoded strings match
        System.assertEquals(TestStringToEncode, TestStringAsDecoded, '-- The encoded and decoded strings do not match.');

    }

    @IsTest
    static void testBuildJWTHeader() {

        // Initialize local variables
        String jwtHeader;
        Blob jwtHeaderAsDecodedBlob;
        String jwtHeaderAsDecoded;

        Test.startTest();

            // Create the JWTHeader and encode it
            jwtHeader = B2CJWTHelper.buildJWTHeader(testAlgorithm);

        Test.stopTest();

        // Decode the encodedString to a Blob and restore back to a string
        jwtHeaderAsDecodedBlob = EncodingUtil.base64Decode(jwtHeader);
        jwtHeaderAsDecoded = jwtHeaderAsDecodedBlob.toString();

        // Confirm that the test algorithm value was not found in the decoded jwtHeader
        System.assert(jwtHeaderAsDecoded.contains(testAlgorithm), '-- The test algorithm value was not found in the decoded jwtHeader.');

    }

    @IsTest
    static void testBuildJWTPayload() {

        // Initialize local variables
        String jwtPayload;
        Blob jwtPayloadAsDecodedBlob;
        String jwtPayloadAsDecoded;

        Test.startTest();

            // Create the JWTPayload and encode it
            jwtPayload = B2CJWTHelper.buildJWTPayload(B2CClientID, audienceUrl, expiresInMinutes);

        Test.stopTest();

        // Decode the encodedString to a Blob and restore back to a string
        jwtPayloadAsDecodedBlob = EncodingUtil.base64Decode(jwtPayload);
        jwtPayloadAsDecoded = jwtPayloadAsDecodedBlob.toString();

        // Confirm that the test algorithm value was not found in the decoded jwtPayload
        System.assert(jwtPayloadAsDecoded.contains(B2CClientID), '-- The B2CClientID value was not found in the decoded jwtPayload.');
        System.assert(jwtPayloadAsDecoded.contains(audienceUrl), '-- The audienceUrl value was not found in the decoded jwtPayload.');

    }

    @IsTest
    static void testBuildJWTSignature() {

        // Initialize local variables
        String jwtHeader;
        String jwtPayload;
        String jwt;
        Boolean threwException;
        String exceptionType;

        // Default the exception flag
        threwException = false;

        Test.startTest();

            try {

                // Create the JWTPayload header and payload
                jwtHeader = B2CJWTHelper.buildJWTHeader(testAlgorithm);
                jwtPayload = B2CJWTHelper.buildJWTPayload(B2CClientID, audienceUrl, expiresInMinutes);

                // Attempt to create the jwtToken
                jwt = B2CJWTHelper.buildJWTSignature(jwtHeader, jwtPayload, testCertificateName);

            } catch (Exception e) {

                // Audit the exception
                threwException = true;
                exceptionType = e.getTypeName();

            }

        Test.stopTest();

        // Audit that the System.NoDataFoundException exception was thrown; we can't test the signature due to cert access
        System.assertEquals(threwException, true, '-- expected an exception to be thrown -- due to the cert not being available.');
        System.assertEquals(exceptionType, 'System.NoDataFoundException', '-- expected the exception thrown to be System.NoDataFoundException.');

    }

    @IsTest
    static void testGetJWT() {

        // Initialize local variables
        String jwt;
        Boolean threwException;
        String exceptionType;

        // Default the exception flag
        threwException = false;

        Test.startTest();

            try {

                // Attempt to create the jwtToken using the test values
                jwt = B2CJWTHelper.getJWT(testAlgorithm, B2CClientID, testCertificateName, audienceUrl, expiresInMinutes);

            } catch (Exception e) {

                // Audit the exception
                threwException = true;
                exceptionType = e.getTypeName();

            }

        Test.stopTest();

        // Audit that the System.NoDataFoundException exception was thrown; we can't test the signature due to cert access
        System.assertEquals(threwException, true, '-- expected an exception to be thrown -- due to the cert not being available.');
        System.assertEquals(exceptionType, 'System.NoDataFoundException', '-- expected the exception thrown to be System.NoDataFoundException.');

    }

}
