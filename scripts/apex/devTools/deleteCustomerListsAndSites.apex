/**
 * This script is used to purge the exiting collection of B2C CustomerLists and
 * related Sites.
 */

// Initialize local variables
List<Account> accounts;
List<Contact> contacts;
List<B2C_CustomerList__c> customerLists;
List<B2C_Site__c> sites;

// Retrieve the collection of customerLists
customerLists = [
    SELECT  Id
    FROM    B2C_CustomerList__c
];

// Retrieve the collection of Sites
sites = [
    SELECT  Id
    FROM    B2C_Site__c
];

// Select the accounts associated to Contacts
accounts = [
    SELECT  Id
    FROM    Account
    WHERE   Id IN (
        SELECT  AccountId
        FROM    Contact
        WHERE   B2C_CustomerList__c IN :customerLists
    )
];

// Delete the related accounts first
Database.delete(accounts);

// Select the contacts associated to B2C CustomerLists
contacts = [
        SELECT  Id
        FROM    Contact
        WHERE   B2C_CustomerList__c IN :customerLists
];

// Delete the related contacts next
Database.delete(contacts);

// Delete the sites and customerLists
Database.delete(sites);
Database.delete(customerLists);

