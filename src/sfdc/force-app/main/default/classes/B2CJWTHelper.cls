/**
 * @author Abraham David Lloyd
 * @date June 7th, 2021
 *
 * @description This class is a helper class used to generate a JWT token that can be
 * exchanged for a B2C Commerce REST API AuthToken.  Many thanks to Jakob Prust who
 * did leading work on this topic (we build on it).  Check out his original repo via
 * https://github.com/ppavlov-dw/sfsc-sfcc-connector-auth-poc
 */
public with sharing class B2CJWTHelper {

    /**
     * @description Helper function to create the JWT token that will be used to authenticate against B2C Commerce's Account Manager
     *
     * @param sfccHeaderAlgorithm {String} Represents the SFCC algorithm to include in the JWT Header (ex. RS256)
     * @param sfdcHeaderAlgorithm {String} Represents the SFCC algorithm used  mint the JWT (ex. RSA-SHA256)
     * @param B2CClientID {String} Represents the Account Manager ClientID used to authenticate
     * @param certDeveloperName {String} Represents the developerName of the Certificate used to sign the JWT
     * @param audienceUrl {String} Represents the destinationUrl that will be verified via the JWT
     * @param expiresInMinutes {String} Represents in minutes the expected TTL for the retrieved authToken
     *
     * @return {String} Returns the encoded JWT token that will be used to authenticate against B2C Commerce
     */
    public static String getJWT(
        String sfccHeaderAlgorithm, String sfdcHeaderAlgorithm, String B2CClientID, String certDeveloperName,
        String audienceUrl, Integer expiresInMinutes) {

        // Initialize local variables
        String header;
        String payload;
        String signature;
        String JWT;

        // Build the JWT components
        header = buildJWTHeader(sfccHeaderAlgorithm);
        payload = buildJWTPayload(B2CClientID, audienceUrl, expiresInMinutes);
        signature = buildJWTSignature(header, payload, certDeveloperName, sfdcHeaderAlgorithm);

        // Create the JWT by joining the components
        JWT = header + '.' + payload + '.' + signature;

        // Return the JWT
        return JWT;

    }

    /**
     * @description Helper function to base64 encode a blob (representing a string).
     *
     * @param input {Blob} Represents the string being encoded
     * @return Returns the base64 encoded string with a little string-manipulation applied
     */
    public static String base64UrlEncode(Blob input) {

        // Initialize local variables
        String output;

        // Encode the input property
        output = EncodingUtil.base64Encode(input);

        // Do simple string-replacement magic
        output = output.replace('+', '-');
        output = output.replace('/', '_');

        // Trim the output
        while (output.endsWith('=')){
            output = output.substring(0, output.length() - 1);
        }

        // Return the encoded string
        return output;

    }

    /**
     * @description Helper function to create and encode a JWT header.
     *
     * @param algorithm {String} Represents the type of hashing algorithm used
     * @return {String} Returns an encoded string representing the JWT header
     */
    public static String buildJWTHeader(String algorithm) {

        // Initialize local Variables
        JSONGenerator headerGenerator;
        String encodedHeader;

        // Initialize the payload to be encoded
        headerGenerator = JSON.createGenerator(false);

        headerGenerator.writeStartObject();
        headerGenerator.writeStringField('alg', algorithm);
        headerGenerator.writeStringField('typ', 'JWT');

        // Close and encode the header
        headerGenerator.writeEndObject();
        encodedHeader = base64UrlEncode(Blob.valueOf(headerGenerator.getAsString()));

        // Return the encoded header
        return encodedHeader;

    }

    /**
     * @description Helper function to create and encode a JWT payload
     *
     * @param B2CClientID {String} Represents the Account Manager ClientID that will be authenticated against
     * @param audienceUrl {String} Represents the destinationUrl that will be verified via authentication
     * @param expiresInMinutes {Integer} Represents the TTL in minutes for the JWT / retrieved authToken
     *
     * @return {String} Returns an encoded string representing the JWT payload
     */
    public static String buildJWTPayload(String B2CClientID, String audienceUrl, Integer expiresInMinutes) {

        // Initialize local Variables
        Datetime now;
        JSONGenerator payloadGenerator;
        String encodedPayload;

        // Initialize the current time
        now = Datetime.now();

        // Initialize the payload to be encoded
        payloadGenerator = JSON.createGenerator(false);
        payloadGenerator.writeStartObject();

        // Define each of the JWT payload properties
        payloadGenerator.writeStringField('iss', B2CClientID);
        payloadGenerator.writeStringField('sub', B2CClientID);
        payloadGenerator.writeStringField('aud', audienceUrl);
        payloadGenerator.writeNumberField('iat', now.getTime() / 1000);
        payloadGenerator.writeNumberField('exp', now.addMinutes(expiresInMinutes).getTime() / 1000);

        // Close and encode the payload
        payloadGenerator.writeEndObject();
        encodedPayload = base64UrlEncode(Blob.valueOf(payloadGenerator.getAsString()));

        // Return the encoded payload
        return encodedPayload;

    }

    /**
     * @description Helper function to create a fully-formed / digitally signed JWT that can be used
     * to authenticate against B2C Commerce's Account Manager and retrieve a REST API authToken.
     *
     * @param header {String} Represents the generated JWT header
     * @param payload {String} Represents the generated JWT payload
     * @param certDeveloperName {String} Represents the developerName of the cert used to sign the JWT
     * @param sfdcHeaderAlgorithm {String} Represents the SFCC algorithm used  mint the JWT (ex. RSA-SHA256)
     *
     * @return {String} Returns a string representing the signed JWT token
     */
    public static String buildJWTSignature(String header, String payload, String certDeveloperName, String sfdcHeaderAlgorithm) {

        // Initialize local variables
        String JWTAsString;
        Blob JWTAsBlob;
        String signedJWT;

        // Create the JWT object-to-be-signed
        JWTAsString = header + '.' + payload;
        JWTAsBlob = Blob.valueOf(JWTAsString);

        // Generate the JWT signature the specified certificate
        Blob signature = Crypto.signWithCertificate(sfdcHeaderAlgorithm, JWTAsBlob, certDeveloperName);

        // Encode the signature
        signedJWT = base64UrlEncode(signature);

        // Return the signature for inclusion in the JWT
        return signedJWT;

    }

}
