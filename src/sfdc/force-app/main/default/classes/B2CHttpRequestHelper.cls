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
     * @description Helper class to generate the core http-request structure for retrieving customer profiles.
     *
     * @param siteUrl {String} Represents the current storefront baseUrl used to access rest APIs
     * @param OCAPISuffix {String} Represents the suffix to apply to the url representing the Data API endpoint
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param httpMethod {String} Represents the httpMethod to apply to the current request
     * @param bodyAsJSON {String} Represents the body as JSON to send within the request
     * @return HttpRequest Returns an http-object pre-configured data-api customer-retrieval request
     * */
    private static HttpRequest getOCAPIDataAPIHttpRequest(String namedCredential, String OCAPISuffix, String apiVersion, String httpMethod, String bodyAsJSON) {
        HttpRequest req = new HttpRequest();
        req.setMethod(httpMethod.toUpperCase());
        req.setHeader('Content-Type', 'application/json; charset=UTF-8');
        req.setEndpoint('callout:' + namedCredential + '/s/-/dw/data/' + apiVersion + OCAPISuffix);

        if (!String.isEmpty(bodyAsJSON)) {
            req.setBody(bodyAsJSON);
        }

        return req;
    }

    /**
     * @description Generates the httpRequest to retrieve all storefront sites.
     *
     * @param namedCredential {String} Represents the name credential to use to get the sites
     * @param clientId {String} Represents the client Id to use to authenticate the request
     * @return HttpRequest Returns an http-object pre-configured data-api site retrieval request
     * */
    public static HttpRequest getBusinessManagerAuthRequest(String namedCredential, String clientId) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:' + namedCredential + '/dw/oauth2/access_token?client_id=' + clientId);
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.setBody('grant_type=urn:demandware:params:oauth:grant-type:client-id:dwsid:dwsecuretoken');
        req.setMethod('POST');
        return req;
    }

    /**
     * @description Generates the httpRequest to retrieve all storefront sites.
     *
     * @param namedCredential {String} Represents the name credential to use to get the sites
     * @param clientId {String} Represents the client Id to use to authenticate the request
     * @return HttpRequest Returns an http-object pre-configured data-api site retrieval request
     * */
    public static HttpRequest getCustomerAuthRequest(String siteUrl, String siteId, String apiVersion, String customerId, String clientId, String accessToken) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(siteUrl + '/s/' + siteId +'/dw/shop/' + apiVersion + '/customers/' + customerId + '/auth');
        req.setMethod('POST');
        req.setHeader('Content-Type','application/json');
        req.setHeader('Content-Length', '0');
        req.setHeader('x-dw-client-id', clientId);
        req.setHeader('Authorization', 'Bearer '+ accessToken);
        req.setBody('{"type" : "credentials"}');
        return req;
    }

    /**
     * @description Generates the httpRequest to retrieve all storefront sites.
     *
     * @param namedCredential {String} Represents the name credential to use to get the sites
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @return HttpRequest Returns an http-object pre-configured data-api request
     * */
    public static HttpRequest getAllSitesRequest(String namedCredential, String apiVersion) {
        return getOCAPIDataAPIHttpRequest(namedCredential, '/sites?select=(**)', apiVersion, 'get', '');
    }

    /**
     * @description Generates the httpRequest to retrieve a B2C Commerce Customer Profile
     *
     * @param namedCredential {String} Represents the name credential to use to get the customer profile
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param b2cCustomerListId {String} Represents the B2C Commerce CustomerList that owns the customer profile being requested
     * @param b2cCustomerNo {String} Represents the B2C Commerce Customer Number of the customer profile being retrieved
     * @return HttpRequest Returns an http-object pre-configured data-api request
     * */
    public static HttpRequest getCustomerProfileRequest(String namedCredential, String apiVersion, String b2cCustomerListId, String b2cCustomerNo) {
        return getOCAPIDataAPIHttpRequest(namedCredential, '/customer_lists/' + b2cCustomerListId + '/customers/' + b2cCustomerNo, apiVersion, 'get', '');
    }

    /**
     * @description Generates the httpRequest to retrieve a B2C Commerce Customer Addresses from the customer's address book
     *
     * @param namedCredential {String} Represents the name credential to use to get the customer addresses
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param b2cCustomerListId {String} Represents the B2C Commerce CustomerList that owns the customer profile being requested
     * @param b2cCustomerNo {String} Represents the B2C Commerce Customer Number of the customer profile being retrieved
     * @return HttpRequest Returns an http-object pre-configured data-api request
     * */
    public static HttpRequest getCustomerProfileAddressesRequest(String namedCredential, String apiVersion, String b2cCustomerListId, String b2cCustomerNo) {
        return getOCAPIDataAPIHttpRequest(namedCredential, '/customer_lists/' + b2cCustomerListId + '/customers/' + b2cCustomerNo + '/addresses', apiVersion, 'get', '');
    }

    /**
     * @description Generates the httpRequest to retrieve a B2C Commerce Customer Address from the customer's address book
     *
     * @param namedCredential {String} Represents the name credential to use to get the customer addresses
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param b2cCustomerListId {String} Represents the B2C Commerce CustomerList that owns the customer profile being requested
     * @param b2cCustomerNo {String} Represents the B2C Commerce Customer Number of the customer profile being retrieved
     * @param addressId {String} Represents the B2C Commerce Address ID of the customer's address being retrieved
     * @return HttpRequest Returns an http-object pre-configured data-api request
     * */
    public static HttpRequest getCustomerProfileAddressRequest(String namedCredential, String apiVersion, String b2cCustomerListId, String b2cCustomerNo, String addressId) {

        // Replace the space-identifier in the address id to functionally support spaces
        String updatedAddressId = addressId.replaceAll('\\+', '%20');

        return getOCAPIDataAPIHttpRequest(namedCredential, '/customer_lists/' + b2cCustomerListId + '/customers/' + b2cCustomerNo + '/addresses/' + updatedAddressId, apiVersion, 'get', '');

    }

    /**
     * @description Generates the httpRequest to update a B2C Commerce Customer Address from the customer's address book
     *
     * @param namedCredential {String} Represents the name credential to use to get the customer addresses
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param b2cCustomerListId {String} Represents the B2C Commerce CustomerList that owns the customer profile being updated
     * @param b2cCustomerNo {String} Represents the B2C Commerce Customer Number of the customer profile being updated
     * @param addressId {String} Represents the B2C Commerce Address ID of the customer's address being updated
     * @param b2cAddressJSON {String} Represents the address object being published to B2C Commerce
     * @return HttpRequest Returns an http-object pre-configured data-api request
     * */
    public static HttpRequest getCustomerProfileAddressPatchRequest(String namedCredential, String apiVersion, String b2cCustomerListId, String b2cCustomerNo, String addressId, String b2cAddressJSON) {

        // Replace the space-identifier in the address id to functionally support spaces
        String updatedAddressId = addressId.replaceAll(' ', '%20');

        return getOCAPIDataAPIHttpRequest(namedCredential, '/customer_lists/' + b2cCustomerListId + '/customers/' + b2cCustomerNo + '/addresses/' + updatedAddressId, apiVersion, 'patch', b2cAddressJSON);

    }

    /**
     * @description Generates the httpRequest to update a B2C Commerce Customer Profile
     *
     * @param namedCredential {String} Represents the name credential to use to update the customer profile
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param b2cCustomerListId {String} Represents the B2C Commerce CustomerList that owns the customer profile being requested
     * @param b2cCustomerNo {String} Represents the B2C Commerce Customer Number of the customer profile being retrieved
     * @param b2cCustomerProfileJSON {String} Represents the customerProfile object being published to B2C Commerce
     * @return HttpRequest Returns an http-object pre-configured data-api request
     * */
    public static HttpRequest getCustomerProfilePatchRequest(String namedCredential, String apiVersion, String b2cCustomerListId, String b2cCustomerNo, String b2cCustomerProfileJSON) {
        return getOCAPIDataAPIHttpRequest(namedCredential, '/customer_lists/' + b2cCustomerListId + '/customers/' + b2cCustomerNo, apiVersion, 'patch', b2cCustomerProfileJSON);
    }
}
