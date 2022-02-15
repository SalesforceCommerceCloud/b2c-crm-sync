/**
 * @author Jordane Bachelet
 * @date January 3rd, 2022
 *
 * @description This is the wrapper used by the B2CIACustomerShopperProfile class to capture the B2C Commerce API result
*/
public class B2CIACustomerShopperProfileResult {

    ////////////////////////////////////////////////////////////////
    // Include the REST response properties
    ////////////////////////////////////////////////////////////////
    @InvocableVariable
    public String status;

    @InvocableVariable
    public Integer statusCode;

    @InvocableVariable
    public String responseBody;

    ////////////////////////////////////////////////////////////////
    // Include any error messaging or detail flags
    ////////////////////////////////////////////////////////////////
    @InvocableVariable
    public Boolean isError;

    @InvocableVariable
    public String errorMessage;

    ////////////////////////////////////////////////////////////////
    // Include the deserialized properties from the response
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Integer totalPromotionsSize;

    @InvocableVariable
    public List<String> promotionIds;
}
