/**
 * @author Abraham David Lloyd
 * @date June 10th, 2021
 *
 * @description This class is to validate that the IA used to exercise certificate
 * validation is able to successfully do so.
 */
@IsTest
private class B2CIAB2CClientIDCertValidator_Test {

    @IsTest
    static void validateCertificateTest() {

        // Initialize local variables
        List<B2CIAB2CClientIDCertValidatorInput> validatorInputs;
        List<B2CIAB2CClientIDCertValidatorResult> validationResults;
        B2CIAB2CClientIDCertValidatorInput validatorInput;
        B2C_Client_ID__c thisB2CClientID;

        // Initialize the inputs
        validatorInputs = new List<B2CIAB2CClientIDCertValidatorInput>();
        validatorInput = new B2CIAB2CClientIDCertValidatorInput();
        thisB2CClientID = new B2C_Client_ID__c();

        // Default the minimal attributes of the ClientID
        thisB2CClientID.Name = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        thisB2CClientID.JWT_Certificate_Name__c = 'myCertificateName';
        thisB2CClientID.Is_Active__c = true;

        // Seed the clientId to work with
        validatorInput.B2CClientID = thisB2CClientID;

        // Add the input to the processing collection
        validatorInputs.add(validatorInput);

        Test.startTest();

            // Attempt to exercise the certValidator and confirm that the certificate does / does not exist
            validationResults = B2CIAB2CClientIDCertValidator.validateCertificate(validatorInputs);

        Test.stopTest();

        // Loop over the collection of validation results and confirm the results
        for (B2CIAB2CClientIDCertValidatorResult validationResult : validationResults) {

            // We expect the certificate validation to fail because we cannot upload / create a self-signed certificate programmatically
            System.assertEquals(validationResult.isCertificateValid, false, 'Expected the certificate validation to fail.');

        }

    }

}
