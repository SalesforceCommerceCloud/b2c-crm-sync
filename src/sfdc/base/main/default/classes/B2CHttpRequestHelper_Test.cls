/**
 * @author Abraham David Lloyd
 * @date June 28th, 2021
 *
 * @description This class is used to validate that base httpRequests are generated successfully.
 */
@IsTest
private class B2CHttpRequestHelper_Test {

    /**
     * @see B2CHttpRequestHelper.getAccountManagerAuthRequest
     * @description This test method is used to exercise the creation of the AccountManager authentication
     * request.  It is used to retrieve an authToken from AccountManager for future requests.
     */
    @IsTest
    static void testGetAccountManagerAuthRequest() {

        // Initialize local variables
        String baseAccountManagerUrl = 'https://account.demandware.com';
        String jwt = 'my-example-jwt';

        Test.startTest();

            // Generate the base request and capture the details
            HttpRequest requestResults = B2CHttpRequestHelper.getAccountManagerAuthRequest(
                baseAccountManagerUrl, jwt
            );

        Test.stopTest();

        // Validate that the request was successfully generated
        System.assert(
            requestResults.getEndpoint().contains(baseAccountManagerUrl),
            'Expected the apiUrl to be present in the request endpoint'
        );

        System.assert(
            requestResults.getBody().contains(jwt),
            'Expected the JWT to be present in the request body'
        );

    }

    /**
     * @see B2CHttpRequestHelper.getBusinessManagerAuthRequest
     * @description This test method is used to exercise the creation of the BusinessManager authentication
     * request.  It is used to retrieve an authToken via a BMUserGrant (ex. for OOBO).
     */
    @IsTest
    static void testGetBusinessManagerAuthRequest() {

        // Initialize local variables
        String namedCredential = 'MyTestNamedCredential';
        String clientId = 'my-example-clientId';

        Test.startTest();

            // Generate the base request and capture the details
            HttpRequest requestResults = B2CHttpRequestHelper.getBusinessManagerAuthRequest(
                namedCredential, clientId
            );

        Test.stopTest();

        // Validate that the request was successfully generated
        System.assert(requestResults.getEndpoint().contains(clientId), 'Expected the clientId to be present in the request endpoint');

    }

    /**
     * @see B2CHttpRequestHelper.getCustomerAuthRequest
     * @description This test method is used to exercise the creation of the OCAPI Shop customerAuth
     * request.  It is used to authenticate a B2C Commerce shopper against a storefront.
     */
    @IsTest
    static void testGetCustomerAuthRequest() {

        // Initialize local variables
        String apiUrl = 'https://www.example.com';
        String siteId = 'RefArch';
        String apiVersion = 'v20_10';
        String customerId = 'a8623jade123';
        String clientId = 'my-test-clientId';
        String accessToken = 'my-test-access-token';

        Test.startTest();

            // Generate the base request and capture the details
            HttpRequest requestResults = B2CHttpRequestHelper.getCustomerAuthRequest(
                apiUrl, siteId, apiVersion, customerId, clientId, accessToken
            );

        Test.stopTest();

        // Validate that the request was created successfully
        System.assert(requestResults.getEndpoint().contains(apiUrl), 'Expected the apiUrl to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(apiVersion), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(customerId), 'Expected the customerId to be present in the request endpoint');
        System.assert(requestResults.getHeader('x-dw-client-id').contains(clientId), 'Expected the clientId to be present in the request client-id header');

    }

    /**
     * @see B2CHttpRequestHelper.getCustomerProfileAddressesRequest
     * @description This test method is used to exercise the creation of the OCAPI profileAddresses request.
     */
    @IsTest
    static void testGetCustomerProfileAddressesRequest() {

        // Initialize local variables
        String apiUrl = 'https://www.example.com';
        String accessToken = B2CConstant.AUTHTEST_AUTHTOKEN;
        String apiVersion = 'v20_10';
        String b2cCustomerListId = 'RefArch';
        String b2cCustomerNo = '9999999';

        Test.startTest();

            // Generate the base request and capture the details
            HttpRequest requestResults = B2CHttpRequestHelper.getCustomerProfileAddressesRequest(
                apiUrl, accessToken, apiVersion, b2cCustomerListId, b2cCustomerNo
            );

        Test.stopTest();

        // Validate that the request was successfully generated
        System.assert(requestResults.getEndpoint().contains(apiUrl), 'Expected the apiUrl to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(apiVersion), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(b2cCustomerListId), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(b2cCustomerNo), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getHeader('Authorization').contains(accessToken), 'Expected the accessToken to be present in the authorization header');

    }

    /**
     * @see B2CHttpRequestHelper.getCustomerProfileAddressRequest
     * @description This test method is used to exercise the creation of the OCAPI profileAddress request.
     * This request is used to retrieve a specific address for a B2C CustomerProfile.
     */
    @IsTest
    static void testGetCustomerProfileAddressesRequestWithAddressId() {

        // Initialize local variables
        String apiUrl = 'https://www.example.com';
        String accessToken = B2CConstant.AUTHTEST_AUTHTOKEN;
        String apiVersion = 'v20_10';
        String b2cCustomerListId = 'RefArch';
        String b2cCustomerNo = '9999999';
        String addressId = 'My Address Id';
        String replacementAddressId = addressId.replaceAll('\\+', '%20');
        replacementAddressId = replacementAddressId.replaceAll(' ', '%20');

        Test.startTest();

            // Generate the base request and capture the details
            HttpRequest requestResults = B2CHttpRequestHelper.getCustomerProfileAddressRequest(
                apiUrl, accessToken, apiVersion, b2cCustomerListId, b2cCustomerNo, addressId
            );

        Test.stopTest();

        // Validate that the request was successfully generated
        System.assert(requestResults.getEndpoint().contains(apiUrl), 'Expected the apiUrl to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(apiVersion), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(b2cCustomerListId), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(b2cCustomerNo), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(replacementAddressId), 'Expected the escaped addressId to be present in the request endpoint');
        System.assert(requestResults.getHeader('Authorization').contains(accessToken), 'Expected the accessToken to be present in the authorization header');

    }

    /**
     * @see B2CHttpRequestHelper.getCustomerProfileAddressPatchRequest
     * @description This test method is used to exercise the creation of the OCAPI profileAddress patch.
     * request.  This request is used to update a specific address for a given B2C CustomerProfile.
     */
    @IsTest
    static void testGetCustomerProfileAddressesPatchRequest() {

        // Initialize local variables
        String apiUrl = 'https://www.example.com';
        String accessToken = B2CConstant.AUTHTEST_AUTHTOKEN;
        String apiVersion = 'v20_10';
        String b2cCustomerListId = 'RefArch';
        String b2cCustomerNo = '9999999';
        String addressId = 'My Address Id';
        String replacementAddressId = addressId.replaceAll('\\+', '%20');
        replacementAddressId = replacementAddressId.replaceAll(' ', '%20');
        String patchAddressJSON = '{ "customerAddress": true }';

        Test.startTest();

            // Generate the base request and capture the details
            HttpRequest requestResults = B2CHttpRequestHelper.getCustomerProfileAddressPatchRequest(
                apiUrl, accessToken, apiVersion, b2cCustomerListId, b2cCustomerNo, addressId, patchAddressJSON
            );

        Test.stopTest();

        // Validate that the request was successfully generated
        System.assert(requestResults.getEndpoint().contains(apiUrl), 'Expected the apiUrl to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(apiVersion), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(b2cCustomerListId), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(b2cCustomerNo), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(replacementAddressId), 'Expected the escaped addressId to be present in the request endpoint');
        System.assert(requestResults.getBody().contains(patchAddressJSON), 'Expected the addressJSON to be present in the request body');
        System.assert(requestResults.getHeader('Authorization').contains(accessToken), 'Expected the accessToken to be present in the authorization header');

    }

    /**
     * @see B2CHttpRequestHelper.getAllSitesRequest
     * @description This test method is used to exercise the creation of the OCAPI getSites() request.
     * This method is used to retrieve the sites and customerlists for a given instance.
     */
    @IsTest
    static void testGetAllSitesRequest() {

        // Initialize local variables
        String apiUrl = 'https://www.example.com';
        String accessToken = B2CConstant.AUTHTEST_AUTHTOKEN;
        String apiVersion = 'v20_10';

        Test.startTest();

            // Generate the base request and capture the details
            HttpRequest requestResults = B2CHttpRequestHelper.getAllSitesRequest(
                apiUrl, accessToken, apiVersion
            );

        Test.stopTest();

        // Validate that the request was successfully generated
        System.assert(requestResults.getEndpoint().contains(apiUrl), 'Expected the apiUrl to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(apiVersion), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getHeader('Authorization').contains(accessToken), 'Expected the accessToken to be present in the authorization header');

    }

    /**
     * @see B2CHttpRequestHelper.getCustomerProfileRequest
     * @description This test method is used to exercise the creation of the OCAPI customerProfile
     * retrieval request.  It is used to retrieve customerProfile details.
     */
    @IsTest
    static void testGetCustomerProfileRequest() {

        // Initialize local variables
        String apiUrl = 'https://www.example.com';
        String accessToken = B2CConstant.AUTHTEST_AUTHTOKEN;
        String apiVersion = 'v20_10';
        String b2cCustomerListId = 'RefArch';
        String b2cCustomerNo = '9999999';

        Test.startTest();

            // Generate the base request and capture the details
            HttpRequest requestResults = B2CHttpRequestHelper.getCustomerProfileRequest(
                apiUrl, accessToken, apiVersion, b2cCustomerListId, b2cCustomerNo
            );

        Test.stopTest();

        // Validate that the request was successfully generated
        System.assert(requestResults.getEndpoint().contains(apiUrl), 'Expected the apiUrl to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(apiVersion), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(b2cCustomerListId), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(b2cCustomerNo), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getHeader('Authorization').contains(accessToken), 'Expected the accessToken to be present in the authorization header');

    }

    /**
     * @see B2CHttpRequestHelper.getCustomerProfilePatchRequest
     * @description This test method is used to exercise the creation of the OCAPI customerProfile
     * patch or update request.  It is used to patch customerProfile details.
     */
    @IsTest
    static void testGetCustomerProfilePatchRequest() {

        // Initialize local variables
        String apiUrl = 'https://www.example.com';
        String accessToken = B2CConstant.AUTHTEST_AUTHTOKEN;
        String apiVersion = 'v20_10';
        String b2cCustomerListId = 'RefArch';
        String b2cCustomerNo = '9999999';
        String b2cCustomerProfileJSON = '{ "customerProfile": true }';

        Test.startTest();

        // Generate the base request and capture the details
        HttpRequest requestResults = B2CHttpRequestHelper.getCustomerProfilePatchRequest(
                apiUrl, accessToken, apiVersion, b2cCustomerListId, b2cCustomerNo, b2cCustomerProfileJSON
        );

        Test.stopTest();

        // Validate that the request was successfully generated
        System.assert(requestResults.getEndpoint().contains(apiUrl), 'Expected the apiUrl to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(apiVersion), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(b2cCustomerListId), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(b2cCustomerNo), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getBody().contains(b2cCustomerProfileJSON), 'Expected the profileJSON to be present in the request body');
        System.assert(requestResults.getHeader('Authorization').contains(accessToken), 'Expected the accessToken to be present in the authorization header');
    }

    /**
     * @see B2CHttpRequestHelper.resetPasswordRequest
     * @description This test method is used to exercise the reset password request.
     * It is used to start the reset password workflow.
     */
    @IsTest
    static void testResetPasswordRequest() {
        String apiUrl = 'https://www.example.com';
        String siteId = 'RefArch';
        String apiVersion = 'v20_10';
        String customerId = 'a8623jade123';
        String clientId = 'my-test-clientId';
        String accessToken = B2CConstant.AUTHTEST_AUTHTOKEN;

        Test.startTest();

        HttpRequest requestResults = B2CHttpRequestHelper.resetPasswordRequest(
                apiUrl, siteId, apiVersion, customerId, clientId, accessToken
        );

        Test.stopTest();

        // Validate that the request was successfully generated
        System.assert(requestResults.getEndpoint().contains(apiUrl), 'Expected the apiUrl to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(apiVersion), 'Expected the apiVersion to be present in the request endpoint');
        System.assert(requestResults.getEndpoint().contains(customerId), 'Expected the customerId to be present in the request endpoint');
        System.assert(requestResults.getHeader('x-dw-client-id').contains(clientId), 'Expected the clientId to be present in the request client-id header');
    }
}
