/**
 * @author Abraham David Lloyd
 * @date February 2nd, 2020
 *
 * @description This is a wrapper-class to enable the retrieval of all B2C Commerce Sites
 * via OCAPI.  It creates the initial stub-records for a B2C Commerce Instance representing the
 * CustomerLists and Sites being managed within the instance.
*/
public with sharing class B2CIAGetCustomerListsSites {

    /**
     * @see B2CIAGetAccessTokenResult
     * @description Invokable action to retrieve all site definitions from a B2C Commerce instance
     *
     * @param b2cInstanceRequestInputs {List<B2CIACreateCustomerListsSitesInput>} Represents the authToken and core request information to retrieve list / site details
     * @return {List<B2CIACreateCustomerListsSitesResult>} Returns the response object containing the customerList and site details for a given B2C Commerce instance
     */
    @InvocableMethod(Callout=true Label='B2C: Get B2C Instance CustomerLists and Sites' Description='Attempts to retrieve the CustomerLists and Sites managed by a B2C Instance')
    public static List<B2CIAGetCustomerListsSitesResult> getAllSites(List<B2CIAGetCustomerListsSitesInput> b2cInstanceRequestInputs) {

        // Initialize local variables
        JSONParse responseParsedJSON;
        List<B2CIAGetCustomerListsSitesResult> outputObj;
        B2CIAGetCustomerListsSitesResult requestResult;

        // Initialize the authToken properties
        Map<String, Object> authTokenResults;
        Boolean authTokenSuccess;
        String authTokenErrorMessage;
        String b2cAuthToken;

        // Initialize the request properties
        HttpRequest req;
        Http https;
        HttpResponse res;

        // Initialize the output object
        outputObj = new List<B2CIAGetCustomerListsSitesResult>();

        // Iterate over the collection of accessToken results
        for (B2CIAGetCustomerListsSitesInput thisB2CInstanceRequestInput : b2cInstanceRequestInputs) {

            // Initialize the request result
            requestResult = new B2CIAGetCustomerListsSitesResult();

            ////////////////////////////////////////////////////////////////////////
            // Perform the call-out to retrieve the customerLists / sites
            ////////////////////////////////////////////////////////////////////////

            // Generate the getSites request for the current B2C Instance
            req = B2CHttpRequestHelper.getAllSitesRequest(
                thisB2CInstanceRequestInput.b2cInstance.API_Url__c,
                thisB2CInstanceRequestInput.b2cAuthToken,
                thisB2CInstanceRequestInput.ocapiVersion
            );

            // Initialize the outbound http request handler and invoke the service request
            https = new Http();
            res = https.send(req);

            // Initialize the variable used to process the response
            responseParsedJSON = new JSONParse(res.getBody());

            // Seed the request-result properties
            requestResult.status = res.getStatus();
            requestResult.statusCode = res.getStatusCode();
            requestResult.isError = false;

            // Parse the REST body and format the output
            requestResult.responseBody = responseParsedJSON.toStringPretty();
            requestResult.b2cInstanceId = thisB2CInstanceRequestInput.b2cInstance.Id;

            // Was the request successful?
            if (requestResult.statusCode == 200) {

                // If so, then process the request details
                requestResult.totalRecords = responseParsedJSON.get('count').getIntegerValue();

                // Parse the site response and instantiate the working collections
                List<JSONParse> siteResultsDataObj = responseParsedJSON.get('data').asList();
                List<B2C_Site__c> siteList = new List<B2C_Site__c>();
                List<B2C_CustomerList__c> customerListList = new List<B2C_CustomerList__c>();

                // Loop over the collection of site-results
                for (JSONParse j : siteResultsDataObj) {

                    // Initialize the local loop-variables
                    B2C_Site__c site = new B2C_Site__c();
                    site.Name = j.get('id').getStringValue();
                    site.API_Url__c = j.get('link').getStringValue();
                    site.CustomerList_ID__c = j.get('customer_list_link').get('customer_list_id').getStringValue();
                    site.Storefront_Name__c = j.get('display_name').get('default').getStringValue();
                    siteList.add(site);

                    // Default the flag used to validate found customers
                    Boolean existingCustomerListFound = false;

                    // Loop over the collection of customerLists that were parsed
                    for (B2C_CustomerList__c cListI : customerListList) {

                        // Create a reference to the parsed customerList identifier
                        String parsedCustomerListID = j.get('customer_list_link')
                            .get('customer_list_id').getStringValue();

                        // Evaluate if the current customerList was found in the collection of parsed customerLists
                        if( existingCustomerListFound == false && cListI.CustomerList_ID__c == parsedCustomerListID) {
                            existingCustomerListFound = true;
                        }

                    }

                    // Was the current customerList found?
                    if (!existingCustomerListFound) {

                        // If not, then add the customerList to the output collection
                        B2C_CustomerList__c customerList = new B2C_CustomerList__c();
                        customerList.B2C_Instance__c = thisB2CInstanceRequestInput.b2cInstance.Id;
                        customerList.Name = j.get('customer_list_link').get('customer_list_id').getStringValue();
                        customerList.CustomerList_ID__c = j.get('customer_list_link').get('customer_list_id').getStringValue();
                        customerList.API_Url__c = j.get('customer_list_link').get('link').getStringValue();
                        customerListList.add( customerList );

                    }

                }

                // Append the parsing results to the output
                requestResult.b2cSiteList = siteList;
                requestResult.totalSiteRecords = siteList.size();
                requestResult.b2cCustomerListList = customerListList;
                requestResult.totalCustomerListRecords = customerListList.size();

            } else {

                // Otherwise, audit the error (the request could not process)
                requestResult.errorMessage = B2CConstant.ERRORS_OCAPI_NON200ERROROCCURRED;
                requestResult.isError = true;

            }

            // Add the requestResult to the output collection
            outputObj.add(requestResult);

        }

        // Return the output
        return outputObj;

    }

}
