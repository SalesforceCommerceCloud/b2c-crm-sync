public with sharing class B2CIABusinessManagerGrantInput {

    /** @constructor **/
    public B2CIABusinessManagerGrantInput() {}

    @AuraEnabled @InvocableVariable(Required=true)
    public String namedCredential;

    @AuraEnabled @InvocableVariable(Required=true)
    public String clientId;
}
