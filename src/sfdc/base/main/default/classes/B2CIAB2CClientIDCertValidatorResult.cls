/**
 * @author Abraham David Lloyd
 * @date June 10th, 2021
 *
 * @description This is the result-processing used by the
 * B2CIAB2CClientIDCertValidator class and returns the results
 * of the validation.
*/
public with sharing class B2CIAB2CClientIDCertValidatorResult {

    ////////////////////////////////////////////////////////////////
    // Define the cert validation response
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public B2C_Client_ID__c b2cClientID;

    @InvocableVariable
    public Boolean isCertificateValid;

    @InvocableVariable
    public String errorType;

    @InvocableVariable
    public String errorMessage;

}

