/**
 * @see B2CIACustomerResolution_Test
 * @description This class is used to create a common set of methods used to stand-up
 * test data for the B2CIACustomerResolution_Test class.
 */
public abstract with sharing class B2CIACustomerResolution_TestHelper {

    public static Contact createContact(Map<String, Object> contactMap) {

        // Initialize local variables
        Account thisAccount;
        Contact thisContact;
        String defaultContactModel;
        String accountRecordTypeDeveloperName;
        RecordType recordTypeToUse;

        // Retrieve the defaultContactModel from the configuration metaData
        defaultContactModel = B2CConfigurationManager.getDefaultAccountContactModel();
        accountRecordTypeDeveloperName = B2CConfigurationManager.getAccountRecordTypeDeveloperName();

        // Initialize the parent account to this contact
        thisAccount = (Account)TestDataFactory.createSObject('Account', new Map<String,Object>{
            'Name' => 'Unknown Customer',
            'RecordTypeId' => getRecordType(accountRecordTypeDeveloperName).Id
        });

        // Add the parent accountId to the map describing the contact to be created
        contactMap.put('accountId', thisAccount.Id);

        // Create the child contact record for this account
        thisContact = (Contact)TestDataFactory.createSObject('Contact', contactMap);

        // Override the developerName if we're employing personAccounts
        if (defaultContactModel == 'Person') {

            // Update the default recordType for the parent Account
            accountRecordTypeDeveloperName = 'PersonAccount';
            thisAccount.RecordTypeId = getRecordType(accountRecordTypeDeveloperName).Id;

        }

        // Return the child Contact record
        return thisContact;

    }

    /**
     * @description Helper function to retrieve the recordType for a given recordType's
     * developerName.  We use this to flip the recordType on an Account to convert it
     * from a Business Account to a PersonAccount.
     *
     * @param recordTypeDeveloperName {String} Represents the developerName used to
     * retrieve the recordType record to apply to account / contact creation
     * @return {RecordType} Represent the recordType retrieved via the SOQL query
     */
    public static RecordType getRecordType(String recordTypeDeveloperName) {

        // Initialize local variables
        RecordType output;

        // Retrieve the specified recordType using the developerName that is passed in
        output = [ SELECT Id, DeveloperName FROM RecordType WHERE DeveloperName = :recordTypeDeveloperName ];

        // Return the query results
        return output;

    }

}
