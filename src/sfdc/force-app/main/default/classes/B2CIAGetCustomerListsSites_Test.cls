/**
 * @author Eric Schultz
 * @date Feb 6, 2020
 *
 * @description Test
 */
@IsTest
private class B2CIAGetCustomerListsSites_Test {

    @IsTest
    static void testIsSuccess() {

        List<B2CIAGetCustomerListsSitesResult> resultsList = new List<B2CIAGetCustomerListsSitesResult>();

        B2C_Instance__c i = new B2C_Instance__c(
                API_Url__c = 'https://www.salesfor.com'
            );
            Database.insert( i );

        Test.startTest();

            Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerListsSites'));

            B2CIAGetCustomerListsSitesInput req = new B2CIAGetCustomerListsSitesInput();

            req.b2cInstanceId = i.Id;
            req.namedCredential = 'NamedCredential';
            req.OCAPIVersion = 'version';

            resultsList = B2CIAGetCustomerListsSites.getAllSites(
                new List<B2CIAGetCustomerListsSitesInput>{
                    req
                }
            );

        Test.stopTest();

        System.assertEquals(
            resultsList.size() > 0,
            true
        );

        System.assertEquals(
            resultsList[0].totalRecords == 10,
            true
        );
    }
}