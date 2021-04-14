/**
 * @author Abraham David Lloyd
 * @date February 4th, 2021
 *
 * @description This is a wrapper-class to enable the retrieval of a specific
 * B2C Commerce Site via OCAPI.
*/
public with sharing class B2CIAGetCustomerProfile {

    /**
     * @see B2CIAGetAccessTokenResult
     * @description Invokable action to retrieve a Customer Profile from B2C Commerce
     *
     * @param requestArguments {List<B2CIAGetCustomerProfileInput>} Represents the request arguments to process
     * @returns {List<B2CIAGetCustomerProfileResult>} Returns the response object containing the customer details
     */
    @InvocableMethod(Label='B2C: Get Customer Profile' Description='Attempts to retrieve details for a B2C Commerce Customer Profile')
    public static List<B2CIAGetCustomerProfileResult> getCustomerProfile(List<B2CIAGetCustomerProfileInput> requestArguments) {

        // Initialize local variables
        JSONParse parsedJSON;
        List<B2CIAGetCustomerProfileResult> output;
        B2CIAGetCustomerProfileResult customerProfileResult;

        // Initialize the request properties
        HttpRequest req;
        Http https;
        HttpResponse res;

        // Initialize the output variable
        output = new List<B2CIAGetCustomerProfileResult>();

        // Loop over the collection of site details
        for (B2CIAGetCustomerProfileInput requestInput: requestArguments) {

            // Build the request object utilizing the input properties
            req = B2CHttpRequestHelper.getCustomerProfileRequest(requestInput.apiUrl, requestInput.apiVersion, requestInput.accessToken, requestInput.b2cCustomerListId, requestInput.b2cCustomerNo);
            https = new Http();
            res = https.send(req);

            // Initialize the customerResult container
            customerProfileResult = new B2CIAGetCustomerProfileResult();

            // Seed the CRM and B2C versions of the site identifiers
            // These identifiers are used to process future updates to each
            // site record managed by the Salesforce Platform
            customerProfileResult.crmCustomerListId = requestInput.crmCustomerListId;
            customerProfileResult.crmContactId = requestInput.crmContactId;
            customerProfileResult.b2cCustomerListId = requestInput.b2cCustomerListId;
            customerProfileResult.b2cCustomerId = requestInput.b2cCustomerId;
            customerProfileResult.b2cCustomerNo = requestInput.b2cCustomerNo;

            // Parse the JSON so that we can format the body content
            parsedJSON = new JSONParse(res.getBody());

            // Seed the default properties of the resultObject
            customerProfileResult.status = res.getStatus();
            customerProfileResult.statusCode = res.getStatusCode();
            customerProfileResult.responseBody = parsedJSON.toStringPretty();

            // Check if the statusCode is found in the response and the response was processed successfully
            if (customerProfileResult.statusCode == 200) {
                customerProfileResult.isError = false;

            } else {
                // Otherwise, capture the error message
                customerProfileResult.errorMessage = B2CConstant.Errors_OCAPI_Non200ErrorOccurred;
                customerProfileResult.isError = true;

            }

            // Add the result to the output
            output.add(customerProfileResult);

        }

        // Return the output collection
        return output;

    }

}