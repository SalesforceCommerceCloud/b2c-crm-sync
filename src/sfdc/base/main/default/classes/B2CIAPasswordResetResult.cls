/**
 * @author Jordane Bachelet
 * @date December 14th, 2021
 *
 * @see B2CIAPasswordReset.resetCustomerPassword
 * @description This is a helper-class used by the B2CIAPasswordReset class
 * to reset a customer password
*/
public class B2CIAPasswordResetResult {
    ////////////////////////////////////////////////////////////////
    // Include the REST response properties
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public String status;

    @InvocableVariable
    public Integer statusCode;

    @InvocableVariable
    public String apiUrl;

    @InvocableVariable
    public String requestBody;

    @InvocableVariable
    public String responseBody;

    ////////////////////////////////////////////////////////////////
    // Include any error messaging or detail flags
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Boolean isError;

    @InvocableVariable
    public String errorMessage;
}
