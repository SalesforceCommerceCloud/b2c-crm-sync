/**
 * @see B2CIACustomerResolution_Test
 * @description This class is used to create a common set of methods used to stand-up
 * test data for the B2CIACustomerResolution_Test class.
 */
public abstract with sharing class B2CIACustomerResolution_TestHelper {

    public static void validateValidationError(Map<String, Object> flowResults) {

        // Initialize local variables
        List<Contact> contactResolvedList;
        List<Contact> contactFilteredList;
        Boolean flowIsSuccess;
        List<String> flowErrors;

        // Collect the flow results
        contactResolvedList = (List<Contact>) flowResults.get('contactResolvedList');
        contactFilteredList = (List<Contact>) flowResults.get('contactFilteredList');
        flowIsSuccess = (Boolean) flowResults.get('flowIsSuccess');
        flowErrors = (List<String>) flowResults.get('flowErrors');

        // Debugging: Output the test results
        System.debug('--> contactResolvedList: ' + contactResolvedList);
        System.debug('--> contactFilteredList: ' + contactFilteredList);
        System.debug('--> flowIsSuccess: ' + flowIsSuccess);
        System.debug('--> flowErrors: ' + flowErrors);

        // Assert that the resolution class and filterFlow return predictable results
        System.assertEquals(1, contactResolvedList.size(), 'Expected the customerResolution class to return one (1) record');
        System.assertEquals(null, contactFilteredList, 'Expected the filterMatches flow to return zero records; a match should not be found');
        System.assertEquals(false, flowIsSuccess, 'Expected the isSuccess flag to be set to false because a validation error occurred');
        System.assertEquals(1, flowErrors.size(), 'Expected the errors collection contain one (1) validation error');

    }

    public static void validateMultipleResults(Map<String, Object> flowResults) {

        // Initialize local variables
        List<Contact> contactResolvedList;
        List<Contact> contactFilteredList;
        Boolean flowIsSuccess;
        List<String> flowErrors;

        // Collect the flow results
        contactResolvedList = (List<Contact>) flowResults.get('contactResolvedList');
        contactFilteredList = (List<Contact>) flowResults.get('contactFilteredList');
        flowIsSuccess = (Boolean) flowResults.get('flowIsSuccess');
        flowErrors = (List<String>) flowResults.get('flowErrors');

        // Debugging: Output the test results
        System.debug('--> contactResolvedList: ' + contactResolvedList);
        System.debug('--> contactFilteredList: ' + contactFilteredList);
        System.debug('--> flowIsSuccess: ' + flowIsSuccess);
        System.debug('--> flowErrors: ' + flowErrors);

        // Assert that the resolution class and filterFlow return predictable results
        System.assert(contactResolvedList.size() > 0, 'Expected the customerResolution class to return at least one (1) record');
        System.assert(contactFilteredList.size() > 0, 'Expected the filterMatches flow to return at least one (1) record; duplicates are found');
        System.assertEquals(true, flowIsSuccess, 'Expected the isSuccess flag to be set to true');
        System.assertEquals(null, flowErrors, 'Expected the errors collection to be empty');

    }


    public static void validateZeroFilterResultsWithResolutionResultsFromMultiple(Map<String, Object> flowResults) {

        // Initialize local variables
        List<Contact> contactResolvedList;
        List<Contact> contactFilteredList;
        Boolean flowIsSuccess;
        List<String> flowErrors;

        // Collect the flow results
        contactResolvedList = (List<Contact>) flowResults.get('contactResolvedList');
        contactFilteredList = (List<Contact>) flowResults.get('contactFilteredList');
        flowIsSuccess = (Boolean) flowResults.get('flowIsSuccess');
        flowErrors = (List<String>) flowResults.get('flowErrors');

        // Debugging: Output the test results
        System.debug('--> contactResolvedList: ' + contactResolvedList);
        System.debug('--> contactFilteredList: ' + contactFilteredList);
        System.debug('--> flowIsSuccess: ' + flowIsSuccess);
        System.debug('--> flowErrors: ' + flowErrors);

        // Assert that the resolution class and filterFlow return predictable results
        System.assert(contactResolvedList.size() > 0, 'Expected the customerResolution class to return at least one (1) record');
        System.assertEquals(null, contactFilteredList, 'Expected the filterMatches flow to return zero records; a match should not be found');
        System.assertEquals(true, flowIsSuccess, 'Expected the isSuccess flag to be set to true');
        System.assertEquals(null, flowErrors, 'Expected the errors collection to be empty');

    }

    public static void validateZeroResultsFromMultiple(Map<String, Object> flowResults) {

        // Initialize local variables
        List<Contact> contactResolvedList;
        List<Contact> contactFilteredList;
        Boolean flowIsSuccess;
        List<String> flowErrors;

        // Collect the flow results
        contactResolvedList = (List<Contact>) flowResults.get('contactResolvedList');
        contactFilteredList = (List<Contact>) flowResults.get('contactFilteredList');
        flowIsSuccess = (Boolean) flowResults.get('flowIsSuccess');
        flowErrors = (List<String>) flowResults.get('flowErrors');

        // Debugging: Output the test results
        System.debug('--> contactResolvedList: ' + contactResolvedList);
        System.debug('--> contactFilteredList: ' + contactFilteredList);
        System.debug('--> flowIsSuccess: ' + flowIsSuccess);
        System.debug('--> flowErrors: ' + flowErrors);

        // Assert that the resolution class and filterFlow return predictable results
        System.assertEquals(0, contactResolvedList.size(), 'Expected the customerResolution class to return zero records');
        System.assertEquals(null, contactFilteredList, 'Expected the filterMatches flow to return zero records; a match should not be found');
        System.assertEquals(true, flowIsSuccess, 'Expected the isSuccess flag to be set to true');
        System.assertEquals(null, flowErrors, 'Expected the errors collection to be empty');

    }

    public static void validateSingleResult(Map<String, Object> flowResults, Contact contactToResolve) {

        // Initialize local variables
        List<Contact> contactResolvedList;
        List<Contact> contactFilteredList;
        Boolean flowIsSuccess;
        List<String> flowErrors;

        // Collect the flow results
        contactResolvedList = (List<Contact>) flowResults.get('contactResolvedList');
        contactFilteredList = (List<Contact>) flowResults.get('contactFilteredList');
        flowIsSuccess = (Boolean) flowResults.get('flowIsSuccess');
        flowErrors = (List<String>) flowResults.get('flowErrors');

        // Debugging: Output the test results
        System.debug('--> contactResolvedList: ' + contactResolvedList);
        System.debug('--> contactFilteredList: ' + contactFilteredList);
        System.debug('--> flowIsSuccess: ' + flowIsSuccess);
        System.debug('--> flowErrors: ' + flowErrors);

        // Assert that the resolution class and filterFlow return predictable results
        System.assert(contactResolvedList.size() > 0, 'Expected the customerResolution class to return at least one (1) record');
        System.assertEquals(true, flowIsSuccess, 'Expected the isSuccess flag to be set to true');
        System.assertEquals(null, flowErrors, 'Expected the errors collection to be empty');
        System.assertEquals(1, contactFilteredList.size(), 'Expected the filterMatches flow to return one (1) record; a match was found');
        System.assertEquals(contactFilteredList[0].Id, contactToResolve.Id, 'Expected the testContact and resolvedContact identifiers to match');

    }

    public static Map<String, Object> executeResolutionProcess(Contact testContact) {

        // Initialize local variables
        Flow.Interview contactFilterMatchFlow;
        List<List<Contact>> contactResolvedListContainer;
        List<Contact> contactFilteredList;
        List<Contact> contactResolvedList;
        Map<String, Object> contactFilterMap;
        Boolean flowIsSuccess;
        List<String> flowErrors;

        // Initialize the output variable
        Map<String, Object> output;

        // Initialize the output property
        output = new Map<String, Object>();

        // Retrieve the collection of resolved contacts
        contactResolvedListContainer = B2CIACustomerResolution.resolve(new List<Contact>{testContact});
        contactResolvedList = contactResolvedListContainer.get(0);

        // Build the filterMap
        contactFilterMap = new Map<String, Object>();
        contactFilterMap.put('Contact', testContact);
        contactFilterMap.put('ContactMatches', contactResolvedList);

        // Execute the filterMap flow attempt to resolve the specific contact identified
        contactFilterMatchFlow = Flow.Interview.createInterview('B2C_Commerce_Contact_Filter_Matches', contactFilterMap);

        // Initialize the flow and start it
        contactFilterMatchFlow.start();

        // Collect the flow results
        contactFilteredList = (List<Contact>) contactFilterMatchFlow.getVariableValue('ContactMatchesResult');

        // Capture the flow output variables
        flowIsSuccess = (Boolean) contactFilterMatchFlow.getVariableValue('isSuccess');
        flowErrors = (List<String>) contactFilterMatchFlow.getVariableValue('errors');

        // Build the output object
        output.put('contactResolvedList', contactResolvedList);
        output.put('contactFilteredList', contactFilteredList);
        output.put('flowIsSuccess', flowIsSuccess);
        output.put('flowErrors', flowErrors);

        // Return the output variable
        return output;

    }

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
