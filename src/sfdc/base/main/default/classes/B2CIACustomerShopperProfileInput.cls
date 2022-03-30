/**
 * @author Jordane Bachelet
 * @date January 3rd, 2022
 * @description This is the input class for customer shopper profile retrieval.
 */
public with sharing class B2CIACustomerShopperProfileInput {
    @AuraEnabled @InvocableVariable(Required=true)
    public String siteId;

    @AuraEnabled @InvocableVariable(Required=true)
    public String customerId;

    @AuraEnabled @InvocableVariable(Required=true)
    public String clientId;

    @AuraEnabled @InvocableVariable(Required=true)
    public String token;

    @AuraEnabled @InvocableVariable(Required=true)
    public String domain;

    @AuraEnabled @InvocableVariable(Required=true)
    public String version;

    @AuraEnabled @InvocableVariable(Required=false)
    public String expandParameter;
}
