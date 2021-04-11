/**
 * @author Abraham David Lloyd
 * @date May 22th, 2020
 *
 * @description This is a test class that validates B2C Customer List data can be retrieve
 * via custom meta-data.  The class validates that retrieval works -- as well as that
 * errors are thrown if no records are found.
 */
@IsTest
private class B2CCustomerListManager_Test {

    // Initialize constants used to drive / inform testing
    private static String metaDataMissingRecordExceptionName = B2CConstant.Errors_ExceptionName_DataRecordMissing;

    // Default the Ids used to identify customerLists
    private static String activeCustomerListId = 'RefArch_Active';
    private static String inActiveCustomerListId = 'RefArch_InActive';

    /**
     * @see B2CCustomerListManager.getCustomerList
     * @description This method validates that we're able to successfully retrieve the details
     * of a customer list -- using the B2C Commerce Customer List ID to retrieve it.
     */
    @IsTest
    static void testRetrieveActiveCustomerListByCustomerListId() {

        // Initialize local variables
        B2C_CustomerList__c testCustomerList;
        B2C_CustomerList__c activeCustomerList;

        Test.startTest();
        
        // Create test-data to seed an active B2C Commerce CustomerList
        activeCustomerList = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
            'Name' => activeCustomerListId,
            'Is_Active__c' => true,
            'API_Url__c' => 'https://www.salesforce.com',
            'B2C_Instance__r.API_Url__c' => 'https://www.salesforce.com'
        });

        // Attempt to retrieve the customerList via the customerListManager
        testCustomerList = B2CCustomerListManager.getCustomerList(activeCustomerList.Name);

        Test.stopTest();

        // Validate that the storefront was successfully retrieved by the getStorefront() method
        System.assert(testCustomerList != null, '-->  No active customerList was found; expected an active storefront mapped to customerListId [' + activeCustomerList.Id + '].');

    }


    /**
     * @see B2CCustomerListManager.getCustomerList
     * @description This method validates that we throw an error when we attempt to
     * retrieve the details of an inactive customerList -- using the B2C Commerce
     * customerListId to retrieve it.
     */
    @IsTest
    static void testRetrieveInActiveCustomerListByCustomerListId() {

        // Initialize local variables
        B2C_CustomerList__c testCustomerList;
        B2C_CustomerList__c inActiveCustomerList;
        String exceptionName;
        Boolean testResult;

        // Default the test result
        testResult = false;

        try {

            Test.startTest();

            // Create test-data to seed an inActive B2C Commerce CustomerList
            inActiveCustomerList = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
                'Name' => inActiveCustomerListId,
                'Is_Active__c' => false,
                'API_Url__c' => 'https://www.salesforce.com',
                'B2C_Instance__r.API_Url__c' => 'https://www.salesforce.com'
            });

            // Retrieve the details of a customerList that is in-active (should throw an error)
            testCustomerList = B2CCustomerListManager.getCustomerList(inActiveCustomerList.Name);

            Test.stopTest();

        } catch (B2CMetaDataRecordMissingException e) {

            // Pull the name / type of the exception
            exceptionName = e.getTypeName();

            // Validate that the exception type
            if (exceptionName == metaDataMissingRecordExceptionName) { testResult = true; }

        }

        // Validate that the right exception was caught by the in-active record look-up
        System.assert(testResult, '--> Wrong Exception Thrown; Expected [' + metaDataMissingRecordExceptionName + '] and Caught [' + exceptionName + ']');

    }

}