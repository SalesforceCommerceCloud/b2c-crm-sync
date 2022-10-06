@IsTest
public with sharing class B2CDataSourceAddressBookConnection_Test {
    @IsTest
    static void prepareData() {

        B2C_Instance__c instance = (B2C_Instance__c)TestDataFactory.createSObject('B2C_Instance__c', new Map<String,Object>{
            'Name' => 'RefArch',
            'API_Url__c' => 'https://test.com'
        });

        B2C_Client_ID__c clientId = (B2C_Client_ID__c)TestDataFactory.createSObject('B2C_Client_ID__c', new Map<String,Object>{
            'Name' => 'my-test-clientId',
            'B2C_Client_ID_Label__c' => 'My Test ClientID',
            'JWT_Certificate_Name__c' => B2CConstant.CERTTEST_VALIDATE_TESTCERTIFICATENAME,
            'Is_Active__c' => true,
            'Audit_Authentication_API_Interactions__c' => true
        });

        B2C_AuthToken__c authToken = (B2C_AuthToken__c)TestDataFactory.createSObject('B2C_AuthToken__c', new Map<String,Object>{
            'B2C_AuthToken__c' => 'my-test-authtoken',
            'B2C_Client_ID__c' => clientId.Id
        });
        B2C_CustomerList__c customerList = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
            'Name' => 'RefArch',
            'B2C_Instance__c' => instance.Id,
            'B2C_Client_ID__c' => clientId.Id,
            'CustomerList_ID__c' => 'RefArch',
            'API_Url__c' => 'https://test.com',
            'OCAPI_Version_No__c' => 'v20_10'
        });

        Contact contact = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'LastName' => 'lastname',
            'B2C_CustomerList__c' => customerList.Id,
            'B2C_Customer_ID__c' => '001'
        });

        // Validate that all of the test-data is created
        System.assert(contact != null, 'Expected a contact to be created');
        System.assert(customerList != null, 'Expected a customerList to be created');
        System.assert(authToken != null, 'Expected an authToken to be created');
        System.assert(clientId != null, 'Expected an clientId to be created');
        System.assert(instance != null, 'Expected an instance to be created');

    }

    @IsTest
    static void testTableSync() {
        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            List<DataSource.Table> tables = connection.sync();
        Test.stopTest();

        System.assertEquals(tables.size(), 1, 'The result should contain one table.');
        System.assertNotEquals(tables[0].columns.size(), 0, 'The table should contains columns.');
    }

    @IsTest
    static void testQuerySingleAddressIsSuccess() {
        // create the QueryContext class
        DataSource.QueryContext context = new DataSource.QueryContext();
        // create the filter class and set the ColumnName
        DataSource.Filter filter = new DataSource.Filter();
        filter.columnName = 'ExternalId';
        filter.columnValue = '001__my_home_address';
        filter.type = DataSource.FilterType.EQUALS;
        DataSource.ColumnSelection columnSelection = new DataSource.ColumnSelection();
        columnSelection.columnName = 'ExternalId';
        columnSelection.tableName = 'B2C_CustomerAddress__x';
        // create the TableSelection class, set the filter and add it to the QueryContext
        DataSource.TableSelection tableSelection = new DataSource.TableSelection();
        tableSelection.tableSelected = 'B2C_CustomerAddress__x';
        tableSelection.columnsSelected = new List<DataSource.ColumnSelection>{ columnSelection };
        tableSelection.filter = filter;
        context.tableSelection = tableSelection;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressSuccess'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            DataSource.TableResult result = connection.query(context);
        Test.stopTest();

        System.assertEquals(result.success, true, 'The result should be a success.');
        System.assertEquals(result.tableName, 'B2C_CustomerAddress__x', 'The table name should be the one selected.');
        System.assertNotEquals(result.rows.size(), 0, 'The rows should contain at least one result.');
    }

    @IsTest
    static void testQueryAddressesWithoutFilter() {
        // create the QueryContext class
        DataSource.QueryContext context = new DataSource.QueryContext();
        DataSource.ColumnSelection columnSelection = new DataSource.ColumnSelection();
        columnSelection.columnName = 'ExternalId';
        columnSelection.tableName = 'B2C_CustomerAddress__x';
        // create the TableSelection class, set the filter and add it to the QueryContext
        DataSource.TableSelection tableSelection = new DataSource.TableSelection();
        tableSelection.tableSelected = 'B2C_CustomerAddress__x';
        tableSelection.columnsSelected = new List<DataSource.ColumnSelection>{ columnSelection };
        context.tableSelection = tableSelection;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressSuccess'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            DataSource.TableResult result = connection.query(context);
        Test.stopTest();

        System.assertEquals(result.success, true, 'The result should be a success.');
        System.assertEquals(result.tableName, 'B2C_CustomerAddress__x', 'The table name should be the one selected.');
        System.assertEquals(result.rows.size(), 0, 'The rows should not contain any result.');
    }

    @IsTest
    static void testQuerySingleAddressIsFailure() {
        // create the QueryContext class
        DataSource.QueryContext context = new DataSource.QueryContext();
        // create the filter class and set the ColumnName
        DataSource.Filter filter = new DataSource.Filter();
        filter.columnName = 'ExternalId';
        filter.columnValue = '001__my_home_address';
        filter.type = DataSource.FilterType.EQUALS;
        DataSource.ColumnSelection columnSelection = new DataSource.ColumnSelection();
        columnSelection.columnName = 'ExternalId';
        columnSelection.tableName = 'B2C_CustomerAddress__x';
        // create the TableSelection class, set the filter and add it to the QueryContext
        DataSource.TableSelection tableSelection = new DataSource.TableSelection();
        tableSelection.tableSelected = 'B2C_CustomerAddress__x';
        tableSelection.columnsSelected = new List<DataSource.ColumnSelection>{ columnSelection };
        tableSelection.filter = filter;
        context.tableSelection = tableSelection;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressFailure'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            DataSource.TableResult result = connection.query(context);
        Test.stopTest();

        System.assertEquals(result.success, true, 'The result should be a success.');
        System.assertEquals(result.tableName, 'B2C_CustomerAddress__x', 'The table name should be the one selected.');
        System.assertEquals(result.rows.size(), 0, 'The rows should not contain any result.');
    }

    @IsTest
    static void testQueryMultipleAddressesIsSuccess() {
        // create the QueryContext class
        DataSource.QueryContext context = new DataSource.QueryContext();
        // create the filter class and set the ColumnName
        DataSource.Filter filter = new DataSource.Filter();
        filter.columnName = 'CustomerId';
        filter.columnValue = '001';
        filter.type = DataSource.FilterType.EQUALS;
        DataSource.Filter subFilter = new DataSource.Filter();
        subFilter.columnName = 'CustomerId';
        subFilter.columnValue = '001';
        subFilter.type = DataSource.FilterType.EQUALS;
        filter.subfilters = new List<DataSource.Filter>{ subFilter };
        DataSource.ColumnSelection columnSelection = new DataSource.ColumnSelection();
        columnSelection.columnName = 'ExternalId';
        columnSelection.tableName = 'B2C_CustomerAddress__x';
        // create the TableSelection class, set the filter and add it to the QueryContext
        DataSource.TableSelection tableSelection = new DataSource.TableSelection();
        tableSelection.tableSelected = 'B2C_CustomerAddress__x';
        tableSelection.columnsSelected = new List<DataSource.ColumnSelection>{ columnSelection };
        tableSelection.filter = filter;
        context.tableSelection = tableSelection;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressesSuccess'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            DataSource.TableResult result = connection.query(context);
        Test.stopTest();

        System.assertEquals(result.success, true, 'The result should be a success.');
        System.assertEquals(result.tableName, 'B2C_CustomerAddress__x', 'The table name should be the one selected.');
        System.assertNotEquals(result.rows.size(), 0, 'The rows should contain at least one result.');
    }

    @IsTest
    static void testQueryMultipleAddressesWrongCustomerNo() {
        // create the QueryContext class
        DataSource.QueryContext context = new DataSource.QueryContext();
        // create the filter class and set the ColumnName
        DataSource.Filter filter = new DataSource.Filter();
        filter.columnName = 'CustomerId';
        filter.columnValue = '';
        filter.type = DataSource.FilterType.EQUALS;
        DataSource.Filter subFilter = new DataSource.Filter();
        subFilter.columnName = 'CustomerId';
        subFilter.columnValue = '';
        subFilter.type = DataSource.FilterType.EQUALS;
        filter.subfilters = new List<DataSource.Filter>{ subFilter };
        DataSource.ColumnSelection columnSelection = new DataSource.ColumnSelection();
        columnSelection.columnName = 'ExternalId';
        columnSelection.tableName = 'B2C_CustomerAddress__x';
        // create the TableSelection class, set the filter and add it to the QueryContext
        DataSource.TableSelection tableSelection = new DataSource.TableSelection();
        tableSelection.tableSelected = 'B2C_CustomerAddress__x';
        tableSelection.columnsSelected = new List<DataSource.ColumnSelection>{ columnSelection };
        tableSelection.filter = filter;
        context.tableSelection = tableSelection;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressesSuccess'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            DataSource.TableResult result = connection.query(context);
        Test.stopTest();

        System.assertEquals(result.success, true, 'The result should be a success.');
        System.assertEquals(result.tableName, 'B2C_CustomerAddress__x', 'The table name should be the one selected.');
        System.assertEquals(result.rows.size(), 0, 'The rows should contain at least one result.');
    }


    @IsTest
    static void testQueryMultipleAddressesContactNotFound() {
        // create the QueryContext class
        DataSource.QueryContext context = new DataSource.QueryContext();
        // create the filter class and set the ColumnName
        DataSource.Filter filter = new DataSource.Filter();
        String customerId = '002';
        filter.columnName = 'CustomerId';
        filter.columnValue = customerId;
        filter.type = DataSource.FilterType.EQUALS;
        DataSource.Filter subFilter = new DataSource.Filter();
        subFilter.columnName = 'CustomerId';
        subFilter.columnValue = customerId;
        subFilter.type = DataSource.FilterType.EQUALS;
        filter.subfilters = new List<DataSource.Filter>{ subFilter };
        DataSource.ColumnSelection columnSelection = new DataSource.ColumnSelection();
        columnSelection.columnName = 'ExternalId';
        columnSelection.tableName = 'B2C_CustomerAddress__x';
        // create the TableSelection class, set the filter and add it to the QueryContext
        DataSource.TableSelection tableSelection = new DataSource.TableSelection();
        tableSelection.tableSelected = 'B2C_CustomerAddress__x';
        tableSelection.columnsSelected = new List<DataSource.ColumnSelection>{ columnSelection };
        tableSelection.filter = filter;
        context.tableSelection = tableSelection;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressesSuccess'));

        Test.startTest();
        try{
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            DataSource.TableResult result = connection.query(context);
        } catch (Exception e) {
            System.assertEquals(
                B2CConstant.buildErrorMessage(B2CConstant.ERRORS_META_CONTACTNOTFOUND, customerId),
                e.getMessage(),
                'We should have as much results as rows to update.'
            );
        }
        Test.stopTest();
    }

    @IsTest
    static void testQueryMultipleAddressesIsFailure() {
        // create the QueryContext class
        DataSource.QueryContext context = new DataSource.QueryContext();
        // create the filter class and set the ColumnName
        DataSource.Filter filter = new DataSource.Filter();
        filter.columnName = 'CustomerId';
        filter.columnValue = '001';
        filter.type = DataSource.FilterType.EQUALS;
        DataSource.Filter subFilter = new DataSource.Filter();
        subFilter.columnName = 'CustomerId';
        subFilter.columnValue = '001';
        subFilter.type = DataSource.FilterType.EQUALS;
        filter.subfilters = new List<DataSource.Filter>{ subFilter };
        DataSource.ColumnSelection columnSelection = new DataSource.ColumnSelection();
        columnSelection.columnName = 'ExternalId';
        columnSelection.tableName = 'B2C_CustomerAddress__x';
        // create the TableSelection class, set the filter and add it to the QueryContext
        DataSource.TableSelection tableSelection = new DataSource.TableSelection();
        tableSelection.tableSelected = 'B2C_CustomerAddress__x';
        tableSelection.columnsSelected = new List<DataSource.ColumnSelection>{ columnSelection };
        tableSelection.filter = filter;
        context.tableSelection = tableSelection;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressesFailure'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            DataSource.TableResult result = connection.query(context);
        Test.stopTest();

        System.assertEquals(result.success, true, 'The result should be a success.');
        System.assertEquals(result.tableName, 'B2C_CustomerAddress__x', 'The table name should be the one selected.');
        System.assertEquals(result.rows.size(), 0, 'The rows should not contain any result.');
    }

    @IsTest
    static void testUpsertAddressWrongCustomerNo() {
        // create the UpsertContext class
        DataSource.UpsertContext context = new DataSource.UpsertContext();
        context.tableSelected = 'B2C_CustomerAddress__x';
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        Map<String, Object> row = new Map<String, Object>();
        row.put('ExternalId', '__my_home_address');
        row.put('city', 'San Francisco');
        rows.add(row);
        context.rows = rows;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressPatchSuccess'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            List<DataSource.UpsertResult> result = connection.upsertRows(context);
        Test.stopTest();

        System.assertEquals(rows.size(), result.size(), 'We should have as much results as rows to update.');
        System.assertNotEquals(result[0].success, true, 'The update should be a success.');
    }

    @IsTest
    static void testUpsertAddressContactNotFound() {
        // create the UpsertContext class
        DataSource.UpsertContext context = new DataSource.UpsertContext();
        String customerId = '002';
        context.tableSelected = 'B2C_CustomerAddress__x';
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        Map<String, Object> row = new Map<String, Object>();
        row.put('ExternalId', customerId + '__my_home_address');
        row.put('city', 'San Francisco');
        rows.add(row);
        context.rows = rows;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressPatchSuccess'));

        Test.startTest();
        try {
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            List<DataSource.UpsertResult> result = connection.upsertRows(context);
        } catch (Exception e) {
            System.assertEquals(
                B2CConstant.buildErrorMessage(B2CConstant.ERRORS_META_CONTACTNOTFOUND, customerId),
                e.getMessage(),
                'We should have as much results as rows to update.'
            );
        }
        Test.stopTest();
    }

    @IsTest
    static void testUpsertAddressIsSuccess() {
        // create the UpsertContext class
        DataSource.UpsertContext context = new DataSource.UpsertContext();
        context.tableSelected = 'B2C_CustomerAddress__x';
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        Map<String, Object> row = new Map<String, Object>();
        row.put('ExternalId', '001__my_home_address');
        row.put('city', 'San Francisco');
        rows.add(row);
        context.rows = rows;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressPatchSuccess'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            List<DataSource.UpsertResult> result = connection.upsertRows(context);
        Test.stopTest();

        System.assertEquals(rows.size(), result.size(), 'We should have as much results as rows to update.');
        System.assertEquals(result[0].success, true, 'The update should be a success.');
    }

    @IsTest
    static void testUpsertAddressIsFailure() {
        // create the UpsertContext class
        DataSource.UpsertContext context = new DataSource.UpsertContext();
        context.tableSelected = 'B2C_CustomerAddress__x';
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        Map<String, Object> row = new Map<String, Object>();
        row.put('ExternalId', '001__my_home_address');
        row.put('city', 'San Francisco');
        rows.add(row);
        context.rows = rows;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressPatchFailure'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CDataSourceAddressBookProvider provider = new B2CDataSourceAddressBookProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            List<DataSource.UpsertResult> result = connection.upsertRows(context);
        Test.stopTest();

        System.assertEquals(rows.size(), result.size(), 'We should have as much results as rows to update.');
        System.assertNotEquals(result[0].success, true, 'The update should be a failure.');
    }
}
