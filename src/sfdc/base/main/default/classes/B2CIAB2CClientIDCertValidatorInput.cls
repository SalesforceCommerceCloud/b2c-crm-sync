/**
 * @author Abraham David Lloyd
 * @date June 9th, 2021
 *
 * @description This class is used to define the input properties
 * supporting the validation of B2C Client ID certificates.
*/
public with sharing class B2CIAB2CClientIDCertValidatorInput {

    ////////////////////////////////////////////////////////////////
    // Define the B2C Client ID being evaluated
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public B2C_Client_ID__c b2cClientID;

}
