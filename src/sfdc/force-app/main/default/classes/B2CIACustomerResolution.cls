public inherited sharing class B2CIACustomerResolution {

    /**
     * @description Helper function used to pre-process Contacts to be resolved, and ensure that
     * contacts that do not have a lastName are provided a default one -- IF no identifiers are provided.
     * This should only occur where a customerList, Email, and lastName are provided.
     * @param contactListList {List<List<Contact>>} Represents the super-set of contacts being processed
     * @return {List<Contact>} Returns a pre-processed collection of Contacts that are ready for resolution
     */
    public static List<Contact> preProcessContactsToResolve(List<List<Contact>> contactListList) {

        // Initialize local variables
        Map<String, String> defaultNames;
        List<Contact> sourceContacts;
        List<Contact> contactsToResolve;

        // Initialize the output list
        contactsToResolve = new List<Contact>();
        sourceContacts = contactListList[0];

        // Retrieve the default names to use when creating Accounts / Contacts
        defaultNames = B2CConfigurationManager.getDefaultAccountContactNames();

        // Loop over the collection of sourceContacts
        for (Contact thisSourceContact : sourceContacts) {

            // Check if an email and customerList are the only identifiers provided
            if (thisSourceContact.LastName == null &&
                thisSourceContact.Id == null &&
                thisSourceContact.B2C_Customer_ID__c == null &&
                thisSourceContact.B2C_Customer_No__c == null &&
                thisSourceContact.Email != null
            ) {

                // If so, then default the lastName to the default contactName
                thisSourceContact.LastName = defaultNames.get('contactName');

            }

            // Add the current contact to the collection to resolve
            contactsToResolve.add(thisSourceContact);

        }

        // Return the collection of contacts to resolve
        return contactsToResolve;

    }

    @InvocableMethod(Label='B2C: Customer Resolution' Description='Finds matching contacts based on B2C matching rules')
    public static List<List<Contact>> resolve(List<List<Contact>> contactListList) {

        // Initialize local variables
        List<Contact> contactMatchResult = new List<Contact>();
        List<Contact> contactsToResolve;

        // Create a reference to the contact being resolved
        contactsToResolve = preProcessContactsToResolve(contactListList);

        // Find duplicates for all contacts passed in; we are passing everything in, so we get the same order back
        Datacloud.FindDuplicatesResult[] results = Datacloud.FindDuplicates.findDuplicates( contactsToResolve );

        System.debug('--> Total results: ' + results.size());

        // Were any duplicates found?
        if (results.size() > 0) {

            //If so, iterate over them and start checking for potential matches
            for (Integer j=0; j<results.size(); j++) {

                // Default the matchFlag to false for each loop
                Boolean matchFound = false;

                // If there is not an existing contact id, find duplicates based on what was passed in
                for (Datacloud.DuplicateResult dupeResult_i : results[j].getDuplicateResults()) {

                    // Only iterate if a match was not found yet
                    if (!matchFound) {

                        // Iterate over the collection of match / duplicate rules
                        for (Datacloud.MatchResult matchResult_i : dupeResult_i.getMatchResults()) {

                            // Create a reference to the current rule being processed
                            String matchRule = matchResult_i.getRule();

                            System.debug('--> MatchRule: ' + matchRule);
                            System.debug('--> Matched RecordCount: ' + matchResult_i.getMatchRecords().size());

                            // Instead of processing all rules, we only want to process B2C Commerce-specific rules
                            if (matchRule.contains('B2C') && matchResult_i.getMatchRecords().size() > 0) {

                                // Initialize the collections used to track results
                                List<Contact> matchedContactRecords = new List<Contact>();
                                List<Account> matchedAccountRecords = new List<Account>();
                                List<Contact> contactsToMatch = new List<Contact>();

                                // Remember; this is object agnostic; we want to track if results are
                                // driven by Contacts or PersonAccounts so we can retrieve related records
                                Boolean isPersonAccount = false;

                                // Loop over the collection of match records
                                for (Datacloud.MatchRecord dmr_i : matchResult_i.getMatchRecords()) {

                                    // Is this a Contact?
                                    if (dmr_i.getRecord().getSObjectType() == Schema.Contact.getSObjectType()) {

                                        // If so, add it to the Contact Collection
                                        matchedContactRecords.add((Contact)dmr_i.getRecord());

                                    // Otherwise, is this match-result being evaluated an Account?
                                    } else if (dmr_i.getRecord().getSObjectType() == Schema.Account.getSObjectType()) {

                                        // If so, flag this as a personAccount
                                        isPersonAccount = true;

                                        // Add the record to the Account Collection
                                        matchedAccountRecords.add((Account)dmr_i.getRecord());

                                    }

                                }

                                // Initialize our working map for the winner-picker flow
                                Map<String, Object> myMap = new Map<String, Object>();

                                // Are we dealing with personAccounts?
                                if( isPersonAccount ){

                                    // If so, then retrieve Contacts from the Account
                                    contactsToMatch = [
                                        SELECT  Id
                                        FROM    Contact
                                        WHERE   AccountId IN :matchedAccountRecords
                                    ];

                                } else {

                                    // Otherwise, retrieve Contacts directly
                                    contactsToMatch = [
                                        SELECT  Id
                                        FROM    Contact
                                        WHERE   Id = :matchedContactRecords
                                    ];

                                }

                                System.debug(' -->' + contactsToMatch);

                                // Add the contact being processed to the map
                                myMap.put(
                                    'Contact',
                                    contactListList[0][j]
                                );

                                // And include the matchResults for the flow
                                myMap.put(
                                    'ContactMatches',
                                    [
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
                                        WHERE   Id = :contactsToMatch
                                        ORDER BY
                                                LastModifiedDate DESC
                                    ]
                                );

                                // Otherwise, attempt to pick a winner from the collection of match results
                                // We're executing a flow to take the super-set of match results and pick a winner
                                Flow.Interview.B2C_Contact_Winning_Match contactMatchFlow = new Flow.Interview.B2C_Contact_Winning_Match(myMap);

                                // Invoke the flow
                                contactMatchFlow.start();

                                // Check the returnResults on the flow to see if a match was found
                                matchFound = (Boolean)contactMatchFlow.getVariableValue('MatchFound');

                                // If so, then set the output properties
                                if (matchFound) {

                                    // Add the match to the overall matchResults
                                    contactMatchResult.add((Contact)contactMatchFlow.getVariableValue('ContactMatched'));

                                    // Flag that a match was found
                                    matchFound = true;

                                }
                            }
                        }
                    }
                }

                // Default a contact if no match is found
                if(!matchFound){ contactMatchResult.add(new Contact()); }

            }

        }

        // Return the matchResults as defined by the winner-picker flow
        return new List<List<Contact>>{
            contactMatchResult
        };

    }

}
