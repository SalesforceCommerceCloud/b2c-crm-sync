/**
 * @author Eric Schultz
 * @date April 28th, 2021
 *
 * @description This class helps identify relevant duplicates for a contact which can be used to decide how to process updates or inserts
*/

public inherited sharing class B2CIACustomerResolution {

    /**
     * @description Runs B2C duplicate rules, retrieve potential duplicates, and filter through a companion Flow
     *
     * @param pContact {Contact} A specific contact to run find duplicates on
     * @returns {List<Contact>} The final list of contacts that exist that are relevant duplicates
     */
    public static List<Contact> findDupes(
        Contact pContact
    ) {

        List<Contact> matchedContactRecords = new List<Contact>();
        List<Contact> duplicateContactRecords = new List<Contact>();
        List<Account> matchedAccountRecords = new List<Account>();

        Datacloud.FindDuplicatesResult[] results = Datacloud.FindDuplicates.findDuplicates( new List<Contact>{ pContact } );

        //If so, iterate over them and start checking for potential matches
        for ( Datacloud.FindDuplicatesResult fdr_i : results ) {

            // find duplicates based on what was passed in
            for (Datacloud.DuplicateResult dupeResult_i : fdr_i.getDuplicateResults()) {

                // Iterate over the collection of match / duplicate rules
                for (Datacloud.MatchResult matchResult_i : dupeResult_i.getMatchResults()) {

                    // Create a reference to the current rule being processed
                    String matchRule = matchResult_i.getRule();

                    System.debug('--> MatchRule: ' + matchRule);
                    System.debug('--> Matched RecordCount: ' + matchResult_i.getMatchRecords().size());

                    // Instead of processing all rules, we only want to process B2C Commerce-specific rules
                    if (matchRule.contains('B2C') && matchResult_i.getMatchRecords().size() > 0) {

                        // Loop over the collection of match records
                        for (Datacloud.MatchRecord dmr_i : matchResult_i.getMatchRecords()) {

                            // Are we using standard contact model and found contacts
                            if (
                                    dmr_i.getRecord().getSObjectType() == Schema.Contact.getSObjectType()
                                &&  B2C_CRMSync_Setting__mdt.getInstance('Default_Configuration').Account_Contact_Model__c != 'Person'
                            ) {

                                // If so, add it to the Contact Collection
                                matchedContactRecords.add((Contact)dmr_i.getRecord());

                            // Otherwise, did we find accounts and are using a person account model?
                            } else if (
                                    dmr_i.getRecord().getSObjectType() == Schema.Account.getSObjectType()
                                &&  B2C_CRMSync_Setting__mdt.getInstance('Default_Configuration').Account_Contact_Model__c == 'Person'
                            ) {

                                // Add the record to the Account Collection
                                matchedAccountRecords.add((Account)dmr_i.getRecord());
                            }
                        }
                    }
                }
            }
        }

        if( !matchedAccountRecords.isEmpty() ){

            // If so, then retrieve Contacts from the Account
            duplicateContactRecords = [
                SELECT  Id
                FROM    Contact
                WHERE   AccountId IN :matchedAccountRecords
            ];

        }else{

            duplicateContactRecords.addAll( matchedContactRecords );
        }

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
                    B2C_Disable_Integration__c
            FROM    Contact
            WHERE   Id = :duplicateContactRecords
            ORDER BY
                    LastModifiedDate DESC
        ]);

    }

    /**
     * @description Invokable action to retrieve relevant contact duplicates for standard and person account models
     *
     * @param contactList {List<Contact>} A list of contacts but is expected to have only 1 item. This is to support use within Flow.
     * @returns {List<List<Contact>>} Returns a list of list of contacts. This is expected to have only 1 item in the main list to support use with Flow.
     */
    @InvocableMethod(Label='B2C: Customer Resolution' Description='Finds matching contacts based on B2C matching rules')
    public static List<List<Contact>> resolve(List<Contact> contactList) {

        List<List<Contact>> contactListList = new List<List<Contact>>();
        Map<String, String> defaultNames;

        if (contactList.size() != 1) {

            //throw error

        } else {

            Contact c = contactList[0];

            if (c.LastName == null &&
                c.Id == null &&
                c.B2C_Customer_ID__c == null &&
                c.B2C_Customer_No__c == null &&
                c.Email != null
            ) {
                defaultNames = B2CConfigurationManager.getDefaultAccountContactNames();
                // If so, then default the lastName to the default contactName
                c.LastName = defaultNames.get('contactName');
            }

            contactListList.add(findDupes( c ));

        }

        return contactListList;

    }
}
