/**
 * @author Jordane Bachelet
 * @date December 14th, 2021
 *
 * @see B2CIAPasswordReset.resetCustomerPassword
 * @description This is a helper-class used by the B2CIAPasswordReset class
 * to reset a customer password
*/
public class B2CIAPasswordResetInput {
    ////////////////////////////////////////////////////////////////
    // Include the REST response properties
    ////////////////////////////////////////////////////////////////

    @InvocableVariable(Required=true)
    public String siteId;

    @InvocableVariable(Required=true)
    public String customerId;

    @InvocableVariable(Required=true)
    public String clientId;

    @InvocableVariable(Required=true)
    public String token;

    @InvocableVariable(Required=true)
    public String domain;

    @InvocableVariable(Required=true)
    public String version;
}
