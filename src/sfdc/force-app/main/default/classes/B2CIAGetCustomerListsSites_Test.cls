/**
 * @author Eric Schultz
 * @date Feb 6, 2020
 *
 * @description This class is used to exercise the retrieval of CustomerLists and sites.
 */
@IsTest
private class B2CIAGetCustomerListsSites_Test {

    @IsTest
    static void testIsSuccess() {

        // Initialize the result set
        List<B2CIAGetCustomerListsSitesResult> resultsList = new List<B2CIAGetCustomerListsSitesResult>();

        // Create a default instance for processing
        B2C_Instance__c i = new B2C_Instance__c(
            API_Url__c = 'https://www.salesfor.com'
        );
        Database.insert( i );

        Test.startTest();

            // Setup the success scenario mock-request
            Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerListsSitesSuccess'));

            // Initialize the caller / request arguments
            B2CIAGetCustomerListsSitesInput req = new B2CIAGetCustomerListsSitesInput();

            // Default the request arguments
            req.b2cInstance = i;
            req.OCAPIVersion = 'version';

            // Execute the request and get the results
            resultsList = B2CIAGetCustomerListsSites.getAllSites(
                new List<B2CIAGetCustomerListsSitesInput>{
                    req
                }
            );

        Test.stopTest();

        // Validate that the request was processed successfully
        System.assertEquals(resultsList[0].statusCode, 200, 'Expected a statusCode of 200 to be returned');
        System.assertEquals(resultsList.size() > 0, true, 'Expected multiple site definitions to be returned');
        System.assertEquals(resultsList[0].totalRecords == 2, true, 'Expected a total of two (2) records to be defined');

    }


    @IsTest
    static void testIsFailure() {

        // Initialize the result set
        List<B2CIAGetCustomerListsSitesResult> resultsList = new List<B2CIAGetCustomerListsSitesResult>();

        // Create a default instance for processing
        B2C_Instance__c i = new B2C_Instance__c(
            API_Url__c = 'https://www.salesfor.com'
        );
        Database.insert( i );

        Test.startTest();

            // Setup the success scenario mock-request
            Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerListsSitesFailure'));

            // Initialize the caller / request arguments
            B2CIAGetCustomerListsSitesInput req = new B2CIAGetCustomerListsSitesInput();

            // Default the request arguments
            req.b2cInstance = i;
            req.OCAPIVersion = 'version';

            // Execute the request and get the results
            resultsList = B2CIAGetCustomerListsSites.getAllSites(
                new List<B2CIAGetCustomerListsSitesInput>{
                    req
                }
            );

        Test.stopTest();

        // Validate that the request was processed successfully -- but caught an error
        System.assertEquals(resultsList[0].statusCode, 404, 'Expected a statusCode of 404 to be returned');

    }


}
