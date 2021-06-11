/**
 * @author Abraham David Lloyd
 * @date June 10th, 2021
 *
 * @description This class is to validate that the IA used to exercise certificate
 * validation is able to successfully do so.
 */
@IsTest
private class B2CIAB2CClientIDCertValidator_Test {

    /**
     * @description Setup method that creates the customerList record(s) required to support testing.
     */
    @TestSetup static void setup() {

        // Setup a single clientId we can use for testing / validation
        B2C_Client_ID__c B2CClientID = (B2C_Client_ID__c) TestDataFactory.createSObject('B2C_Client_ID__c', new Map<String, Object>{
            'Name' => 'abcd1234',
            'JWT_Certificate_Name__c' => 'myCertificateName',
            'Is_Active__c' => true
        });

    }

    @IsTest
    static void validateCertificateTest() {

        // Initialize local variables
        List<B2CIAB2CClientIDCertValidatorInput> validatorInputs;
        List<B2CIAB2CClientIDCertValidatorResult> validationResults;
        B2CIAB2CClientIDCertValidatorInput validatorInput;

        // Initialize the input
        validatorInputs = new List<B2CIAB2CClientIDCertValidatorInput>();
        validatorInput = new B2CIAB2CClientIDCertValidatorInput();

        // Seed the clientId to work with
        validatorInput.B2CClientID = [
            SELECT  Id,
                    Name,
                    JWT_Certificate_Name__c,
                    Is_Active__c
            FROM    B2C_Client_ID__c
            LIMIT   1
        ];

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
