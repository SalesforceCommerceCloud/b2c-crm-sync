/**
 * @author Abraham David Lloyd
 * @date January 21st, 2021
 *
 * @see B2CIAGetCustomerListsSites
 * @description This is a helper-class used by the B2CIAGetAllSites class
 * to retrieve all the storefront / site details for the specified instance
*/
global class B2CIAGetCustomerListsSitesResult {

    ////////////////////////////////////////////////////////////////
    // Include any details anchoring to the parent B2C Instance
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public String b2cInstanceId;

    @InvocableVariable
    public String namedCredentialDeveloperName;

    ////////////////////////////////////////////////////////////////
    // Include the REST response properties
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public String status;

    @InvocableVariable
    public Integer statusCode;

    @InvocableVariable
    public String responseBody;

    @InvocableVariable
    public JSONParse parsedResponse;

    ////////////////////////////////////////////////////////////////
    // Include the deserialized properties from the response
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Integer totalRecords;

    @InvocableVariable
    public Integer totalSiteRecords;

    @InvocableVariable
    public Integer totalCustomerListRecords;

    ////////////////////////////////////////////////////////////////
    // Include any error messaging or detail flags
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Boolean isError;

    @InvocableVariable
    public String errorMessage;

    @InvocableVariable
    public List<B2C_CustomerList__c> b2cCustomerListList;

    @InvocableVariable
    public List<B2C_Site__c> b2cSiteList;

}