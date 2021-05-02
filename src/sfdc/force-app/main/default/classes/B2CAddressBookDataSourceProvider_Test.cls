@isTest
public with sharing class B2CAddressBookDataSourceProvider_Test {
    @isTest
    static void testGetConnection() {
        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CAddressBookDataSourceProvider provider = new B2CAddressBookDataSourceProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
        Test.stopTest();

        System.assertNotEquals(null, connection, 'The connection should not be null.');
    }

    @isTest
    static void testGetAuthenticationCapabilities() {
        Test.startTest();
            B2CAddressBookDataSourceProvider provider = new B2CAddressBookDataSourceProvider();
            List<DataSource.AuthenticationCapability> capabilities = provider.getAuthenticationCapabilities();
        Test.stopTest();

        System.assertEquals(DataSource.AuthenticationCapability.ANONYMOUS, capabilities[0], 'The authentication capability should be anonymous.');
        System.assertEquals(1, capabilities.size(), 'The authentication capabilities only contain one capability.');
    }

    @isTest
    static void testGetCapabilities() {
        Test.startTest();
            B2CAddressBookDataSourceProvider provider = new B2CAddressBookDataSourceProvider();
            List<DataSource.Capability> capabilities = provider.getCapabilities();
        Test.stopTest();

        System.assertEquals(DataSource.Capability.ROW_QUERY, capabilities[0], 'The first capability should be QUERY.');
        System.assertEquals(DataSource.Capability.ROW_UPDATE, capabilities[1], 'The second capability should be UPDATE.');
        System.assertEquals(2, capabilities.size(), 'The provider should only contain two capabilities.');
    }
}