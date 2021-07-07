@IsTest
public with sharing class B2CDataSourceAddressBookProvider_Test {
    @IsTest
    static void testGetConnection() {
        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
        Test.stopTest();

        System.assertNotEquals(null, connection, 'The connection should not be null.');
    }

    @IsTest
    static void testGetAuthenticationCapabilities() {
        Test.startTest();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            List<DataSource.AuthenticationCapability> capabilities = provider.getAuthenticationCapabilities();
        Test.stopTest();

        System.assertEquals(DataSource.AuthenticationCapability.ANONYMOUS, capabilities[0], 'The authentication capability should be anonymous.');
        System.assertEquals(1, capabilities.size(), 'The authentication capabilities only contain one capability.');
    }

    @IsTest
    static void testGetCapabilities() {
        Test.startTest();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            List<DataSource.Capability> capabilities = provider.getCapabilities();
        Test.stopTest();

        System.assertEquals(DataSource.Capability.ROW_QUERY, capabilities[0], 'The first capability should be QUERY.');
        System.assertEquals(DataSource.Capability.ROW_UPDATE, capabilities[1], 'The second capability should be UPDATE.');
        System.assertEquals(2, capabilities.size(), 'The provider should only contain two capabilities.');
    }
}
