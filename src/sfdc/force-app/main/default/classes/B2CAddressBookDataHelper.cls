/**
 * @author Abraham David Lloyd
 * @date May 12th, 2021
 *
 * @description This is a helper class designed to determine how to relate source records
 * to federated addressBook data.
*/
public with sharing class B2CAddressBookDataHelper {

    public static String getDataDomain() {

        // Initialize local variables
        String output;
        String accountContactModel;

        // Retrieve the default accountContact model
        accountContactModel = B2CConfigurationManager.getDefaultAccountContactModel();

        // Default the reference parentObject
        output = 'Contact';

        // Is PersonAccounts being leveraged as the CustomerModel
        if (accountContactModel == B2CConstant.AccountContactModel_Person) {

            // If so, call-out accounts as the customerModel
            output = 'Account';

        }

        // Return the output
        return output;

    }

    public static String getTargetField() {

        // Initialize local variables
        String output;
        String accountContactModel;

        // Retrieve the default accountContact model
        accountContactModel = B2CConfigurationManager.getDefaultAccountContactModel();

        // Default the reference field for Accounts / Contacts
        output = 'B2C_Customer_ID__c';

        // Is PersonAccounts being leveraged as the CustomerModel?
        if (accountContactModel == B2CConstant.AccountContactModel_Person) {

            // If so, call-out the customerNo as the reference field
            output = 'B2C_Customer_ID__pc';

        }

        // Return the output
        return output;

    }

}
