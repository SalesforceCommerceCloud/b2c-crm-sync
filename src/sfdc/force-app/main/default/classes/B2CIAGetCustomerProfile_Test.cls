/**
 * @author Sandra Golden
 * @date April 14th, 2021
 *
 * @description Test class for B2CIAGetCustomerProfile
*/
@IsTest
private class B2CIAGetCustomerProfile_Test {
    @IsTest
    static void testB2CIAGetCustomerProfileSuccess() {

        // Initialize local variables
        B2CIAGetCustomerProfileResult customerProfileResult = new B2CIAGetCustomerProfileResult();
        String failureMsg;

        Test.startTest();

        // Set the https mock service call
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerDetailsSuccess'));

        // issue get customer profile web service call
        B2CIAGetCustomerProfileInput requestInput = new B2CIAGetCustomerProfileInput();
        List<B2CIAGetCustomerProfileInput> requestArguments = new List<B2CIAGetCustomerProfileInput>{requestInput};
        //requestArguments.add(requestInput);
        List<B2CIAGetCustomerProfileResult> customerProfileResults = B2CIAGetCustomerProfile.getCustomerProfile(requestArguments);

        Test.stopTest();

        if (customerProfileResults.size() > 0) {
            customerProfileResult = customerProfileResults[0];
        }

        // Check if the statusCode is found in the response and the response was processed successfully
        if (customerProfileResult.statusCode == 200) {
            customerProfileResult.isError = false;
        } else {
            customerProfileResult.isError = true;

        }

        // Initialize the failure message to display if no error was caught
        failureMsg = 'Error: an error was caught; expected no error to be included in the response';

        // Assert that an error was caught and alert the user if none was
        System.assert(customerProfileResult.isError == false, failureMsg);

    }

    @IsTest
    static void testB2CIAGetCustomerProfileFailure() {

        // Initialize local variables
        B2CIAGetCustomerProfileResult customerProfileResult = new B2CIAGetCustomerProfileResult();
        String failureMsg;

        Test.startTest();

        // Set the https mock service call
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerDetailsFailure'));

        // issue get customer profile web service call
        B2CIAGetCustomerProfileInput requestInput = new B2CIAGetCustomerProfileInput();
        List<B2CIAGetCustomerProfileInput> requestArguments = new List<B2CIAGetCustomerProfileInput>{requestInput};
        //requestArguments.add(requestInput);
        List<B2CIAGetCustomerProfileResult> customerProfileResults = B2CIAGetCustomerProfile.getCustomerProfile(requestArguments);

        Test.stopTest();

        if (customerProfileResults.size() > 0) {
            customerProfileResult = customerProfileResults[0];
        }

        // Check if the statusCode is found in the response and the response was processed successfully
        if (customerProfileResult.statusCode == 200) {
            customerProfileResult.isError = false;
        } else {
            customerProfileResult.isError = true;
        }

        // Initialize the failure message to display if no error was caught
        failureMsg = 'Error: No error was caught; expected an error code to be included in the response';

        // Assert that an error was caught and alert the user if none was
        System.assert(customerProfileResult.isError == true, failureMsg);

    }
}
