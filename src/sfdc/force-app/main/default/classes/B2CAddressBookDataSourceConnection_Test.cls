@isTest
public with sharing class B2CAddressBookDataSourceConnection_Test {
    @isTest
    static void prepareData() {
        B2C_Instance__c instance = (B2C_Instance__c)TestDataFactory.createSObject('B2C_Instance__c', new Map<String,Object>{
            'Name' => 'RefArch',
            'API_Url__c' => 'https://test.com'
        });
        B2C_CustomerList__c customerList = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
            'Name' => 'RefArch',
            'B2C_Instance__c' => instance.Id,
            'CustomerList_ID__c' => 'RefArch',
            'API_Url__c' => 'https://test.com',
            'Named_Credential_Developer_Name__c' => 'NamedCredential',
            'OCAPI_Version_No__c' => 'v20_10'
        });
        Contact contact = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'LastName' => 'lastname',
            'B2C_CustomerList_ID__c' => customerList.Id,
            'B2C_Customer_No__c' => '001'
        });
    }

    @isTest
    static void testTableSync() {
        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CAddressBookDataSourceProvider provider = new B2CAddressBookDataSourceProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            List<DataSource.Table> tables = connection.sync();
        Test.stopTest();

        System.assertEquals(tables.size(), 1, 'The result should contain one table.');
        System.assertNotEquals(tables[0].columns.size(), 0, 'The table should contains columns.');
    }

    @isTest
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
        context.TableSelection = tableSelection;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressSuccess'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CAddressBookDataSourceProvider provider = new B2CAddressBookDataSourceProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            DataSource.TableResult result = connection.query(context);
        Test.stopTest();

        System.assertEquals(result.success, true, 'The result should be a success.');
        System.assertEquals(result.tableName, 'B2C_CustomerAddress__x', 'The table name should be the one selected.');
        System.assertNotEquals(result.rows.size(), 0, 'The rows should contain at least one result.');
    }

    @isTest
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
        context.TableSelection = tableSelection;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressFailure'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CAddressBookDataSourceProvider provider = new B2CAddressBookDataSourceProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            DataSource.TableResult result = connection.query(context);
        Test.stopTest();

        System.assertEquals(result.success, true, 'The result should be a success.');
        System.assertEquals(result.tableName, 'B2C_CustomerAddress__x', 'The table name should be the one selected.');
        System.assertEquals(result.rows.size(), 0, 'The rows should not contain any result.');
    }

    @isTest
    static void testQueryMultipleAddressesIsSuccess() {
        // create the QueryContext class
        DataSource.QueryContext context = new DataSource.QueryContext();
        // create the filter class and set the ColumnName
        DataSource.Filter filter = new DataSource.Filter();
        filter.columnName = 'Customer_No';
        filter.columnValue = '001';
        filter.type = DataSource.FilterType.EQUALS;
        DataSource.Filter subFilter = new DataSource.Filter();
        subFilter.columnName = 'Customer_No';
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
        context.TableSelection = tableSelection;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressesSuccess'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CAddressBookDataSourceProvider provider = new B2CAddressBookDataSourceProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            DataSource.TableResult result = connection.query(context);
        Test.stopTest();

        System.assertEquals(result.success, true, 'The result should be a success.');
        System.assertEquals(result.tableName, 'B2C_CustomerAddress__x', 'The table name should be the one selected.');
        System.assertNotEquals(result.rows.size(), 0, 'The rows should contain at least one result.');
    }

    @isTest
    static void testQueryMultipleAddressesWrongCustomerNo() {
        // create the QueryContext class
        DataSource.QueryContext context = new DataSource.QueryContext();
        // create the filter class and set the ColumnName
        DataSource.Filter filter = new DataSource.Filter();
        filter.columnName = 'Customer_No';
        filter.columnValue = '';
        filter.type = DataSource.FilterType.EQUALS;
        DataSource.Filter subFilter = new DataSource.Filter();
        subFilter.columnName = 'Customer_No';
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
        context.TableSelection = tableSelection;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressesSuccess'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CAddressBookDataSourceProvider provider = new B2CAddressBookDataSourceProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            DataSource.TableResult result = connection.query(context);
        Test.stopTest();

        System.assertEquals(result.success, true, 'The result should be a success.');
        System.assertEquals(result.tableName, 'B2C_CustomerAddress__x', 'The table name should be the one selected.');
        System.assertEquals(result.rows.size(), 0, 'The rows should contain at least one result.');
    }


    @isTest
    static void testQueryMultipleAddressesContactNotFound() {
        // create the QueryContext class
        DataSource.QueryContext context = new DataSource.QueryContext();
        // create the filter class and set the ColumnName
        DataSource.Filter filter = new DataSource.Filter();
        filter.columnName = 'Customer_No';
        filter.columnValue = '002';
        filter.type = DataSource.FilterType.EQUALS;
        DataSource.Filter subFilter = new DataSource.Filter();
        subFilter.columnName = 'Customer_No';
        subFilter.columnValue = '002';
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
        context.TableSelection = tableSelection;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressesSuccess'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CAddressBookDataSourceProvider provider = new B2CAddressBookDataSourceProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            DataSource.TableResult result = connection.query(context);
        Test.stopTest();

        System.assertEquals(result.success, true, 'The result should be a success.');
        System.assertEquals(result.tableName, 'B2C_CustomerAddress__x', 'The table name should be the one selected.');
        System.assertEquals(result.rows.size(), 0, 'The rows should contain at least one result.');
    }

    @isTest
    static void testQueryMultipleAddressesIsFailure() {
        // create the QueryContext class
        DataSource.QueryContext context = new DataSource.QueryContext();
        // create the filter class and set the ColumnName
        DataSource.Filter filter = new DataSource.Filter();
        filter.columnName = 'Customer_No';
        filter.columnValue = '001';
        filter.type = DataSource.FilterType.EQUALS;
        DataSource.Filter subFilter = new DataSource.Filter();
        subFilter.columnName = 'Customer_No';
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
        context.TableSelection = tableSelection;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressesFailure'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CAddressBookDataSourceProvider provider = new B2CAddressBookDataSourceProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            DataSource.TableResult result = connection.query(context);
        Test.stopTest();

        System.assertEquals(result.success, true, 'The result should be a success.');
        System.assertEquals(result.tableName, 'B2C_CustomerAddress__x', 'The table name should be the one selected.');
        System.assertEquals(result.rows.size(), 0, 'The rows should not contain any result.');
    }

    @isTest
    static void testUpsertAddressWrongCustomerNo() {
        // create the UpsertContext class
        DataSource.UpsertContext context = new DataSource.UpsertContext();
        context.tableSelected = 'B2C_CustomerAddress__x';
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        Map<String, Object> row = new Map<String, Object>();
        row.put('ExternalId', '__my_home_address');
        row.put('city', 'Washingtonville');
        rows.add(row);
        context.rows = rows;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressPatchSuccess'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CAddressBookDataSourceProvider provider = new B2CAddressBookDataSourceProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            List<DataSource.UpsertResult> result = connection.upsertRows(context);
        Test.stopTest();

        System.assertEquals(rows.size(), result.size(), 'We should have as much results as rows to update.');
        System.assertNotEquals(result[0].success, true, 'The update should be a success.');
    }

    @isTest
    static void testUpsertAddressContactNotFound() {
        // create the UpsertContext class
        DataSource.UpsertContext context = new DataSource.UpsertContext();
        context.tableSelected = 'B2C_CustomerAddress__x';
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        Map<String, Object> row = new Map<String, Object>();
        row.put('ExternalId', '002__my_home_address');
        row.put('city', 'Washingtonville');
        rows.add(row);
        context.rows = rows;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressPatchSuccess'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CAddressBookDataSourceProvider provider = new B2CAddressBookDataSourceProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            List<DataSource.UpsertResult> result = connection.upsertRows(context);
        Test.stopTest();

        System.assertEquals(rows.size(), result.size(), 'We should have as much results as rows to update.');
        System.assertNotEquals(result[0].success, true, 'The update should be a success.');
    }

    @isTest
    static void testUpsertAddressIsSuccess() {
        // create the UpsertContext class
        DataSource.UpsertContext context = new DataSource.UpsertContext();
        context.tableSelected = 'B2C_CustomerAddress__x';
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        Map<String, Object> row = new Map<String, Object>();
        row.put('ExternalId', '001__my_home_address');
        row.put('city', 'Washingtonville');
        rows.add(row);
        context.rows = rows;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressPatchSuccess'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CAddressBookDataSourceProvider provider = new B2CAddressBookDataSourceProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            List<DataSource.UpsertResult> result = connection.upsertRows(context);
        Test.stopTest();

        System.assertEquals(rows.size(), result.size(), 'We should have as much results as rows to update.');
        System.assertEquals(result[0].success, true, 'The update should be a success.');
    }

    @isTest
    static void testUpsertAddressIsFailure() {
        // create the UpsertContext class
        DataSource.UpsertContext context = new DataSource.UpsertContext();
        context.tableSelected = 'B2C_CustomerAddress__x';
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        Map<String, Object> row = new Map<String, Object>();
        row.put('ExternalId', '001__my_home_address');
        row.put('city', 'Washingtonville');
        rows.add(row);
        context.rows = rows;

        prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressPatchFailure'));

        Test.startTest();
            DataSource.ConnectionParams connectionParams = new DataSource.ConnectionParams();
            B2CAddressBookDataSourceProvider provider = new B2CAddressBookDataSourceProvider();
            DataSource.Connection connection = provider.getConnection(connectionParams);
            List<DataSource.UpsertResult> result = connection.upsertRows(context);
        Test.stopTest();

        System.assertEquals(rows.size(), result.size(), 'We should have as much results as rows to update.');
        System.assertNotEquals(result[0].success, true, 'The update should be a failure.');
    }
}
