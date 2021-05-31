
/**
 * This script is used to purge the collection of Accounts, Contacts, B2C Sites, and B2C CustomerLists.
 * It's used to remove deployment data when exercising b2c-crm-sync setup CLI commands.
 */

// Initialize local variables
List<Account> accountList;
List<Contact> contactList;
List<B2C_Site__c> siteList;
List<B2C_CustomerList__c> customerLists;

// Retrieve and delete the related Accounts
accountList = [SELECT Id FROM Account WHERE Name <> 'Sample Account for Entitlements'];
Database.delete(accountList);

// Retrieve and delete the orphan Contacts
contactList = [SELECT Id FROM Contact WHERE IsDeleted = FALSE];
Database.delete(contactList);

// Retrieve and delete the related Sites
siteList = [SELECT Id FROM B2C_Site__c];
Database.delete(siteList);

// Retrieve and delete the related parent CustomerLists
customerLists = [SELECT Id FROM B2C_CustomerList__c];
Database.delete(customerLists);
