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
     * @description Generates the httpRequest to authenticate an against the B2C Commerce
     * Account Manager and retrieve an accessToken for REST API access.
     *
     * @param baseAccountManagerUrl {String} Represents the base accountManager Url used to authenticate against
     * @param jwt {String} Represents the generated JWT that will be used to perform authentication
     * @return HttpRequest Returns an http-object pre-configured accountManager authentication request
     * */
    public static HttpRequest getAccountManagerAuthRequest(String baseAccountManagerUrl, String jwt) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(baseAccountManagerUrl);
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.setBody('grant_type=client_credentials&client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3A' +
            'client-assertion-type%3Ajwt-bearer&client_assertion=' + jwt);
        req.setMethod('POST');
        return req;
    }

    /**
     * @description Generates the httpRequest to authenticate an against against a B2C Commerce
     * instance as a Business Manager user.
     *
     * @param namedCredential {String} Represents namedCredential to use for the callout
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
     * @description Generates the httpRequest to authenticate a B2C Commerce storefront customer
     * against a given B2C Commerce storefront instance.
     *
     * @param apiUrl {String} Represents the apiUrl used to invoke this request
     * @param siteId {String} Represents the siteId used to invoke the request
     * @param apiVersion {String} Represents the apiVersion used to invoke the request
     * @param customerId {String} Represents the B2C ClientID used to drive this request
     * @param clientId {String} Represents the customerId of the customer being authenticated
     * @param accessToken {String} Represents the B2C Commerce authToken used for this request
     * @return HttpRequest Returns an http-object pre-configured shop-api site retrieval request
     * */
    public static HttpRequest getCustomerAuthRequest(
        String apiUrl, String siteId, String apiVersion, String customerId, String clientId, String accessToken
    ) {
        return getOCAPIShopAPIHttpRequest(
            apiUrl,
            siteId,
            accessToken,
            clientId,
            '/customers/' + customerId + '/auth',
            apiVersion,
            'post',
            '{"type" : "credentials"}'
        );
    }

    /**
     * @description Generates the httpRequest to retrieve all storefront sites.
     *
     * @param apiUrl {String} Represents the base apiUrl used to invoke the REST API call
     * @param accessToken {String} Represents the Account Manager accessToken used to authorize a REST API call
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @return HttpRequest Returns an http-object pre-configured data-api request
     * */
    public static HttpRequest getAllSitesRequest(String apiUrl, String accessToken, String apiVersion) {
        return getOCAPIDataAPIHttpRequest(
            apiUrl,
            accessToken,
            '/sites?select=(**)',
            apiVersion,
            'get',
            ''
        );
    }

    /**
     * @description Generates the httpRequest to retrieve a B2C Commerce Customer Profile
     *
     * @param apiUrl {String} Represents the base apiUrl used to invoke the REST API call
     * @param accessToken {String} Represents the Account Manager accessToken used to authorize a REST API call
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param b2cCustomerListId {String} Represents the B2C Commerce CustomerList owning the customer profile requested
     * @param b2cCustomerNo {String} Represents the B2C Commerce Customer Number of the customer profile being retrieved
     * @return HttpRequest Returns an http-object pre-configured data-api request
     * */
    public static HttpRequest getCustomerProfileRequest(
        String apiUrl, String accessToken, String apiVersion, String b2cCustomerListId, String b2cCustomerNo
    ) {
        // Return the generated request
        return getOCAPIDataAPIHttpRequest(
            apiUrl,
            accessToken,
            '/customer_lists/' + b2cCustomerListId + '/customers/' + b2cCustomerNo,
            apiVersion,
            'get',
            ''
        );
    }

    /**
     * @description Generates the httpRequest to retrieve B2C Commerce Addresses from the customer's address book
     *
     * @param apiUrl {String} Represents the base apiUrl used to invoke the REST API call
     * @param accessToken {String} Represents the Account Manager accessToken used to authorize a REST API call
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param b2cCustomerListId {String} Represents the B2C Commerce CustomerList owning the customer profile requested
     * @param b2cCustomerNo {String} Represents the B2C Commerce Customer Number of the customer profile being retrieved
     * @return HttpRequest Returns an http-object pre-configured data-api request
     * */
    public static HttpRequest getCustomerProfileAddressesRequest(
        String apiUrl, String accessToken, String apiVersion, String b2cCustomerListId, String b2cCustomerNo
    ) {
        // Return the generated request
        return getOCAPIDataAPIHttpRequest(
            apiUrl, accessToken,
            '/customer_lists/' + b2cCustomerListId + '/customers/' + b2cCustomerNo + '/addresses',
            apiVersion,
            'get',
            ''
        );
    }

    /**
     * @description Generates the httpRequest to retrieve a B2C Commerce Address from the customer's address book
     *
     * @param apiUrl {String} Represents the base apiUrl used to invoke the REST API call
     * @param accessToken {String} Represents the Account Manager accessToken used to authorize a REST API call
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param b2cCustomerListId {String} Represents the B2C Commerce CustomerList owning the customer profile requested
     * @param b2cCustomerNo {String} Represents the B2C Commerce Customer Number of the customer profile being retrieved
     * @param addressId {String} Represents the B2C Commerce Address ID of the customer's address being retrieved
     * @return HttpRequest Returns an http-object pre-configured data-api request
     * */
    public static HttpRequest getCustomerProfileAddressRequest(
        String apiUrl, String accessToken, String apiVersion,
        String b2cCustomerListId, String b2cCustomerNo, String addressId
    ) {

        // Replace the space-identifier in the address id to functionally support spaces
        String updatedAddressId = addressId.replaceAll('\\+', '%20');
        updatedAddressId = addressId.replaceAll(' ', '%20');
        String ocapiSuffix = '/customer_lists/' + b2cCustomerListId + '/customers/' +
            b2cCustomerNo + '/addresses/' + updatedAddressId;

        // Return the generated request
        return getOCAPIDataAPIHttpRequest(
            apiUrl,
            accessToken,
            ocapiSuffix,
            apiVersion,
            'get',
            '');

    }

    /**
     * @description Generates the httpRequest to update a B2C Commerce Customer Address from the customer's address book
     *
     * @param apiUrl {String} Represents the base apiUrl used to invoke the REST API call
     * @param accessToken {String} Represents the Account Manager accessToken used to authorize a REST API call
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param b2cCustomerListId {String} Represents the B2C Commerce CustomerList owning the customer profile updated
     * @param b2cCustomerNo {String} Represents the B2C Commerce Customer Number of the customer profile being updated
     * @param addressId {String} Represents the B2C Commerce Address ID of the customer's address being updated
     * @param b2cAddressJSON {String} Represents the address object being published to B2C Commerce
     * @return HttpRequest Returns an http-object pre-configured data-api request
     * */
    public static HttpRequest getCustomerProfileAddressPatchRequest(
        String apiUrl, String accessToken, String apiVersion, String b2cCustomerListId,
        String b2cCustomerNo, String addressId, String b2cAddressJSON
    ) {

        // Replace the space-identifier in the address id to functionally support spaces
        String updatedAddressId = addressId.replaceAll('\\+', '%20');
        updatedAddressId = addressId.replaceAll(' ', '%20');
        String ocapiSuffix = '/customer_lists/' + b2cCustomerListId + '/customers/' +
            b2cCustomerNo + '/addresses/' + updatedAddressId;

        // Return the generated request
        return getOCAPIDataAPIHttpRequest(
            apiUrl,
            accessToken,
            ocapiSuffix,
            apiVersion,
            'patch',
            b2cAddressJSON
        );

    }

    /**
     * @description Generates the httpRequest to update a B2C Commerce Customer Profile
     *
     * @param apiUrl {String} Represents the base apiUrl used to invoke the REST API call
     * @param accessToken {String} Represents the Account Manager accessToken used to authorize a REST API call
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param b2cCustomerListId {String} Represents the B2C Commerce CustomerList owning the customer profile requested
     * @param b2cCustomerNo {String} Represents the B2C Commerce Customer Number of the customer profile being retrieved
     * @param b2cCustomerProfileJSON {String} Represents the customerProfile object being published to B2C Commerce
     * @return HttpRequest Returns an http-object pre-configured data-api request
     * */
    public static HttpRequest getCustomerProfilePatchRequest(
        String apiUrl, String accessToken, String apiVersion, String b2cCustomerListId,
        String b2cCustomerNo, String b2cCustomerProfileJSON
    ) {
        return getOCAPIDataAPIHttpRequest(
            apiUrl,
            accessToken,
            '/customer_lists/' + b2cCustomerListId + '/customers/' + b2cCustomerNo,
            apiVersion,
            'patch',
            b2cCustomerProfileJSON
        );
    }

    /**
     * @description Generates the httpRequest to reset the password of the B2C Commerce Customer Profile
     *
     * @param apiUrl {String} Represents the apiUrl used to invoke this request
     * @param siteId {String} Represents the siteId used to invoke the request
     * @param apiVersion {String} Represents the apiVersion used to invoke the request
     * @param customerId {String} Represents the B2C ClientID used to drive this request
     * @param clientId {String} Represents the customerId of the customer being authenticated
     * @param accessToken {String} Represents the B2C Commerce authToken used for this request
     * @return HttpRequest Returns an http-object pre-configured shop-api site retrieval request
     * */
    public static HttpRequest resetPasswordRequest(
        String apiUrl, String siteId, String apiVersion, String customerId, String clientId, String accessToken
    ) {
        return getOCAPIShopAPIHttpRequest(
            apiUrl,
            siteId,
            accessToken,
            clientId,
            '/customers/' + customerId + '/password_reset',
            apiVersion,
            'post',
            ''
        );
    }

    /**
     * @description Helper class to generate the core http-request structure for OCAPI Data Requests
     *
     * @param apiUrl {String} Represents the base apiUrl used to invoke the REST API call
     * @param accessToken {String} Represents the Account Manager accessToken used to authorize a REST API call
     * @param ocapiSuffix {String} Represents the suffix to apply to the url representing the Data API endpoint
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param httpMethod {String} Represents the httpMethod to apply to the current request
     * @param bodyAsJSON {String} Represents the body as JSON to send within the request
     * @return HttpRequest Returns an http-object pre-configured data-api customer-retrieval request
     * */
    private static HttpRequest getOCAPIDataAPIHttpRequest(
        String apiUrl, String accessToken, String ocapiSuffix, String apiVersion,
        String httpMethod, String bodyAsJSON
    ) {
        HttpRequest req = new HttpRequest();

        System.debug('--> apiUrl: ' + apiUrl);
        System.debug('--> apiVersion: ' + apiVersion);
        System.debug('--> ocapiSuffix: ' + ocapiSuffix);

        // Define the request properties
        req.setMethod(httpMethod.toUpperCase());
        req.setHeader('Content-Type', 'application/json; charset=UTF-8');
        req.setHeader('Authorization', 'Bearer ' + accessToken);
        req.setEndpoint(apiUrl + '/s/-/dw/data/' + apiVersion + ocapiSuffix);

        // Append the request body if one is provided
        if (!String.isEmpty(bodyAsJSON)) { req.setBody(bodyAsJSON); }

        // Return the request
        return req;
    }

    /**
     * @description Helper class to generate the core http-request structure for OCAPI Shop Requests
     *
     * @param apiUrl {String} Represents the base apiUrl used to invoke the REST API call
     * @param accessToken {String} Represents the Account Manager accessToken used to authorize a REST API call
     * @param ocapiSuffix {String} Represents the suffix to apply to the url representing the Data API endpoint
     * @param apiVersion {String} Represents the API version that should be used for the current REST API call
     * @param httpMethod {String} Represents the httpMethod to apply to the current request
     * @param bodyAsJSON {String} Represents the body as JSON to send within the request
     * @return HttpRequest Returns an http-object pre-configured data-api customer-retrieval request
     * */
    private static HttpRequest getOCAPIShopAPIHttpRequest(
        String apiUrl, String siteId, String accessToken,
        String clientId, String ocapiSuffix, String apiVersion,
        String httpMethod, String bodyAsJSON
    ) {
        HttpRequest req = new HttpRequest();

        System.debug('--> apiUrl: ' + apiUrl);
        System.debug('--> apiVersion: ' + apiVersion);
        System.debug('--> ocapiSuffix: ' + ocapiSuffix);

        // Define the request properties
        req.setMethod(httpMethod.toUpperCase());
        req.setHeader('Content-Type', 'application/json; charset=UTF-8');
        req.setHeader('Content-Length', '0');
        req.setHeader('x-dw-client-id', clientId);
        req.setHeader('Authorization', 'Bearer ' + accessToken);
        req.setEndpoint(apiUrl + '/s/' + siteId +'/dw/shop/' + apiVersion + ocapiSuffix);

        // Append the request body if one is provided
        if (!String.isEmpty(bodyAsJSON)) {
            req.setBody(bodyAsJSON);
        }

        // Return the request
        return req;
    }
}
