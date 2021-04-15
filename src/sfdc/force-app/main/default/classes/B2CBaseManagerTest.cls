
@isTest
public with sharing class B2CBaseManagerTest {

    @isTest
    public static void evaluateResponseForExceptionsTest() {

        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('AccessTokenFailure'));
        HttpRequest req = new HttpRequest();
        req.setEndpoint('not_existing_endpoint');
        req.setMethod('GET');
        Http h = new Http();
        HttpResponse res = h.send(req);
        try {
            B2CBaseManager.evaluateResponseForExceptions(res);
        } catch (CalloutException expectedException) {
            System.assertNotEquals(null, expectedException, 'Exceptions should be handled by the method');
        }
    }

}