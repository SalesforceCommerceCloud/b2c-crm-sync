/**
 * @author Abraham David Lloyd
 * @date January 21st, 2020
 *
 * @description This class is used to retrieve B2C Commerce customer list data and details
 * from custom object definitions.  Each customer-list should also have an associated
 * default storefront.
 */
public with sharing class B2CCustomerListManager extends B2CBaseMeta {

    /**
     * @description Attempts to retrieve a customer list configured via custom objects.  This method
     * automatically throws an error if no records are found.
     *
     * @param customerListId {String} Describes the customerList identifier used to retrieve a given definition
     * @return B2C Returns an instance of the customer list
     */
    public static B2C_CustomerList__c getCustomerList(String customerListId) {
        return getCustomerList(customerListId, true, false);
    }

    /**
     * @description Attempts to retrieve a customer list configured via custom objects.
     *
     * @param customerListId {String} Describes the B2C customerList identifier used to retrieve a given definition
     * @param filterOnActive {Boolean} Describes if the query should filter on active objects only
     * @param returnEmptyObject {Boolean} Describes if an empty sObject should be returned if no results are found
     * @return B2C Returns an instance of the customer list
     */
    public static B2C_CustomerList__c getCustomerList(String customerListId, Boolean filterOnActive, Boolean returnEmptyObject) {

        // Initialize local variables
        List<B2C_CustomerList__c> customerLists;
        String errorMsg;
        Query customerListQuery;
        B2C_CustomerList__c output;

        // Default the error message
        errorMsg = B2CConstant.buildErrorMessage(B2CConstant.Errors_Meta_CustomerListNotFound, customerListId);

        // Seed the default query structure to leverage
        customerListQuery = getDefaultQuery();

        // Define the record limit for the query
        customerListQuery.setLimit(1);

        // Define the default where-clause for the query
        customerListQuery.addConditionEq('Name', customerListId);

        // Should only active-records be filtered?
        if (filterOnActive == true) {

            // If so, then append the active-flag to the query's where clause
            customerListQuery.addConditionEq('Is_Active__c', true);

        }

        // Execute the query and evaluate the results
        customerLists = customerListQuery.run();

        // Process the return results in a consistent manner
        output = (B2C_CustomerList__c)processReturnResult('B2C_CustomerList__c', returnEmptyObject, customerLists, errorMsg);

        // Return the customerList result
        return output;

    }

    /**
     * @description Attempts to retrieve a customer list configured via custom objects.
     *
     * @param customerListId {String} Describes the CRM customerList identifier used to retrieve a given definition
     * @param filterOnActive {Boolean} Describes if the query should filter on active objects only
     * @param returnEmptyObject {Boolean} Describes if an empty sObject should be returned if no results are found
     * @return B2C Returns an instance of the customer list
     */
    public static B2C_CustomerList__c getCustomerListById(String customerListId, Boolean filterOnActive, Boolean returnEmptyObject) {

        // Initialize local variables
        List<B2C_CustomerList__c> customerLists;
        String errorMsg;
        Query customerListQuery;
        B2C_CustomerList__c output;

        // Default the error message
        errorMsg = B2CConstant.buildErrorMessage(B2CConstant.Errors_Meta_CustomerListNotFound, customerListId);

        // Seed the default query structure to leverage
        customerListQuery = getDefaultQuery();

        // Define the record limit for the query
        customerListQuery.setLimit(1);

        // Define the default where-clause for the query
        customerListQuery.addConditionEq('Id', customerListId);

        // Should only active-records be filtered?
        if (filterOnActive == true) {

            // If so, then append the active-flag to the query's where clause
            customerListQuery.addConditionEq('Is_Active__c', true);

        }

        // Execute the query and evaluate the results
        customerLists = customerListQuery.run();

        // Process the return results in a consistent manner
        output = (B2C_CustomerList__c)processReturnResult('B2C_CustomerList__c', returnEmptyObject, customerLists, errorMsg);

        // Return the customerList result
        return output;

    }

    /**
     * @description Helper method that provides a consistent set of columns to leverage
     * when selecting sObject data via SOQL
     *
     * @return {Query} Returns the query template to leverage for customerLists
     */
    private static Query getDefaultQuery() {

        // Initialize local variables
        Query customerListQuery;

        // Create the profile query that will be used to drive resolution
        customerListQuery = new Query('B2C_CustomerList__c');

        // Add the fields to retrieve
        customerListQuery.selectField('Id');
        customerListQuery.selectField('Name');
        customerListQuery.selectField('B2C_Instance__c');
        customerListQuery.selectField('API_Url__c');
        customerListQuery.selectField('Base_API_Url__c');
        customerListQuery.selectField('OCAPI_Version_No__c');
        customerListQuery.selectField('Named_Credential_Developer_Name__c');
        customerListQuery.selectField('Audit_OCAPI_API_Response__c');
        customerListQuery.selectField('Is_Active__c');
        customerListQuery.selectField('Default_Storefront__c');
        customerListQuery.selectField('Enable_Profile_Retrieval__c');
        customerListQuery.selectField('Enable_Profile_Publishing__c');
        customerListQuery.selectField('Enable_Profile_Creation__c');
        customerListQuery.selectField('Enable_Profile_Updates__c');

        // Return the default query structure
        return customerListQuery;

    }

}