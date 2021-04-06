public with sharing class B2CIAAuthCustomerInput {
    public B2CIAAuthCustomerInput() {}

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
}