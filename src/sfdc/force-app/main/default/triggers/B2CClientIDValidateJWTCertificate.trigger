/**
 * @author Abraham David Lloyd
 * @date June 10th, 2021
 *
 * @description This trigger is used to automate the validation of the JWT Certificate name.  It will
 * throw an error if the certDeveloperName cannot be verified.
 */
trigger B2CClientIDValidateJWTCertificate on B2C_Client_ID__c (before insert, before update) {

    // Do not process this trigger if the control on the trigger is disabled
    if (B2CConfigurationManager.isB2CClientIDCertValidationTriggerEnabled() == true ) {

        // Initialize local variables
        List<B2CIAB2CClientIDCertValidatorInput> validatorInputs;
        B2CIAB2CClientIDCertValidatorInput validatorInput;
        List<B2CIAB2CClientIDCertValidatorResult> validationResults;

        // Initialize the input collection
        validatorInputs = new List<B2CIAB2CClientIDCertValidatorInput>();

        // Loop over the collection and seed the input collection
        for (B2C_Client_ID__c thisRecord : Trigger.new) {

            // Add the current record to the input collection
            validatorInput = new B2CIAB2CClientIDCertValidatorInput();
            validatorInput.B2CClientID = thisRecord;
            validatorInputs.add(validatorInput);

        }

        // Attempt to exercise the certValidator and confirm that the certificate does / does not exist
        validationResults = B2CIAB2CClientIDCertValidator.validateCertificate(validatorInputs);

        // Loop over the results collection and evaluate the results
        for (B2CIAB2CClientIDCertValidatorResult thisResult : validationResults) {

            // Evaluate if the certificate-test was successful
            if (thisResult.isCertificateValid == true) {

                // If so, then set the verified checkbox
                thisResult.B2CClientID.Is_Certificate_Verified__c = true;

            } else {

                // Add an exception to the current B2C Client ID -- alerting that we could not verify
                // the certificate exists (the JWT Certificate Name should map to the unique-name of
                // an existing certificate.
                thisResult.B2CClientID.addError(B2CConstant.Errors_B2CClientID_UnableToVerifyCertificate);

            }

        }

    }

}
