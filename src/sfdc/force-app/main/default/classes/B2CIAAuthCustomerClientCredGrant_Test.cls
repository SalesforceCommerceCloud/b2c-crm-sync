/**
 * @author Eric Schultz
 * @date Feb 6, 2020
 *
 * @description Test
 */
@IsTest
private class B2CIAAuthCustomerClientCredGrant_Test {

    @IsTest
    static void testIsSuccess() {

        List<B2CIAGetAccessTokenResult> tokenResultList = new List<B2CIAGetAccessTokenResult>();

        Test.startTest();

            Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAuth'));

            B2CIAAuthCustomerInput req = new B2CIAAuthCustomerInput();
            req.siteId = 'siteId';
            req.customerId = 'customerId';
            req.clientId = 'clientId';
            req.token = 'token';
            req.domain = 'domain';
            req.version = 'version';

            tokenResultList = B2CIAAuthCustomerClientCredentialsGrant.getB2CAccessTokenViaClientCredentials(
                new List<B2CIAAuthCustomerInput>{
                    req
                }
            );

        Test.stopTest();

        System.assertEquals(
            tokenResultList.size() > 0,
            true
        );

        System.assertEquals(
            tokenResultList[0].accessToken,
            'authorizationtoken'
        );

    }
}