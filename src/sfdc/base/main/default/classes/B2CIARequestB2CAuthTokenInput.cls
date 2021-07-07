/**
 * @author Abraham David Lloyd
 * @date June 7th, 2021
 *
 * @see B2CIARequestB2CAuthToken
 * @description This is a helper-class used by the B2CIAGetB2CAuthToken class
 * to retrieve the details for a single / specified B2C Commerce AuthToken.
*/
public class B2CIARequestB2CAuthTokenInput {

    ////////////////////////////////////////////////////////////////
    // Include the properties used to request the authToken
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public String b2cClientIdRecordId;

    @InvocableVariable
    public String b2cClientId;

    @InvocableVariable
    public String jwtCertificate;

    @InvocableVariable
    public Boolean auditAuthenticationAPIInteractions;

    @InvocableVariable
    public Boolean bypassAuthTokenAuditing;

}
