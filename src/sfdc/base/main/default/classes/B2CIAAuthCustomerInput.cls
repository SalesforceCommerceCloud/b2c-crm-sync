/**
 * @author Abraham David lloyd
 * @date July 1st, 2012
 * @description This is the input class for OOBO / customer-driven authentication against B2C Commerce.  It
 * contains the arguments used to obtain a clientCredential grant for a given shopper through an Agent.
 */
public with sharing class B2CIAAuthCustomerInput {

    /**
     * @constructor
     * @description Constructor to produce an instance of this class.
     **/
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
