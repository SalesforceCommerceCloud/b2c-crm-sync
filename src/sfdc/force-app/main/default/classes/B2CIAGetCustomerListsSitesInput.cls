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
    public B2C_Instance__c b2cInstance;

    @InvocableVariable
    public B2C_Client_ID__c b2cClientId;

    @InvocableVariable
    public String b2cAuthToken;

    @InvocableVariable
    public String ocapiVersion;

}
