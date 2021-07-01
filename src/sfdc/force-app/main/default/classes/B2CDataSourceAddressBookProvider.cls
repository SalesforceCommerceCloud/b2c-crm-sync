/**
 * @author Jordane Bachelet
 * @date May 11th, 2021
 *
 * @description This class is used to initialize the dataSourceProvider used
 * to support the retrieval of B2C Commerce Customer addresses via externalObjects.
*/
global with sharing class B2CDataSourceAddressBookProvider extends DataSource.Provider {
    /**
     * @description Returns the supported authentication capabilities of this provider
     *
     * @return {List<DataSource.AuthenticationCapability} The supported capabilities
     **/
    override global List<DataSource.AuthenticationCapability> getAuthenticationCapabilities() {
        List<DataSource.AuthenticationCapability> capabilities =  new List<DataSource.AuthenticationCapability>();
        capabilities.add(DataSource.AuthenticationCapability.ANONYMOUS);
        return capabilities;
    }

    /**
     * @description Returns the supported record capabilities of this provider
     *
     * @return {List<DataSource.Capability} The supported capabilities
     */
    override global List<DataSource.Capability> getCapabilities() {
        List<DataSource.Capability> capabilities = new List<DataSource.Capability>();
        capabilities.add(DataSource.Capability.ROW_QUERY);
        capabilities.add(DataSource.Capability.ROW_UPDATE);
        //Below Capabilities are not supported at this time
        //capabilities.add(DataSource.Capability.SEARCH);
        //capabilities.add(DataSource.Capability.ROW_CREATE);
        //capabilities.add(DataSource.Capability.ROW_DELETE);
        return capabilities;
    }

    /**
     * @description Returns the connection for this provider
     *
     * @return {DataSource.Connection} The connection to use to work with customer addresses
     **/
    override global DataSource.Connection getConnection(DataSource.ConnectionParams connectionParams) {
        return new B2CDataSourceAddressBookConnection(connectionParams);
    }
}

