/**
 * @author Eric Schultz
 * @date April 28th, 2021
 *
 * @description This class helps identify relevant duplicates for a contact which can be
 * used to decide how to process updates or inserts
*/
//noinspection LongLine
public inherited sharing class B2CIACustomerResolution {

    /**
     * @description Invocable action to retrieve relevant contact duplicates for standard and person account models
     *
     * @param contactList{List<List<Contact>>} A list of contacts but is expected to have only 1 item.
     * This is to support use within Flow.
     * @return {List<B2CIACustomerResolutionResult>} Returns a list of list of contacts. This is expected to have
     * only 1 item in the main list to support use with Flow.
     */
    @InvocableMethod(Label='B2C: Customer Resolution' Description='Finds matching contacts based on B2C matching rules')
    public static List<B2CIACustomerResolutionResult> resolve(List<List<Contact>> contactList) {

        // Initialize local variables
        B2CIACustomerResolutionResult resolutionResults;
        List<B2CIACustomerResolutionResult> output;
        List<Contact> contactsToResolve;

        // Initialize the output variable
        output = new List<B2CIACustomerResolutionResult>();

        // Initialize the resolution results
        resolutionResults = new B2CIACustomerResolutionResult();
        resolutionResults.isError = false;

        // Was the sourceContact collection populated?
        if (contactList.size() == 0) {

            // If not, indicate an error occurred
            resolutionResults.isError = true;
            resolutionResults.errorMessage = 'No sourceContactCollection provided to B2CIACustomerResolution class.  ' +
                'Check your input and please try again.';

        } else {

            // Get access to the actual list of contact(s) to resolve
            contactsToResolve = contactList.get(0);

            // Was a contact found in the input parameter?
            if (contactsToResolve.size() == 0) {

                // If not, indicate an error occurred
                resolutionResults.isError = true;
                resolutionResults.errorMessage = 'No sourceContact provided to B2CIACustomerResolution class.  ' +
                    'Check your input and please try again.';

            } else {

                // Loop over the collection of contacts to resolve
                for (Contact c: contactsToResolve) {

                    try {

                        // Add the resolution results to the output class
                        resolutionResults.contactList = findDupes(c);

                    } catch (System.HandledException e) {

                        // Indicate that an error occurred
                        resolutionResults.isError = true;

                        // Capture the error message from the exception
                        resolutionResults.errorMessage = e.getMessage();

                    }

                    // Build the output variable with the processing results
                    output.add(resolutionResults);

                }

            }

        }

        // Return the output variable
        return output;

    }

    /**
     * @description Runs B2C duplicate rules, retrieve potential duplicates, and filter through a companion Flow
     *
     * @param pContact {Contact} A specific contact to run find duplicates on
     * @return {List<Contact>} The final list of contacts that exist that are relevant duplicates
     */
    public static List<Contact> findDupes(Contact pContact) {

        // Initialize local variables
        Contact contactToResolve;
        List<Contact> matchedContactRecords = new List<Contact>();
        List<Contact> duplicateContactRecords = new List<Contact>();
        List<Account> matchedAccountRecords = new List<Account>();
        String accountContactModel;

        // Make a copy of the contact passed-in
        contactToResolve = pContact.clone(true);

        // Has the lastName been defined?
        if (contactToResolve.LastName == null) {

            // Default the lastName if it's not set -- solely for the purpose of resolution
            contactToResolve.LastName = B2CConfigurationManager.getDefaultAccountContactNames().get('contactName');

        }

        // Retrieve the duplicate / related contacts driven by configured matchRules
        Datacloud.FindDuplicatesResult[] results = Datacloud.FindDuplicates.findDuplicates(
            new List<Contact>{contactToResolve}
        );

        //If so, iterate over them and start checking for potential matches
        for (Datacloud.FindDuplicatesResult fdrI : results) {

            System.debug(LoggingLevel.DEBUG, '--> Iterating Over DataCloud results (' + results.size() + ')');

            // find duplicates based on what was passed in
            for (Datacloud.DuplicateResult dupeResultI : fdrI.getDuplicateResults()) {

                System.debug(LoggingLevel.DEBUG, '--> Iterating over duplicateRule results');

                // Iterate over the collection of match / duplicate rules
                for (Datacloud.MatchResult matchResultI : dupeResultI.getMatchResults()) {

                    System.debug(LoggingLevel.DEBUG, '--> Iterating over MatchRule results');

                    // Create a reference to the current rule being processed
                    String matchRule = matchResultI.getRule();

                    System.debug(LoggingLevel.DEBUG, '--> MatchRule: ' + matchRule);
                    System.debug(LoggingLevel.DEBUG, '--> Matched RecordCount: ' + matchResultI.getMatchRecords().size());

                    // Instead of processing all rules, we only want to process B2C Commerce-specific rules
                    if (matchRule.contains('B2C') && matchResultI.getMatchRecords().size() > 0) {

                        // Loop over the collection of match records
                        for (Datacloud.MatchRecord dmrI : matchResultI.getMatchRecords()) {

                            // Capture the accountContactModel being leveraged
                            accountContactModel = B2C_CRMSync_Setting__mdt.getInstance(
                                'Default_Configuration').Account_Contact_Model__c;

                            // Are we using standard contact model and found contacts
                            if (
                                dmrI.getRecord().getSObjectType() == Schema.Contact.getSObjectType()
                                && accountContactModel != B2CConstant.ACCOUNTCONTACTMODEL_PERSON
                            ) {

                                // If so, add it to the Contact Collection
                                matchedContactRecords.add((Contact)dmrI.getRecord());

                            // Otherwise, did we find accounts and are using a person account model?
                            } else if (
                                dmrI.getRecord().getSObjectType() == Schema.Account.getSObjectType()
                                && accountContactModel == B2CConstant.ACCOUNTCONTACTMODEL_PERSON
                            ) {

                                // Add the record to the Account Collection
                                matchedAccountRecords.add((Account)dmrI.getRecord());

                            }

                        }

                    }

                }

            }

        }

        // Were any matchedResults found?
        if (!matchedAccountRecords.isEmpty()) {

            if (
                // Validate that we have access to the Contact object
                Contact.SObjectType.getDescribe().isAccessible() &&
                Schema.SObjectType.Contact.fields.Id.isAccessible()
            ) {

                // If so, then retrieve Contacts from the Account
                duplicateContactRecords = [
                    SELECT  Id
                    FROM    Contact
                    WHERE   AccountId IN :matchedAccountRecords
                ];

            }

        } else {

            // Otherwise, add the matched records to the duplicateCollection
            duplicateContactRecords.addAll( matchedContactRecords );

        }

        // Return the collection of contacts that matched the sourceContact
        // by leveraging our configured duplicate rules
        return new List<Contact>([
            SELECT  Id,
                    AccountId,
                    B2C_CustomerList__c,
                    B2C_CustomerList_ID__c,
                    B2C_Customer_ID__c,
                    B2C_Customer_No__c,
                    FirstName,
                    LastName,
                    Email,
                    B2C_UserName__c,
                    B2C_Disable_Integration__c,
                    B2C_Date_Last_Modified__c,
                    Audit_OCAPI_API_Response__c,
                    CreatedDate,
                    LastModifiedDate
            FROM    Contact
            WHERE   Id = :duplicateContactRecords
            ORDER
            BY      LastModifiedDate DESC
        ]);

    }

}
