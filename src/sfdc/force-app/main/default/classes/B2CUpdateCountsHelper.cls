/**
 * @author Abraham David Lloyd
 * @date May 22nd, 2021
 *
 * @description This helper class is used to automate the calculation of siteCounts for CustomerLists and
 * B2C Instances.  When a Site changes, re-calculate the site counts for the parentObjects.
 */
public with sharing class B2CUpdateCountsHelper {



    public static void updateCounts(List<B2C_CustomerList__c> deletedCustomerLists) {

        // Initialize local variables
        Set<String> b2cInstanceIds;
        List<B2C_Instance__c> b2cInstances;

        // Initialize the id-collections
        b2cInstanceIds = new Set<String>();

        // Loop over the collection of deleted customerLists
        for (B2C_CustomerList__c thisCustomerList : deletedCustomerLists) {

            // Build out the identifier collections
            b2cInstanceIds.add(thisCustomerList.B2C_Instance__c);

        }

        // Retrieve the collection of impacted B2C and CustomerList instances
        b2cInstances = [SELECT Id, Total_CustomerLists__c, Total_Sites__c FROM B2C_Instance__c WHERE Id IN :b2cInstanceIds];

        // Loop over the instance-collection and reset the count values
        for (B2C_Instance__c thisInstance : b2cInstances) {
            thisInstance.Total_Sites__c = null;
            thisInstance.Total_CustomerLists__c = null;
        }

        // Only perform the update if records were retrieved
        if (b2cInstances.size() > 0) { Database.update(b2cInstances); }

    }

    public static void updateCounts(List<B2C_Site__c> deletedSites) {

        // Initialize local variables
        Set<String> b2cInstanceIds;
        Set<String> b2cCustomerListIds;
        List<B2C_Instance__c> b2cInstances;
        List<B2C_CustomerList__c> b2cCustomerLists;

        // Initialize the id-collections
        b2cInstanceIds = new Set<String>();
        b2cCustomerListIds = new Set<String>();

        // Loop over the collection of deleted sites
        for (B2C_Site__c thisSite : deletedSites) {

            // Build out the identifier collections
            b2cInstanceIds.add(thisSite.B2C_Instance_Id__c);
            b2cCustomerListIds.add(thisSite.Customer_List__c);

        }

        // Retrieve the collection of impacted B2C and CustomerList instances
        b2cInstances = [SELECT Id, Total_CustomerLists__c, Total_Sites__c FROM B2C_Instance__c WHERE Id IN :b2cInstanceIds];
        b2cCustomerLists = [SELECT Id, Total_Sites__c FROM B2C_CustomerList__c WHERE Id IN :b2cCustomerListIds];

        // Loop over the instance-collection and reset the count values
        for (B2C_Instance__c thisInstance : b2cInstances) {
            thisInstance.Total_Sites__c = null;
            thisInstance.Total_CustomerLists__c = null;
        }

        // Loop over the instance-collection and reset the count values
        for (B2C_CustomerList__c thisCustomerList : b2cCustomerLists) {
            thisCustomerList.Total_Sites__c = null;
        }

        // Only perform the update if records were retrieved
        if (b2cInstances.size() > 0) { Database.update(b2cInstances); }
        if (b2cCustomerLists.size() > 0) { Database.update(b2cCustomerLists); }

    }

}
