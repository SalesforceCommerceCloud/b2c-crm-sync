/**
 * @author Abraham David Lloyd
 * @date June 10th, 2021
 *
 * @see B2CJWTHelper
 * @description This class is the test class that exercises the B2CJWTHelper class methods.
 * it exercises the creation, minting, and validation of JWT tokens.
 */
@IsTest
private class B2CJWTHelper_Test {

    // Default the test constants
    public static String testAlgorithm = 'TEST123';
    public static String jwtSFDCAlgorithm = 'RSA-SHA256';
    public static String b2cClientID = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    public static String audienceUrl = 'https://sandbox.us01.dx.commercecloud.salesforce.com';
    public static Integer expiresInMinutes = 25;
    public static String testCertificateName = 'certificateDoesNotExist';

    // Default the error messages being employed
    public static String certErrorMessage = '-- expected an exception thrown -- due to the cert not being available.';
    public static String exceptionErrorMessage = '-- expected the exception thrown to be System.NoDataFoundException.';

    @IsTest
    static void testBase64UrlEncode() {

        // Initialize local variables
        String testStringToEncode;
        Blob testStringAsBlob;
        String testStringAsEncoded;
        Blob testStringAsDecodedBlob;
        String testStringAsDecoded;

        // Default the test string to encode
        testStringToEncode = 'test-string-to-base64-encode';
        testStringAsBlob = Blob.valueOf(testStringToEncode) ;

        Test.startTest();

            // Encode the test string base64 / url-encoded style
            testStringAsEncoded = B2CJWTHelper.base64UrlEncode(testStringAsBlob);

        Test.stopTest();

        // Decode the encodedString to a Blob and restore back to a string
        testStringAsDecodedBlob = EncodingUtil.base64Decode(testStringAsEncoded);
        testStringAsDecoded = testStringAsDecodedBlob.toString();

        // Confirm that the encoded / decoded strings match
        System.assertEquals(
            testStringToEncode, testStringAsDecoded,
            '-- The encoded and decoded strings do not match.'
        );

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
        System.assert(
            jwtHeaderAsDecoded.contains(testAlgorithm),
            '-- The test algorithm value was not found in the decoded jwtHeader.'
        );

    }

    @IsTest
    static void testBuildJWTPayload() {

        // Initialize local variables
        String jwtPayload;
        Blob jwtPayloadAsDecodedBlob;
        String jwtPayloadAsDecoded;

        Test.startTest();

            // Create the JWTPayload and encode it
            jwtPayload = B2CJWTHelper.buildJWTPayload(b2cClientID, audienceUrl, expiresInMinutes);

        Test.stopTest();

        // Decode the encodedString to a Blob and restore back to a string
        jwtPayloadAsDecodedBlob = EncodingUtil.base64Decode(jwtPayload);
        jwtPayloadAsDecoded = jwtPayloadAsDecodedBlob.toString();

        // Confirm that the test algorithm value was not found in the decoded jwtPayload
        System.assert(
            jwtPayloadAsDecoded.contains(b2cClientID),
            '-- The b2cClientID value was not found in the decoded jwtPayload.'
        );

        System.assert(
            jwtPayloadAsDecoded.contains(audienceUrl),
            '-- The audienceUrl value was not found in the decoded jwtPayload.'
        );

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
                jwtPayload = B2CJWTHelper.buildJWTPayload(b2cClientID, audienceUrl, expiresInMinutes);

                // Attempt to create the jwtToken
                jwt = B2CJWTHelper.buildJWTSignature(jwtHeader, jwtPayload, testCertificateName, jwtSFDCAlgorithm);

            } catch (Exception e) {

                // Audit the exception
                threwException = true;
                exceptionType = e.getTypeName();

            }

        Test.stopTest();

        // Audit that the System.NoDataFoundException exception; we can't test the signature due to cert access
        System.assertEquals(threwException, true, certErrorMessage);
        System.assertEquals(exceptionType, 'System.NoDataFoundException', exceptionErrorMessage);

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
                jwt = B2CJWTHelper.getJWT(testAlgorithm, jwtSFDCAlgorithm, b2cClientID,
                    testCertificateName, audienceUrl, expiresInMinutes);

            } catch (Exception e) {

                // Audit the exception
                threwException = true;
                exceptionType = e.getTypeName();

            }

        Test.stopTest();

        // Audit that the System.NoDataFoundException exception; we can't test the signature due to cert access
        System.assertEquals(threwException, true, certErrorMessage);
        System.assertEquals(exceptionType, 'System.NoDataFoundException', exceptionErrorMessage);

    }

}
