/**
 * @author Abraham David Lloyd
 * @date January 20th, 2020
 *
 * @description This class is used to retrieve B2C Commerce storefront data and details
 * from custom object collections.
*/
public with sharing class B2CStorefrontManager extends B2CBaseMeta {

    /**
     * @description Attempts to retrieve a storefront configured via custom objects.  This method
     * automatically throws an error if no records are found and filters on active records.
     *
     * @param siteId {String} Describes the siteId identifier used to retrieve a given definition
     * @return B2C Returns an instance of the customer list
     */
    public static B2C_Site__c getStorefront(String siteId) {
        return getStorefront(siteId, true, false);
    }

    /**
     * @description Attempts to retrieve a storefront configured via custom objects.  This method
     * automatically throws an error if no records are found and filters on active records.
     *
     * @param siteId {String} Describes the siteId identifier used to retrieve a given definition
     * @return B2C Returns an instance of the customer list
     */
    public static B2C_Site__c getStorefrontById(String siteId) {
        return getStorefrontById(siteId, true, false);
    }

    /**
     * @description Attempts to resolve a B2C Commerce storefront for a given siteId
     *
     * @param siteId {String} Describe the siteId used to retrieve a storefront definition
     * @param filterOnActive {Boolean} Describes if the query should filter on active objects only
     * @param returnEmptyObject {Boolean} Describes if an empty sObject should be returned if no results are found
     * @return {B2C_Sites} Returns an instance of the storefront
     */
    public static B2C_Site__c getStorefront(String siteId, Boolean filterOnActive, Boolean returnEmptyObject) {

        // Initialize local variables
        List<B2C_Site__c> storefronts;
        String errorMsg;
        Query siteQuery;
        B2C_Site__c output;

        // Default the error message
        errorMsg = B2CConstant.buildErrorMessage(B2CConstant.Errors_Meta_NoActiveStorefrontFound, siteId);

        // Seed the default query structure to leverage
        siteQuery = getDefaultQuery();

        // Define the record limit for the query
        siteQuery.setLimit(1);

        // Define the default where-clause for the query
        siteQuery.addConditionEq('Name', siteId);

        // Should only active-records be filtered?
        if (filterOnActive == true) {

            // If so, then append the active-flag to the query's where clause
            siteQuery.addConditionEq('Is_Active__c', true);

        }

        // Execute the query and evaluate the results
        storefronts = siteQuery.run();

        // Process the return results in a consistent manner
        output = (B2C_Site__c)processReturnResult('B2C_Site__c', returnEmptyObject, storefronts, errorMsg);

        // Return the site result
        return output;

    }

    /**
     * @description Attempts to resolve a B2C Commerce storefront for a given siteId
     *
     * @param crmSiteId {String} Describe the siteId used to retrieve a storefront definition
     * @param filterOnActive {Boolean} Describes if the query should filter on active objects only
     * @param returnEmptyObject {Boolean} Describes if an empty sObject should be returned if no results are found
     * @return {B2C_Sites} Returns an instance of the storefront
     */
    public static B2C_Site__c getStorefrontById(String crmSiteId, Boolean filterOnActive, Boolean returnEmptyObject) {

        // Initialize local variables
        List<B2C_Site__c> storefronts;
        String errorMsg;
        Query siteQuery;
        B2C_Site__c output;

        // Default the error message
        errorMsg = B2CConstant.buildErrorMessage(B2CConstant.Errors_Meta_NoActiveStorefrontFound, crmSiteId);

        // Seed the default query structure to leverage
        siteQuery = getDefaultQuery();

        // Define the record limit for the query
        siteQuery.setLimit(1);

        // Define the default where-clause for the query
        siteQuery.addConditionEq('Id', crmSiteId);

        // Should only active-records be filtered?
        if (filterOnActive == true) {

            // If so, then append the active-flag to the query's where clause
            siteQuery.addConditionEq('Is_Active__c', true);

        }

        // Execute the query and evaluate the results
        storefronts = siteQuery.run();

        // Process the return results in a consistent manner
        output = (B2C_Site__c)processReturnResult('B2C_Site__c', returnEmptyObject, storefronts, errorMsg);

        // Return the site result
        return output;

    }

    /**
     * @description Attempts to validate the mapping between a B2C Commerce CustomerList and Storefront
     *
     * @param customerListId {String} Describe the customerList used to retrieve a storefront definition
     * @param siteId {String} Describe the siteId used to retrieve a storefront definition
     * @return {B2C_Sites} Returns an instance of the storefront
     */
    public static B2C_Site__c getStorefrontByCustomerListIdSiteId(String customerListId, String siteId) {

        // Initialize local variables
        List<B2C_Site__c> storefronts;
        String errorMsg;
        Query siteQuery;
        B2C_Site__c output;

        // Default the error message
        errorMsg = B2CConstant.buildErrorMessage(B2CConstant.Errors_Meta_NoActiveStorefrontFound, siteId);

        // Seed the default query structure to leverage
        siteQuery = getDefaultQuery();

        // Define the record limit for the query
        siteQuery.setLimit(1);

        // Define the default where-clause for the query
        siteQuery.addConditionEq('Name', siteId);
        siteQuery.addConditionEq('CustomerList_ID__c', customerListId);
        siteQuery.addConditionEq('Is_Active__c', true);

        // Execute the query and evaluate the results
        storefronts = siteQuery.run();

        // Process the return results in a consistent manner
        output = (B2C_Site__c)processReturnResult('B2C_Site__c', true, storefronts, errorMsg);

        // Return the site result
        return output;

    }

    /**
     * @description Helper method that provides a consistent set of columns to leverage
     * when selecting sObject data via SOQL
     *
     * @return {Query} Returns the query template to leverage for sites
     */
    private static Query getDefaultQuery() {

        // Initialize local variables
        Query siteQuery;

        // Create the profile query that will be used to drive resolution
        siteQuery = new Query('B2C_Site__c');

        // Add the fields to retrieve
        siteQuery.selectField('Id');
        siteQuery.selectField('Name');
        siteQuery.selectField('Customer_List__c');
        siteQuery.selectField('CustomerList_ID__c');
        siteQuery.selectField('Storefront_Name__c');
        siteQuery.selectField('Storefront_Status__c');
        siteQuery.selectField('Base_Custom_Site_Url__c');
        siteQuery.selectField('Base_Internal_Site_Url__c');
        siteQuery.selectField('OOBO_Active_Url__c');
        siteQuery.selectField('API_Url__c');
        siteQuery.selectField('Named_Credential_Developer_Name__c');
        //siteQuery.selectField('Audit_OCAPI_API_Response__c');
        siteQuery.selectField('Is_Active__c');
        siteQuery.selectField('Description__c');
        siteQuery.selectField('Enable_Profile_Creation__c');
        siteQuery.selectField('Enable_Profile_Updates__c');
        siteQuery.selectField('Enable_Address_Creation__c');
        siteQuery.selectField('Enable_Address_Updates__c');

        // Return the default query structure
        return siteQuery;

    }

}
