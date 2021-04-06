/**
 * @author Abraham David Lloyd
 * @date May 3rd, 2020
 *
 * @description This class is used to manage authentication of B2C Commerce APIs via Service Cloud.
 * It support authentication via Client Credentials as well as via Business Manager
 * grants that require BM User Account usernames and passwords.
 */
public with sharing class B2CAuthenticator {

    /**
     * @see B2CHttpRequestHelper.getClientCredentialGrantHttpRequest
     * @description AuthWithClientCredentials is used to authenticate against a B2C
     * Commerce instance by requesting a client_credentials grant.  This method will
     * either return a JSON object containing the granted auth-token -- or return
     * an error object. foo
     *
     * See details via on different B2C Commerce REST API options via  https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/OCAPI/current/usage/APIUsage.html
     *
     * @return Map<String, Object> Represents the REST response; either the generated auth-token
     * is returned -- or the error object is returned
    */
    public static Map<String, Object> authWithClientCredentials() {

        // Initialize local variables
        Map<String, Object> responseJSONMap;

        // Initialize the http-request
        HttpRequest req = B2CHttpRequestHelper.getClientCredentialGrantHttpRequest('NamedCredential');

        // Initialize the outbound http request handler and invoke the service request
        Http https = new Http();
        HttpResponse res = https.send(req);

        // Initialize the variable used to process the response
        responseJSONMap = (Map<String, Object>)System.JSON.deserializeUntyped(res.getBody());

        // Return the de-serialized JSON object
        return responseJSONMap;

    }

}