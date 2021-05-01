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
    @InvocableMethod(Label='B2C: Get B2C Instance CustomerLists and Sites' Description='Attempts to retrieve the CustomerLists and Sites managed by a B2C Instance')
    public static List<B2CIAGetCustomerListsSitesResult> getAllSites(List<B2CIAGetCustomerListsSitesInput> b2cInstanceRequestInputs) {

        // Initialize local variables
        JSONParse responseParsedJSON;
        List<B2CIAGetCustomerListsSitesResult> outputObj;
        B2CIAGetCustomerListsSitesResult requestResult;

        // Initialize the request properties
        HttpRequest req;
        Http https;
        HttpResponse res;

        // Initialize the output object
        outputObj = new List<B2CIAGetCustomerListsSitesResult>();

        // Iterate over the collection of accessToken results
        for (B2CIAGetCustomerListsSitesInput thisB2CInstanceRequestInput : b2cInstanceRequestInputs) {

            // Generate the getSites request for the current B2C Instance
            req = B2CHttpRequestHelper.getAllSitesRequest(
                thisB2CInstanceRequestInput.namedCredential,
                thisB2CInstanceRequestInput.OCAPIVersion
            );

            // Initialize the outbound http request handler and invoke the service request
            https = new Http();
            res = https.send(req);

            // Initialize the site result object
            requestResult = new B2CIAGetCustomerListsSitesResult();

            // Initialize the variable used to process the response
            responseParsedJSON = new JSONParse(res.getBody());

            // Seed the request-result properties
            requestResult.status = res.getStatus();
            requestResult.statusCode = res.getStatusCode();
            requestResult.isError = false;

            // Parse the REST body and format the output
            requestResult.responseBody = responseParsedJSON.toStringPretty();

            // Anchor to the current B2C Instance being processed
            requestResult.b2cInstanceId = thisB2CInstanceRequestInput.b2cInstanceId;

            // Was an error found?
            if (requestResult.statusCode == 200) {

                // If not, track the other required fields
                requestResult.totalRecords = responseParsedJSON.get('count').getIntegerValue();


                List<JSONParse> siteResultsDataObj = responseParsedJSON.get('data').asList();
                List<B2C_Site__c> siteList = new List<B2C_Site__c>();
                List<B2C_CustomerList__c> customerListList = new List<B2C_CustomerList__c>();

                for( JSONParse j : siteResultsDataObj ){
                    B2C_Site__c site = new B2C_Site__c();
                    site.Name = j.get('id').getStringValue();
                    site.API_Url__c = j.get('link').getStringValue();
                    site.CustomerList_ID__c = j.get('customer_list_link').get('customer_list_id').getStringValue();
                    site.Storefront_Name__c = j.get('display_name').get('default').getStringValue();
                    siteList.add( site );

                    Boolean existingCustomerListFound = false;

                    for( B2C_CustomerList__c c_i : customerListList ){

                        if( existingCustomerListFound == false &&
                            c_i.CustomerList_ID__c == j.get('customer_list_link').get('customer_list_id').getStringValue()
                        ){
                            existingCustomerListFound = true;
                        }
                    }

                    if( !existingCustomerListFound ){
                        B2C_CustomerList__c customerList = new B2C_CustomerList__c();
                        customerList.B2C_Instance__c = thisB2CInstanceRequestInput.b2cInstanceId;
                        customerList.Name = j.get('customer_list_link').get('customer_list_id').getStringValue();
                        customerList.CustomerList_ID__c = j.get('customer_list_link').get('customer_list_id').getStringValue();
                        customerList.API_Url__c = j.get('customer_list_link').get('link').getStringValue();
                        customerListList.add( customerList );
                    }
                }

                requestResult.b2cSiteList = siteList;
                requestResult.totalSiteRecords = siteList.size();
                requestResult.b2cCustomerListList = customerListList;
                requestResult.totalCustomerListRecords = customerListList.size();

            } else {

                // Otherwise, audit the error
                requestResult.errorMessage = B2CConstant.Errors_OCAPI_Non200ErrorOccurred;
                requestResult.isError = true;

            }

            // Add the requestResult to the output collection
            outputObj.add(requestResult);

        }

        // Return the output
        return outputObj;

    }

}
