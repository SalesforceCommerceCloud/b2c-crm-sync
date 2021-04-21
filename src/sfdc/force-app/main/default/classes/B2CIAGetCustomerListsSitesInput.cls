/**
 * @author Abraham David Lloyd
 * @date February 2nd, 2022
 *
 * @description This class is used to define the input properties
 * supporting the creation of B2C Commerce CustomerLists and Sites
 * for a given Instance.
*/
public class B2CIAGetCustomerListsSitesInput {

    @InvocableVariable
    public String b2cInstanceId;

    @InvocableVariable
    public String accessToken;

    @InvocableVariable
    public String APIUrl;

    @InvocableVariable
    public String OCAPIVersion;

}
