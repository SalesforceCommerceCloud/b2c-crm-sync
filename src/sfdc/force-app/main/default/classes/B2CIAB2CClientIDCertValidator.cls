/**
 * @author Abraham David Lloyd
 * @date June 10th, 2021
 *
 * @description This is a wrapper-class to validate the certificate
 * existence associated with the B2C Client ID.
*/
public with sharing class B2CIAB2CClientIDCertValidator {

    /**
     * @see B2CIAB2CClientIDCertValidator
     * @description Invokable action to validate the certificate associated to a B2C Client ID.
     *
     * @param B2CClientIDs {List<B2CIAB2CClientIDCertValidatorInput>} Represents the request arguments to process
     * @returns {List<B2CIAGetCustomerProfileResult>} Returns the response object containing the customer details
     */
    @InvocableMethod(Label='B2C: Validate B2C Client ID Certificate' Description='Attempts to verify that the B2C Client ID certificate developerName exists in the Salesforce org')
    public static List<B2CIAB2CClientIDCertValidatorResult> validateCertificate(List<B2CIAB2CClientIDCertValidatorInput> B2CClientIDs) {

        // Initialize local variables
        List<B2CIAB2CClientIDCertValidatorResult> validationResults;
        B2CIAB2CClientIDCertValidatorResult validationResult;
        String testString;
        Blob testStringAsBlob;
        Map<String, String> accountManagerSettings;
        Boolean isSuccess;
        String exceptionType;
        String errorMessage;

        // Initialize the output
        validationResults = new List<B2CIAB2CClientIDCertValidatorResult>();

        // Initialize the test strings used to test the certificate
        testString = B2CConstant.CertTest_Validate_CertificateCanSign;
        testStringAsBlob = Blob.valueOf(testString);

        // Retrieve the accountManager settings for the current configuration
        accountManagerSettings = B2CConfigurationManager.getAccountManagerSettings();

        // Loop over the collection of B2C Client IDs to process
        for (B2CIAB2CClientIDCertValidatorInput thisB2CClientID: B2CClientIDs) {

            // Default the success flags
            isSuccess = true;
            exceptionType = null;
            errorMessage = null;

            // Initialize the validationResult
            validationResult = new B2CIAB2CClientIDCertValidatorResult();

            try {

                // Attempt the signature
                Crypto.signWithCertificate(
                    accountManagerSettings.get('JWTSFDCAlgorithm'),
                    testStringAsBlob,
                    thisB2CClientID.B2CClientID.JWT_Certificate_Name__c
                );

            } catch (Exception e) {

                // Record the exception details
                isSuccess = false;
                exceptionType = e.getTypeName();
                errorMessage = e.getMessage();

            }

            // Seed the validation / test details
            validationResult.isCertificateValid = isSuccess;
            validationResult.B2CClientID = thisB2CClientID.B2CClientID;
            validationResult.errorType = exceptionType;
            validationResult.errorMessage = errorMessage;

            // Add the validation result to the output resultSet
            validationResults.add(validationResult);

        }

        // Return the collection of processed results
        return validationResults;

    }

}
