/**
 * @author Abraham David Lloyd
 * @date May 10th, 2020
 *
 * @description This is a helper class for test cases that generates mocks
 * for web-service based unit tests.  It generates the mock success and
 * failure http responses for B2C API Interactions.
*/
@IsTest
public class B2CHttpTestCalloutMockGenerator implements HttpCalloutMock {

    // Initialize local variables
    private Map<String, String> responseObj;
    private String requestType;

    /**
     * @description Over-ridden constructor for the mock-generator.  This version
     * allows the requestType to be specified via method arguments
     *
     * @param reqType {String} describes the type of API-request being tested
     */
    public B2CHttpTestCalloutMockGenerator(String reqType){
        this.requestType = reqType;
    }

    /**
     * @description Http-response generator for B2C Commerce REST API mock calls.
     * Accepts an http-request and provides a mock http-response in return.
     *
     * @param req {HttpRequest} Represents the http-request being made
     * @return HttpResponse Returns a mock http-response
     */
    public HttpResponse respond(HttpRequest req) {

        // Initialize local variables
        HttpResponse res;

        // First, evaluate if we're testing the access-token related requests
        if (this.requestType.equalsIgnoreCase('AccessToken')) {
            responseObj = getAccessTokenSuccessResponse();
        }

        // Next, evaluate if we're testing the access-token failure scenario
        if (this.requestType.equalsIgnoreCase('AccessTokenFailure')) {
            responseObj = getAccessTokenFailureResponse();
        }

        // Next, evaluate if we're testing the customer-list success scenarios
        if (this.requestType.equalsIgnoreCase('CustomerListSuccess')) {
            responseObj = getCustomerListSuccessResponse();
        }

        // Next, evaluate if we're testing the customer-list failure scenarios
        if (this.requestType.equalsIgnoreCase('CustomerListFailure')) {
            responseObj = getCustomerListFailureResponse();
        }

        // Next, evaluate if we're testing the get customer profile success scenarios
        if (this.requestType.equalsIgnoreCase('CustomerDetailsSuccess')) {
            responseObj = getCustomerDetailsSuccessResponse();
        }

        // Next, evaluate if we're testing the get customer profile failure scenarios
        if (this.requestType.equalsIgnoreCase('CustomerDetailsFailure')) {
            responseObj = getCustomerDetailsFailureResponse();
        }

        // Evaluate if testing customer auth for oobo
        if (this.requestType.equalsIgnoreCase('CustomerAuth')) {

            HttpResponse resCustomerAuth = new HttpResponse();
            resCustomerAuth.setHeader('Content-Type', 'application/json');
            resCustomerAuth.setHeader('authorization', 'authorizationtoken');
            resCustomerAuth.setBody('{}');

            // Set the status details
            resCustomerAuth.setStatus('OK');
            resCustomerAuth.setStatusCode(200);

            // Return the response object
            return resCustomerAuth;

        }

        if (this.requestType.equalsIgnoreCase('BusinessManager')) {
            responseObj = getAccessTokenSuccessResponse();
        }

        // Evaluate if testing getting a business manager token for oobo
        if (this.requestType.equalsIgnoreCase('CustomerListsSites')) {
            responseObj = getCustomerListSuccessResponse();
            responseObj.put(
                'body',
                '{"count":"10","data":[{"id":"id","link":"link","customer_list_link":{"customer_list_id":"customer_list_id","link":"link"},"display_name":{"default":"default"}}]}'
            );
        }



        // Retrieve the default http response
        res = buildMockHttpResponse(responseObj);

        // Return the mock response
        return res;

    }


    /**
     * @description Helper function to return the access token response
     * code and body-content details.  This models the successful access
     * token response B2C Commerce environments provide.
     *
     * @return Map<String, String> Returns a map containing the
     * successful response attributes
     */
    public static Map<String, String> getAccessTokenSuccessResponse() {

        // Initialize local variables
        Map<String, String> responseObj;
        String bodyContent;
        String accessToken;

        // Initialize the access token
        accessToken = 'bf1d02e3-9477-436b-84e1-15868daa7984';

        // Initialize the body content string to be attached to mock response
        bodyContent = '{"access_token": "' + accessToken + '", "expires_in": 899, "token_type": "Bearer" }';

        // Initialize the mock response
        responseObj = new Map<String, String>();

        // Seed the mock-response details
        responseObj.put('status', 'OK');
        responseObj.put('statusCode', '200');
        responseObj.put('body', bodyContent);

        // Return the mock response details
        return responseObj;

    }

    /**
      * @description Helper function to return the access token failure response
      * code and body-content details.  This models the failed access token
      * response B2C Commerce environments provide (ex. client credentials are wrong)
      *
      * @return Map<String, String> Returns a JSON object containing the error code
      * and exception details.
      */
    public static Map<String, String> getAccessTokenFailureResponse() {

        // Initialize local variables
        Map<String, String> responseObj;
        String bodyContent;

        // Initialize the body content string to be attached to mock response
        bodyContent = '{"error_description": "Client authentication failed", "error": "invalid_client"}';

        // Initialize the mock response
        responseObj = new Map<String, String>();

        // Seed the mock-response details
        responseObj.put('status', 'ERROR');
        responseObj.put('statusCode', '401');
        responseObj.put('body', bodyContent);

        // Return the mock response details
        return responseObj;

    }

    /**
     * @description Helper function to return the customerList response
     * code and body-content details.  This models the successful retrieval of
     * a B2C Commerce CustomerList.
     *
     * @return Map<String, String> Returns a map containing the
     * successful response attributes
     */
    public static Map<String, String> getCustomerListSuccessResponse() {

        // Initialize local variables
        Map<String, String> responseObj;
        String bodyContent;

        // Build out the success response details
        bodyContent = '{\n' +
            '"_v": "20.9",\n' +
            '"_type": "customer_list",\n' +
            '"id": "RefArch"\n' +
        '}';

        // Initialize the mock response
        responseObj = new Map<String, String>();

        // Seed the mock-response details
        responseObj.put('status', 'OK');
        responseObj.put('statusCode', '200');
        responseObj.put('body', bodyContent);

        // Return the mock response details
        return responseObj;

    }

    /**
     * @description Helper function to return the customer response
     * code and body-content details.  This models the successful retrieval of
     * a B2C Commerce Customer.
     *
     * @return Map<String, String> Returns a map containing the
     * successful response attributes
     */
    public static Map<String, String> getCustomerDetailsSuccessResponse() {

        // Initialize local variables
        Map<String, String> responseObj;
        String bodyContent;

        // Build out the success response details
        bodyContent = '{\n' +
            '"_v": "20.9",\n' +
            '"_type": "customer",\n' +
            '"_resource_state": "495f86a4e72211f02037e58c34903a9dbb242e453ab6cad28b3251447870c415",\n' +
            '"creation_date": "2021-03-29T17:33:05.000Z",\n' +
            '"credentials": {\n' +
            '"_type": "credentials",\n' +
            '"enabled": true,\n' +
            '"locked": false,\n' +
            '"login": "john.doe@salesforce.com"\n' +
            '},\n' +
            '"customer_id": "bcRskvba1h30X9CoLJKEMkFgUy",\n' +
            '"customer_no": "C000000001",\n' +
            '"email": "john.doe@salesforce.com",\n' +
            '"first_name": "John",\n' +
            '"gender": 0,\n' +
            '"last_login_time": "2021-04-14T16:44:37.616Z",\n' +
            '"last_modified": "2021-04-14T16:47:29.382Z",\n' +
            '"last_name": "Doe",\n' +
            '"last_visit_time": "2021-04-14T16:44:37.616Z",\n' +
            '"phone_home": "9234567890",\n' +
            '"previous_login_time": "2021-04-14T16:44:37.616Z",\n' +
            '"previous_visit_time": "2021-04-14T16:44:37.616Z",\n' +
            '"c_b2ccrm_accountId": "0012D00000W1hbPQAR",\n' +
            '"c_b2ccrm_contactId": "0032D00000T48x9QAB",\n' +
            '"c_b2ccrm_syncStatus": "exported"\n' +
        '}';

        // Initialize the mock response
        responseObj = new Map<String, String>();

        // Seed the mock-response details
        responseObj.put('status', 'OK');
        responseObj.put('statusCode', '200');
        responseObj.put('body', bodyContent);

        // Return the mock response details
        return responseObj;

    }

    /**
     * @description Helper function to return the customer response
     * code and body-content details.  This models the failed retrieval of
     * a B2C Commerce Customer.
     *
     * @return Map<String, String> Returns a map containing the
     * successful response attributes
     */
    public static Map<String, String> getCustomerDetailsFailureResponse() {

        // Initialize local variables
        Map<String, String> responseObj;
        String bodyContent;

        // Build out the success response details
        bodyContent = '{\n' +
            '"_v": "20.9",\n' +
            '"fault": {\n' +
            '"arguments": {\n' +
            '"customerNo": "C0000000099",\n' +
            '"customerListId": "RefArch"\n' +
            '},\n' +
            '"type": "CustomerListCustomerNotFoundException",\n' +
            '"message": "No customer with number \'C0000000099\' for customer list \'RefArch\' could be found."\n' +
            '}\n' +
        '}';

        // Initialize the mock response
        responseObj = new Map<String, String>();

        // Seed the mock-response details
        responseObj.put('status', 'ERROR');
        responseObj.put('statusCode', '404');
        responseObj.put('body', bodyContent);

        // Return the mock response details
        return responseObj;

    }

    /**
     * @description Helper function to return the customerList response
     * code and body-content details.  This models the failed retrieval of
     * a B2C Commerce CustomerList (that doesn't exist)
     *
     * @return Map<String, String> Returns a map containing the
     * failed response attributes
     */
    public static Map<String, String> getCustomerListFailureResponse() {

        // Initialize local variables
        Map<String, String> responseObj;
        String bodyContent;

        // Build out the failure response details
        bodyContent = '{\n' +
            '"_v": "20.9",\n' +
            '"fault": {\n' +
                '"arguments": {\n' +
                    '"customerListId": "RefArch1"\n' +
                '},\n' +
                '"type": "CustomerListNotFoundException",\n' +
                '"message": "No customer list with ID \'RefArch1\' could be found."\n' +
            '}\n' +
        '}';

        // Initialize the mock response
        responseObj = new Map<String, String>();

        // Seed the mock-response details
        responseObj.put('status', 'ERROR');
        responseObj.put('statusCode', '404');
        responseObj.put('body', bodyContent);

        // Return the mock response details
        return responseObj;

    }

    /**
     * @description Helper function that build's the mock http-response
     * using the response object provided.
     *
     * @param responseObj {Map<String,String>} Represents a map of key-value pairs
     * containing the details that should be included in the http-response.
     * @return HttpResponse Returns the constructed http-response.
     */
    private HttpResponse buildMockHttpResponse(Map<String, String> responseObj) {

        // Initialize the mock-response
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody(responseObj.get('body'));

        // Set the status details
        res.setStatus(responseObj.get('status'));
        res.setStatusCode(Integer.valueOf(responseObj.get('statusCode')));

        // Return the response object
        return res;

    }

}