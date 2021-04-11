/**
 * @author Abraham David Lloyd
 * @date May 22th, 2020
 *
 * @description This is a test class that validates B2C Storefronts data can be retrieve
 * via custom meta-data.  The class validates that retrieval works -- as well as that
 * errors are thrown if no records are found.
 */
@IsTest
private class B2CStorefrontManager_Test {

    // Initialize constants used to drive / inform testing
    private static String metaDataMissingRecordExceptionName = B2CConstant.Errors_ExceptionName_DataRecordMissing;

    // Default the Ids used to identify storefronts
    private static String activeCustomerListId = 'RefArch_CustomerList_Active';
    private static String activeStorefrontId = 'RefArch_Active';
    private static String inActiveStorefrontId = 'RefArch_InActive';

    /**
     * @see B2CStorefrontManager.getStorefront
     * @description This method validates that storefront retrieval which fails throws
     * the expected meta-data missing record exception.
     */
    @IsTest
    static void testRetrieveInActiveStorefront() {

        // Initialize local variables
        B2C_Site__c storefront;
        B2C_Site__c testStorefront;
        String exceptionName;
        Boolean testResult;

        // Default local properties
        testResult = false;

        try {

            Test.startTest();

            // Create test-data to seed an active B2C Commerce Site
            testStorefront = (B2C_Site__c)TestDataFactory.createSObject('B2C_Site__c', new Map<String,Object>{
                'Name' => inActiveStorefrontId,
                'Is_Active__c' => false,
                'API_Url__c' => 'https://www.salesforce.com'
            });

            // Retrieve the Storefront via an identifier that does not exist (should throw an error)
            storefront = B2CStorefrontManager.getStorefront(testStorefront.Name);

            Test.stopTest();

        } catch (B2CMetaDataRecordMissingException e) {

            // Pull the name / type of the exception
            exceptionName = e.getTypeName();

            // Validate that the exception type
            if (exceptionName == metaDataMissingRecordExceptionName) { testResult = true; }

        }

        // Validate that the right exception was caught by the zero-record look-up
        System.assert(testResult, '--> Wrong Exception Thrown; Expected [' + metaDataMissingRecordExceptionName + '] and Caught [' + exceptionName + ']');

    }

    /**
     * @see B2CStorefrontManager.getStorefront
     * @description This method validates that we're able to successfully retrieve the details
     * of a storefront -- using the B2C Commerce storefront ID to retrieve it.
     */
    @IsTest
    static void testRetrieveActiveStorefront() {

        // Initialize local variables
        B2C_Site__c storefront;
        B2C_Site__c testStorefront;

        Test.startTest();

        // Create test-data to seed an active B2C Commerce Site
        testStorefront = (B2C_Site__c)TestDataFactory.createSObject('B2C_Site__c', new Map<String,Object>{
                'Name' => activeStorefrontId,
                'Is_Active__c' => true,
                'API_Url__c' => 'https://www.salesforce.com'
        });

        // Retrieve the Storefront via an identifier that does not exist (should throw an error)
        storefront = B2CStorefrontManager.getStorefront(testStorefront.Name);

        Test.stopTest();

        // Validate that at least one storefront was returned by the query
        System.assert(storefront != null, 'Expected at least one active storefront -- and found zero.  Please ensure test-data was created successfully.');

    }

    /**
     * @see B2CStorefrontManager.getStorefrontByCustomerListIdSiteId
     * @description This method validates that we are able to retrieve an
     * active storefront mapped to a CustomerList / SiteId pairing.
     */
    @IsTest
    static void testRetrieveActiveStorefrontByCustomerListIdSiteId() {

        // Initialize local variables
        B2C_Site__c storefront;
        B2C_CustomerList__c testCustomerList;
        B2C_Site__c testStorefront;

        Test.startTest();

        // Create test-data to seed an active B2C Commerce CustomerList
        testCustomerList = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
                'Name' => activeCustomerListId,
                'Is_Active__c' => true,
                'B2C_Instance__r.API_Url__c' => 'https://www.salesforce.com',
                'API_Url__c' => 'https://www.salesforce.com'
        });

        // Create test-data to seed an active B2C Commerce Site
        testStorefront = (B2C_Site__c)TestDataFactory.createSObject('B2C_Site__c', new Map<String,Object>{
                'Name' => activeStorefrontId,
                'Customer_List__c' => testCustomerList.Id,
                'Is_Active__c' => true,
                'API_Url__c' => 'https://www.salesforce.com'
        });

        // Retrieve the Storefront via an identifier that exists (should not throw an error)
        storefront = B2CStorefrontManager.getStorefrontByCustomerListIdSiteId(testCustomerList.Name, testStorefront.Name);

        Test.stopTest();

        // Validate that at least one storefront was returned by the query
        System.assert(storefront != null, 'Expected at least one active storefront -- and found zero.  Please ensure test-data was created successfully.');

    }

    /**
     * @see B2CStorefrontManager.getStorefrontById
     * @description This method validates that storefront retrieval is possible
     * when using the internal Salesforce Platform siteId
     */
    @IsTest
    static void testRetrieveActiveStorefrontById() {

        // Initialize local variables
        B2C_Site__c storefront;
        B2C_Site__c testStorefront;

        Test.startTest();

        // Create test-data to seed an active B2C Commerce Site
        testStorefront = (B2C_Site__c)TestDataFactory.createSObject('B2C_Site__c', new Map<String,Object>{
                'Name' => activeStorefrontId,
                'Is_Active__c' => true,
                'API_Url__c' => 'https://www.salesforce.com'
        });

        // Retrieve the Storefront via an identifier that exists
        storefront = B2CStorefrontManager.getStorefrontById(testStorefront.Id);

        Test.stopTest();

        // Validate that at least one storefront was returned by the query
        System.assert(storefront != null, 'Expected at least one active storefront -- and found zero.  Please ensure test-data was created successfully.');

    }

}