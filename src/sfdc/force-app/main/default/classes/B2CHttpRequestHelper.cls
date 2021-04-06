/**
 * @author Abraham David Lloyd
 * @date May 8rd, 2020
 *
 * @description This class is a helper class used to create stock HttpRequest
 * definitions that are used by REST interaction classes to interact with B2C Commerce
 * REST APIs.
 */
public with sharing class B2CHttpRequestHelper {

    /**
     * @description Helper class to generate the core http-request structure
     *
     * @param httpMethod {String} Represents the httpMethod to apply to the current request
     * @param accessToken {String} Represents the bearer / access-token provided by the B2C Commerce instance
     * @param req {HttpRequest} Represents the current HttpRequest being processed
     * @return HttpRequest Returns an http-object pre-configured data-api customer-retrieval request
     **/
    private static HttpRequest setRequestDefaults(String httpMethod, String accessToken, HttpRequest req) {

        // Set the default headers and httpRequest method
        req.setMethod(httpMethod.toUpperCase());
        req.setHeader('Authorization', 'Bearer ' + accessToken);
        req.setHeader('Content-Type', 'application/json; charset=UTF-8');

        // Return the updated request
        return req;

    }

    /**
     * @description Helper class to generate the core http-request structure; this method is leveraged in
     * scenarios where the siteUrl
     *
     * @param OCAPIUrl {String} Represents the url for the OCAPI REST API Request to be processed
     * @param accessToken {String} Represents the bearer / access-token provided by the B2C Commerce instance
     * @param httpMethod {String} Represents the httpMethod to apply to the current request
     * @return HttpRequest Returns an http-object pre-configured data-api customer-retrieval request
     * */
    private static HttpRequest getOCAPIDataAPIHttpRequest(String OCAPIUrl, String accessToken, String httpMethod) {

        // Initialize the http-request
        HttpRequest req = new HttpRequest();

        // Define the individual attributes of the request
        req.setEndpoint(OCAPIUrl);

        // Set the core details for this http-request
        req = setRequestDefaults(httpMethod, accessToken, req);

        // Return the generic request
        return req;

    }

    /**
     * @description Helper class to generate the core http-request structure for retrieving customer profiles.
     *
     * @param siteUrl {String} Represents the current storefront baseUrl used to access rest APIs
     * @param OCAPISuffix {String} Represents the suffix to apply to the url representing the Data API endpoint
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param accessToken {String} Represents the bearer / access-token provided by the B2C Commerce instance
     * @param httpMethod {String} Represents the httpMethod to apply to the current request
     * @return HttpRequest Returns an http-object pre-configured data-api customer-retrieval request
     * */
    private static HttpRequest getOCAPIDataAPIHttpRequest(String siteUrl, String OCAPISuffix, String apiVersion, String accessToken, String httpMethod) {

        // Initialize the http-request
        String requestUrl;
        HttpRequest req = new HttpRequest();

        // Build out the requestUrl
        requestUrl = siteUrl + '/s/-/dw/data/' + apiVersion + OCAPISuffix;

        // Define the individual attributes of the request
        req.setEndpoint(requestUrl);

        // Set the core details for this http-request
        req = setRequestDefaults(httpMethod, accessToken, req);

        // Return the generic request
        return req;

    }

    /**
     * @description Helper class to generate the core http-request structure for client-credentials grants.
     *
     * @param NamedCredential {String} Represents the namedCredential call-out to leverage
     * @return HttpRequest Returns an http-object pre-configured for a client-credentials grant request
     */
    public static HttpRequest getClientCredentialGrantHttpRequest(String NamedCredential) {

        // Initialize the http-request
        HttpRequest req = new HttpRequest();

        // Define the individual attributes of the request
        req.setEndpoint('callout:' + NamedCredential + '/dwsso/oauth2/access_token');
        req.setHeader('Content-Type','application/x-www-form-urlencoded');
        req.setBody('grant_type=client_credentials');
        req.setMethod('POST');

        // Return the request
        return req;

    }

    /**
     * @description Generates the httpRequest to retrieve all storefront sites.
     *
     * @param siteUrl {String} Represents the current storefront baseUrl used to access rest APIs
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param accessToken {String} Represents the bearer / access-token provided by the B2C Commerce instance
     * @return HttpRequest Returns an http-object pre-configured data-api site retrieval request
     * */
    public static HttpRequest getAllSitesRequest(String siteUrl, String apiVersion, String accessToken) {

        // Initialize the http-request
        HttpRequest req;
        String OCAPISuffix;

        // Default the OCAPI Suffix
        OCAPISuffix = '/sites?select=(**)';

        // Create the request definition to retrieve all storefront sites for the specified environment
        req = getOCAPIDataAPIHttpRequest(siteUrl, OCAPISuffix, apiVersion, accessToken, 'get');

        // Return the request definition
        return req;

    }

    /**
     * @description Represents a static / generic httpGet request for B2C Commerce's
     * OCAPI Data API; this is leveraged by other requests to generate the full call-out
     *
     * @param siteUrl {String} Represents the base API url to leverage in the request
     * @param accessToken {String} Represents the accessToken to leverage in the request
     * @param httpMethod {String} Represents the httpMethod being applied to the generic request
     * @return {HttpRequest} Returns a baseline httpRequest
     */
    public static HttpRequest getGenericRequest(String siteUrl, String accessToken, String httpMethod) {

        // Initialize the http-request
        HttpRequest req;

        // Create the generic httpGet request definition
        req = getOCAPIDataAPIHttpRequest(siteUrl, accessToken, httpMethod);

        // Return the request definition
        return req;

    }

    /**
     * @description Generates the httpRequest to retrieve a specific storefront site
     *
     * @param siteUrl {String} Represents the current storefront baseUrl used to access rest APIs
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param accessToken {String} Represents the bearer / access-token provided by the B2C Commerce instance
     * @param siteId {String} Represents siteId for which details will be retrieved
     * @return HttpRequest Returns an http-object pre-configured data-api site-specific detail request
     * */
    public static HttpRequest getSiteDetailsRequest(String siteUrl, String apiVersion, String accessToken, String siteId) {

        // Initialize the http-request
        HttpRequest req;
        String OCAPISuffix;

        // Default the OCAPI Suffix
        OCAPISuffix = '/sites/' + siteId;

        // Create the request definition to retrieve all storefront sites for the specified environment
        req = getOCAPIDataAPIHttpRequest(siteUrl, OCAPISuffix, apiVersion, accessToken, 'get');

        // Return the request definition
        return req;

    }

    /**
     * @description Generates the httpRequest to retrieve a B2C Commerce Customer Profile
     *
     * @param siteUrl {String} Represents the current storefront baseUrl used to access rest APIs
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param accessToken {String} Represents the bearer / access-token provided by the B2C Commerce instance
     * @param b2cCustomerListId {String} Represents the B2C Commerce CustomerList that owns the customer profile being requested
     * @param b2cCustomerNo {String} Represents the B2C Commerce Customer Number of the customer profile being retrieved
     * @return HttpRequest Returns an http-object pre-configured data-api site retrieval request
     * */
    public static HttpRequest getCustomerProfileRequest(String siteUrl, String apiVersion, String accessToken, String b2cCustomerListId, String b2cCustomerNo) {

        // Initialize the http-request
        HttpRequest req;
        String OCAPISuffix;

        // Default the OCAPI Suffix
        OCAPISuffix = '/customer_lists/' + b2cCustomerListId + '/customers/' + b2cCustomerNo;

        // Create the request definition to retrieve all storefront sites for the specified environment
        req = getOCAPIDataAPIHttpRequest(siteUrl, OCAPISuffix, apiVersion, accessToken, 'get');

        // Return the request definition
        return req;

    }


    /**
     * @description Generates the httpRequest to retrieve a B2C Commerce Customer Profile
     *
     * @param siteUrl {String} Represents the current storefront baseUrl used to access rest APIs
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param accessToken {String} Represents the bearer / access-token provided by the B2C Commerce instance
     * @param b2cCustomerListId {String} Represents the B2C Commerce CustomerList that owns the customer profile being requested
     * @param b2cCustomerNo {String} Represents the B2C Commerce Customer Number of the customer profile being retrieved
     * @param b2cCustomerProfileJSON {String} Represents the customerProfile object being published to B2C Commerce
     * @return HttpRequest Returns an http-object pre-configured data-api site retrieval request
     * */
    public static HttpRequest getCustomerProfilePatchRequest(String siteUrl, String apiVersion, String accessToken, String b2cCustomerListId, String b2cCustomerNo, String b2cCustomerProfileJSON) {

        // Initialize the http-request
        HttpRequest req;
        String OCAPISuffix;

        // Default the OCAPI Suffix
        OCAPISuffix = '/customer_lists/' + b2cCustomerListId + '/customers/' + b2cCustomerNo;

        // Create the request definition to retrieve all storefront sites for the specified environment
        req = getOCAPIDataAPIHttpRequest(siteUrl, OCAPISuffix, apiVersion, accessToken, 'patch');

        // Apply the body to the request
        req.setBody(b2cCustomerProfileJSON);

        // Return the request definition
        return req;

    }

}