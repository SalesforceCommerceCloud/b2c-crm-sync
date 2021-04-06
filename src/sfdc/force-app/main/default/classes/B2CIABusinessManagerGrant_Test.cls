/**
 * @author Eric Schultz
 * @date Feb 6, 2020
 *
 * @description Test
 */
@IsTest
private class B2CIABusinessManagerGrant_Test {

    @IsTest
    static void testIsSuccess() {

        List<B2CIAGetAccessTokenResult> tokenResultList = new List<B2CIAGetAccessTokenResult>();

        Test.startTest();

            Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('BusinessManager'));

            B2CIABusinessManagerGrantInput req = new B2CIABusinessManagerGrantInput();
            req.namedCredential = 'namedCredential';
            req.clientId = 'clientId';

            tokenResultList = B2CIABusinessManagerGrant.getB2CAccessTokenViaClientCredentials(
                new List<B2CIABusinessManagerGrantInput>{
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
            'bf1d02e3-9477-436b-84e1-15868daa7984'
        );
    }
}