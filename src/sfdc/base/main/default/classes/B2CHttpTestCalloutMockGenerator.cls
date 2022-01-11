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
        Map<String, String> responseObj;

        switch on this.requestType {
            when 'AccessTokenSuccess' {
                responseObj = getAccessTokenSuccessResponse();
            }
            when 'AccessTokenFailure' {
                responseObj = getAccessTokenFailureResponse();
            }
            when 'CustomerListSuccess' {
                responseObj = getCustomerListSuccessResponse();
            }
            when 'CustomerListFailure' {
                responseObj = getCustomerListFailureResponse();
            }
            when 'CustomerDetailsSuccess' {
                responseObj = getCustomerDetailsSuccessResponse();
            }
            when 'CustomerDetailsFailure' {
                responseObj = getCustomerDetailsFailureResponse();
            }
            when 'CustomerShopDetailsSuccessWithPromotions' {
                responseObj = getCustomerShopDetailsSuccessResponseWithPromotions();
            }
            when 'CustomerShopDetailsFailure' {
                responseObj = getCustomerShopDetailsFailureResponse();
            }
            when 'CustomerAddressSuccess' {
                responseObj = getCustomerAddressSuccessResponse();
            }
            when 'CustomerAddressFailure' {
                responseObj = getCustomerAddressFailureResponse();
            }
            when 'CustomerAddressesSuccess' {
                responseObj = getCustomerAddressesSuccessResponse();
            }
            when 'CustomerAddressesFailure' {
                responseObj = getCustomerAddressesFailureResponse();
            }
            when 'CustomerAddressPatchSuccess' {
                responseObj = getCustomerAddressPatchSuccessResponse();
            }
            when 'CustomerAddressPatchFailure' {
                responseObj = getCustomerAddressPatchFailureResponse();
            }
            when 'BusinessManagerSuccess' {
                responseObj = getAccessTokenSuccessResponse();
            }
            when 'BusinessManagerFailure' {
                responseObj = getAccessTokenFailureResponse();
            }
            when 'CustomerListsSitesSuccess' {
                responseObj = getCustomerListSitesSuccessResponse();
            }
            when 'CustomerListsSitesFailure' {
                responseObj = getCustomerListSitesFailureResponse();
            }
            when 'ActivePromotionsSuccess' {
                responseObj = getActivePromotionsSuccessResponse();
            }
            when 'ActivePromotionsFailure' {
                responseObj = getActivePromotionsFailureResponse();
            }
            when 'CouponCodesSuccess' {
                responseObj = getCouponCodesSuccessResponse();
            }
            when 'CouponCodesFailure' {
                responseObj = getCouponCodesFailureResponse();
            }
            when 'CustomerAuthSuccess' {
                HttpResponse resCustomerAuth = new HttpResponse();
                resCustomerAuth.setHeader('Content-Type', 'application/json');
                resCustomerAuth.setHeader('authorization', B2CConstant.AUTHTEST_AUTHTOKEN);
                resCustomerAuth.setBody('{}');
                resCustomerAuth.setStatus('OK');
                resCustomerAuth.setStatusCode(200);
                return resCustomerAuth;
            }
            when 'CustomerAuthFailure' {
                responseObj = getAccessTokenFailureResponse();
            }
            when 'PasswordResetSuccess' {
                HttpResponse resPasswordReset = new HttpResponse();
                resPasswordReset.setHeader('Content-Type', 'application/json');
                resPasswordReset.setHeader('authorization', B2CConstant.AUTHTEST_AUTHTOKEN);
                resPasswordReset.setBody('');
                resPasswordReset.setStatus('OK');
                resPasswordReset.setStatusCode(204);
                return resPasswordReset;
            }
            when 'PasswordResetFailure' {
                responseObj = getAccessTokenFailureResponse();
            }
        }

        return buildMockHttpResponse(responseObj);
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
        accessToken = B2CConstant.AUTHTEST_AUTHTOKEN;

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
            '"_v": "21.3",\n' +
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
     * @description Helper function to return the customerListSites response
     * code and body-content details.  This models the successful retrieval of
     * a B2C Commerce CustomerList and related Sites.
     *
     * @return Map<String, String> Returns a map containing the
     * successful response attributes
     */
    public static Map<String, String> getCustomerListSitesSuccessResponse() {

        // Initialize local variables
        Map<String, String> responseObj;
        String bodyContent;

        // Build out the success response details
        bodyContent = '{\n' +
                '    "_v": "21.3",\n' +
                '    "_type": "sites",\n' +
                '    "count": 2,\n' +
                '    "data": [\n' +
                '        {\n' +
                '            "_type": "site",\n' +
                '            "_resource_state": "fe4bb773fff79634b869cb252215138c995c5334f1ce1ea817a4f9ac47f72b44",\n' +
                '            "cartridges": "plugin_b2ccrmsync_oobo:plugin_cartridge_merge:plugin_instorepickup:plugin_wishlists:plugin_giftregistry:lib_productlist:plugin_productcompare:plugin_sitemap:plugin_applepay:plugin_datadownload:plugin_b2ccrmsync:int_b2ccrmsync:app_storefront_base:plugin_apple_pay:plugin_facebook:plugin_payments:plugin_pinterest_commerce:plugin_web_payments:bc_content:core",\n' +
                '            "customer_list_link": {\n' +
                '                "_type": "customer_list_link",\n' +
                '                "customer_list_id": "RefArch",\n' +
                '                "link": "https://example.com/s/-/dw/data/v21_3/customer_lists/RefArch"\n' +
                '            },\n' +
                '            "display_name": {\n' +
                '                "default": "RefArch"\n' +
                '            },\n' +
                '            "id": "RefArch",\n' +
                '            "in_deletion": false,\n' +
                '            "link": "https://example.com/s/-/dw/data/v21_3/sites/RefArch",\n' +
                '            "storefront_status": "online"\n' +
                '        },\n' +
                '        {\n' +
                '            "_type": "site",\n' +
                '            "_resource_state": "77b688044277d87598f879c1219157f8e3419f0be52d5d7b5c585fce1287666d",\n' +
                '            "cartridges": "plugin_b2ccrmsync_oobo:plugin_cartridge_merge:plugin_instorepickup:plugin_wishlists:plugin_giftregistry:lib_productlist:plugin_productcompare:plugin_sitemap:plugin_applepay:plugin_datadownload:plugin_b2ccrmsync:int_b2ccrmsync:app_storefront_base:plugin_apple_pay:plugin_facebook:plugin_payments:plugin_pinterest_commerce:plugin_web_payments:bc_content:core",\n' +
                '            "customer_list_link": {\n' +
                '                "_type": "customer_list_link",\n' +
                '                "customer_list_id": "RefArchGlobal",\n' +
                '                "link": "https://example.com/s/-/dw/data/v21_3/customer_lists/RefArchGlobal"\n' +
                '            },\n' +
                '            "display_name": {\n' +
                '                "default": "RefArchGlobal"\n' +
                '            },\n' +
                '            "id": "RefArchGlobal",\n' +
                '            "in_deletion": false,\n' +
                '            "link": "https://example.com/s/-/dw/data/v21_3/sites/RefArchGlobal",\n' +
                '            "storefront_status": "online"\n' +
                '        }\n' +
                '    ],\n' +
                '    "select": "(**)",\n' +
                '    "start": 0,\n' +
                '    "total": 2\n' +
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
     * @description Helper function to return the customerListSites response
     * code and body-content details.  This models the failed retrieval of
     * a B2C Commerce CustomerList and related Sites.
     *
     * @return Map<String, String> Returns a map containing the
     * successful response attributes
     */
    public static Map<String, String> getCustomerListSitesFailureResponse() {

        // Initialize local variables
        Map<String, String> responseObj;
        String bodyContent;

        // Build out the success response details
        bodyContent = '{\n' +
                '    "_v": "21.3",\n' +
                '    "fault": {\n' +
                '        "arguments": {\n' +
                '            "siteId": "UNKNOWN"\n' +
                '        },\n' +
                '        "type": "SiteNotFoundException",\n' +
                '        "message": "No site with ID \'UNKNOWN\' could be found."\n' +
                '    }\n' +
                '}';

        // Initialize the mock response
        responseObj = new Map<String, String>();

        // Seed the mock-response details
        responseObj.put('status', 'OK');
        responseObj.put('statusCode', '404');
        responseObj.put('body', bodyContent);

        // Return the mock response details
        return responseObj;

    }


    /**
     * @description Helper function to return the active promotions response
     * code and body-content details. This models the successful retrieval of
     * a B2C Commerce Promotions list.
     *
     * @return Map<String, String> Returns a map containing the
     * successful response attributes
     */
    public static Map<String, String> getActivePromotionsSuccessResponse() {
        Map<String, String> responseObj = new Map<String, String>();
        String bodyContent = '{\n' +
                '    "_v": "21.3",\n' +
                '    "_type": "promotion_result",\n' +
                '    "count": 1,\n' +
                '    "data": [\n' +
                '        {\n' +
                '            "_type": "promotion",\n' +
                '            "callout_msg": "callout_msg",\n' +
                '            "details": "details",\n' +
                '            "id": "promotion-id-1",\n' +
                '            "name": "promotion-name-1",\n' +
                '            "c_coupons": [{\n' +
                '            "id": "coupon-id"\n' +
                '            }]\n' +
                '        },\n' +
                '        {\n' +
                '            "_type": "promotion",\n' +
                '            "callout_msg": "callout_msg",\n' +
                '            "details": "details",\n' +
                '            "id": "promotion-id-2",\n' +
                '            "name": "promotion-name-2"\n' +
                '        }\n' +
                '    ],\n' +
                '    "start": 0,\n' +
                '    "total": 1\n' +
                '}';

        // Seed the mock-response details
        responseObj.put('status', 'OK');
        responseObj.put('statusCode', '200');
        responseObj.put('body', bodyContent);

        return responseObj;

    }

    /**
     * @description Helper function to return the active promotions response
     * code and body-content details. This models the failed retrieval of
     * a B2C Commerce Promotions list.
     *
     * @return Map<String, String> Returns a map containing the
     * successful response attributes
     */
    public static Map<String, String> getActivePromotionsFailureResponse() {
        Map<String, String> responseObj = new Map<String, String>();
        String bodyContent = '{\n' +
                '    "_v": "21.3",\n' +
                '    "fault": {\n' +
                '        "arguments": {\n' +
                '            "promotionId": "UNKNOWN",\n' +
                '            "siteId": "RefArch"\n' +
                '        },\n' +
                '        "type": "PromotionNotFoundException",\n' +
                '        "message": "No promotion with ID \'UNKNOWN\' for site \'RefArch\' could be found."\n' +
                '    }\n' +
                '}';

        // Seed the mock-response details
        responseObj.put('status', 'OK');
        responseObj.put('statusCode', '404');
        responseObj.put('body', bodyContent);

        return responseObj;
    }

    /**
     * @description Helper function to return the coupon codes response
     * code and body-content details. This models the successful retrieval of
     * a B2C Commerce Coupon Codes list for a given coupon ID.
     *
     * @return Map<String, String> Returns a map containing the
     * successful response attributes
     */
    public static Map<String, String> getCouponCodesSuccessResponse() {
        Map<String, String> responseObj = new Map<String, String>();
        String bodyContent = '{\n' +
                '    "_v": "21.3",\n' +
                '    "_type": "coupon_codes",\n' +
                '    "count": 2,\n' +
                '    "data": [\n' +
                '        {\n' +
                '            "_type": "coupon_code",\n' +
                '            "code": "code1",\n' +
                '            "issued": true\n' +
                '        },\n' +
                '        {\n' +
                '            "_type": "coupon_code",\n' +
                '            "code": "code2"\n' +
                '        }\n' +
                '    ],\n' +
                '    "start": 0,\n' +
                '    "total": 2\n' +
                '}';

        // Seed the mock-response details
        responseObj.put('status', 'OK');
        responseObj.put('statusCode', '200');
        responseObj.put('body', bodyContent);

        return responseObj;

    }

    /**
     * @description Helper function to return the coupon codes response
     * code and body-content details. This models the failed retrieval of
     * a B2C Commerce Coupon Codes list for a given coupon ID.
     *
     * @return Map<String, String> Returns a map containing the
     * successful response attributes
     */
    public static Map<String, String> getCouponCodesFailureResponse() {
        Map<String, String> responseObj = new Map<String, String>();
        String bodyContent = '{\n' +
                '    "_v": "21.3",\n' +
                '    "fault": {\n' +
                '        "arguments": {\n' +
                '            "couponId": "UNKNOWN",\n' +
                '            "siteId": "RefArch"\n' +
                '        },\n' +
                '        "type": "CouponNotFoundException",\n' +
                '        "message": "No coupon with ID \'UNKNOWN\' for site \'RefArch\' could be found."\n' +
                '    }\n' +
                '}';

        // Seed the mock-response details
        responseObj.put('status', 'OK');
        responseObj.put('statusCode', '404');
        responseObj.put('body', bodyContent);

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
        //noinspection SpellCheckingInspection
        bodyContent = '{\n' +
            '"_v": "21.3",\n' +
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
                '"_v": "21.3",\n' +
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
     * @description Helper function to return the customer response
     * code and body-content details.  This models the successful retrieval of
     * a B2C Commerce Customer.
     *
     * @return Map<String, String> Returns a map containing the
     * successful response attributes
     */
    public static Map<String, String> getCustomerShopDetailsSuccessResponseWithPromotions() {
        Map<String, String> responseObj = new Map<String, String>();
        String bodyContent = '{\n' +
            '"_v": "21.3",\n' +
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
            '"c_b2ccrm_syncStatus": "exported",\n' +
            '"c_active_promotions": [\n' +
            '"Test-promo-1",\n' +
            '"Test-promo-2"\n' +
            '],\n' +
            '"testattr": "testattrvalue"\n' +
            '}\n' +
        '}';

        // Seed the mock-response details
        responseObj.put('status', 'OK');
        responseObj.put('statusCode', '200');
        responseObj.put('body', bodyContent);

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
    public static Map<String, String> getCustomerShopDetailsFailureResponse() {
        Map<String, String> responseObj = new Map<String, String>();
        String bodyContent = '{\n' +
            '"_v": "21.3",\n' +
            '"fault": {\n' +
            '"type": "InvalidCustomerException",\n' +
            '"message": "The customer is invalid."\n' +
            '}\n' +
        '}';

        // Seed the mock-response details
        responseObj.put('status', 'ERROR');
        responseObj.put('statusCode', '400');
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
            '"_v": "21.3",\n' +
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
     * @description Helper function to return the customer addresses response
     * code and body-content details.  This models the successful retrieval of
     * a B2C Commerce Customer Addresses.
     *
     * @return Map<String, String> Returns a map containing the
     * successful response attributes
     */
    public static Map<String, String> getCustomerAddressesSuccessResponse() {
        Map<String, String> responseObj = new Map<String, String>();
        String bodyContent = '{\n' +
            '"_v": "21.3",\n' +
            '"_type": "customer_address_result",\n' +
            '"count" : 10,\n' +
            '"data" : [{\n' +
            '"_resource_state" : "860cde3040519cce439cd99e209f8a87c3ad0b7e2813def6f5501f763b73bd5",\n' +
            '"address1" : "Lodyweg",\n' +
            '"address_id" : "my_home_address",\n' +
            '"city" : "Washingtonville",\n' +
            '"company_name" : "Salesforce Commerce Cloud",\n' +
            '"country_code" : "SH",\n' +
            '"first_name" : "Pit",\n' +
            '"full_name" : "Pit Snipes",\n' +
            '"job_title" : "",\n' +
            '"last_name" : "Snipes",\n' +
            '"phone" : "001-111-1111",\n' +
            '"postal_code" : "15361",\n' +
            '"state_code" : "DE"\n' +
            '}],\n' +
            '"next" : "https://example.com/dw/data/v21_3/customer_lists/4711/customers/0815/addresses?count=10&start=10",\n' +
            '"start" : 0,\n' +
            '"total" : 1\n' +
        '}';

        responseObj.put('status', 'OK');
        responseObj.put('statusCode', '200');
        responseObj.put('body', bodyContent);
        return responseObj;
    }

    /**
     * @description Helper function to return the customer addresses response
     * code and body-content details.  This models the failed retrieval of
     * a B2C Commerce Customer Addresses (that doesn't exist)
     *
     * @return Map<String, String> Returns a map containing the
     * failed response attributes
     */
    public static Map<String, String> getCustomerAddressesFailureResponse() {
        Map<String, String> responseObj = new Map<String, String>();
        String bodyContent = '{\n' +
            '"_v": "21.3",\n' +
            '"fault": {\n' +
                '"arguments": {\n' +
                    '"customerListId": "RefArch1"\n' +
                '},\n' +
                '"type": "CustomerListNotFoundException",\n' +
                '"message": "No customer list with ID \'RefArch1\' could be found."\n' +
            '}\n' +
        '}';

        responseObj.put('status', 'ERROR');
        responseObj.put('statusCode', '404');
        responseObj.put('body', bodyContent);
        return responseObj;
    }

    /**
     * @description Helper function to return the customer address response
     * code and body-content details.  This models the successful retrieval of
     * a B2C Commerce Customer Address
     *
     * @return Map<String, String> Returns a map containing the
     * successful response attributes
     */
    public static Map<String, String> getCustomerAddressSuccessResponse() {
        Map<String, String> responseObj = new Map<String, String>();
        String bodyContent = '{\n' +
            '"_v": "21.3",\n' +
            '"_resource_state" : "860cde3040519cce439cd99e209f8a87c3ad0b7e2813def6f5501f763b73bd5",\n' +
            '"_type": "customer_address",\n' +
            '"address1" : "Lodyweg",\n' +
            '"address_id" : "my_home_address",\n' +
            '"city" : "Washingtonville",\n' +
            '"company_name" : "Salesforce Commerce Cloud",\n' +
            '"country_code" : "SH",\n' +
            '"first_name" : "Pit",\n' +
            '"full_name" : "Pit Snipes",\n' +
            '"job_title" : "",\n' +
            '"last_name" : "Snipes",\n' +
            '"phone" : "001-111-1111",\n' +
            '"postal_code" : "15361",\n' +
            '"state_code" : "DE"\n' +
        '}';

        responseObj.put('status', 'OK');
        responseObj.put('statusCode', '200');
        responseObj.put('body', bodyContent);
        return responseObj;
    }

    /**
     * @description Helper function to return the customer address response
     * code and body-content details.  This models the failed retrieval of
     * a B2C Commerce Customer Address (that doesn't exist)
     *
     * @return Map<String, String> Returns a map containing the
     * failed response attributes
     */
    public static Map<String, String> getCustomerAddressFailureResponse() {
        Map<String, String> responseObj = new Map<String, String>();
        String bodyContent = '{\n' +
            '"_v": "21.3",\n' +
            '"fault": {\n' +
                '"arguments": {\n' +
                    '"customerListId": "RefArch1"\n' +
                '},\n' +
                '"type": "CustomerListNotFoundException",\n' +
                '"message": "No customer list with ID \'RefArch1\' could be found."\n' +
            '}\n' +
        '}';

        responseObj.put('status', 'ERROR');
        responseObj.put('statusCode', '404');
        responseObj.put('body', bodyContent);
        return responseObj;
    }


    /**
     * @description Helper function to return the customer address response
     * code and body-content details.  This models the successful update of
     * a B2C Commerce Customer Address
     *
     * @return Map<String, String> Returns a map containing the
     * successful response attributes
     */
    public static Map<String, String> getCustomerAddressPatchSuccessResponse() {
        Map<String, String> responseObj = new Map<String, String>();
        String bodyContent = '{\n' +
            '"_v": "21.3",\n' +
            '"_resource_state" : "860cde3040519cce439cd99e209f8a87c3ad0b7e2813def6f5501f763b73bd5",\n' +
            '"_type": "customer_address",\n' +
            '"address1" : "Lodyweg",\n' +
            '"address_id" : "my_home_address",\n' +
            '"city" : "Washingtonville",\n' +
            '"company_name" : "Salesforce Commerce Cloud",\n' +
            '"country_code" : "SH",\n' +
            '"first_name" : "Pit",\n' +
            '"full_name" : "Pit Snipes",\n' +
            '"job_title" : "",\n' +
            '"last_name" : "Snipes",\n' +
            '"phone" : "001-111-1111",\n' +
            '"postal_code" : "15361",\n' +
            '"state_code" : "DE"\n' +
        '}';

        responseObj.put('status', 'OK');
        responseObj.put('statusCode', '200');
        responseObj.put('body', bodyContent);
        return responseObj;
    }

    /**
     * @description Helper function to return the customer address response
     * code and body-content details.  This models the failed update of
     * a B2C Commerce Customer Address (that doesn't exist)
     *
     * @return Map<String, String> Returns a map containing the
     * failed response attributes
     */
    public static Map<String, String> getCustomerAddressPatchFailureResponse() {
        Map<String, String> responseObj = new Map<String, String>();
        String bodyContent = '{\n' +
            '"_v": "21.3",\n' +
            '"fault": {\n' +
                '"arguments": {\n' +
                    '"customerListId": "RefArch1"\n' +
                '},\n' +
                '"type": "CustomerListNotFoundException",\n' +
                '"message": "No customer list with ID \'RefArch1\' could be found."\n' +
            '}\n' +
        '}';

        responseObj.put('status', 'ERROR');
        responseObj.put('statusCode', '404');
        responseObj.put('body', bodyContent);
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
