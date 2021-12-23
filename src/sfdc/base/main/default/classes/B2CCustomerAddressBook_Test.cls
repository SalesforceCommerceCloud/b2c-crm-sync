@IsTest
public with sharing class B2CCustomerAddressBook_Test {
    @IsTest
    static Id prepareData() {
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
            'Name' => 'my-test-authtoken',
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

        return contact.Id;
    }

    @IsTest
    static void testGetCustomerAddressLabels() {
        prepareData();

        Test.startTest();
        List<Map<String, String>> fields = B2CCustomerAddressBook.getCustomerAddressLabels();
        Test.stopTest();

        System.assertNotEquals(fields.size(), 0, 'The fields list should be more than 0 size.');
    }

    @IsTest
    static void testGetCustomerAddressFormLabels() {
        prepareData();

        Test.startTest();
        List<Map<String, String>> fields = B2CCustomerAddressBook.getCustomerAddressFormFields();
        Test.stopTest();

        System.assertNotEquals(fields.size(), 0, 'The fields list should be more than 0 size.');
    }

    @IsTest
    static void testGetCustomerAddressesWrongParams() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressesSuccess'));

        Test.startTest();
            List<Map<String, Object>> addresses = B2CCustomerAddressBook.getCustomerAddresses('');
        Test.stopTest();

        System.assertEquals(addresses.size(), 0, 'No addresses should be found.');
    }

    @IsTest
    static void testGetCustomerAddressesNoContactFound() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressesSuccess'));

        Exception error;
        Test.startTest();
            try {
                List<Map<String, Object>> addresses = B2CCustomerAddressBook.getCustomerAddresses('testtest');
            } catch (Exception e) {
                error = e;
            }
        Test.stopTest();

        System.assertNotEquals(error, null, 'An error should be thrown.');
        System.assertEquals(error.getMessage(), '--> B2C MetaData --> No Contact found mapped to Id [testtest]; please verify that ' +
        'this Contact record is defined.', 'The error should message should state that no contact is found for the given Id.');
    }

    @IsTest
    static void testGetCustomerAddressesSuccess() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressesSuccess'));

        Test.startTest();
            List<Map<String, Object>> addresses = B2CCustomerAddressBook.getCustomerAddresses(contactId);
        Test.stopTest();

        System.assertEquals(addresses.size(), 1, 'The addresses list should contain an address object.');
        System.assertEquals(addresses.get(0).get('AddressId'), 'my_home_address', 'The address ID should be the same as the mock one.');
    }

    @IsTest
    static void testGetCustomerAddressesFailure() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressesFailure'));

        Test.startTest();
            List<Map<String, Object>> addresses = B2CCustomerAddressBook.getCustomerAddresses(contactId);
        Test.stopTest();

        System.assertEquals(addresses.size(), 0, 'No addresses should be found.');
    }

    @IsTest
    static void testGetCustomerAddressByIdWrongParams() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressSuccess'));

        Test.startTest();
            Map<String, Object> address = B2CCustomerAddressBook.getCustomerAddressById(null, null);
        Test.stopTest();

        System.assertEquals(address.keySet().size(), 0, 'The address should have no properties.');
    }

    @IsTest
    static void testGetCustomerAddressByIdNoContactFound() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressSuccess'));

        Exception error;
        Test.startTest();
            try {
                Map<String, Object> address = B2CCustomerAddressBook.getCustomerAddressById('testtest', 'my_home_address');
            } catch (Exception e) {
                error = e;
            }
        Test.stopTest();

        System.assertNotEquals(error, null, 'An error should be thrown.');
        System.assertEquals(error.getMessage(), '--> B2C MetaData --> No Contact found mapped to Id [testtest]; please verify that ' +
        'this Contact record is defined.', 'The error should message should state that no contact is found for the given Id.');
    }

    @IsTest
    static void testGetCustomerAddressByIdSuccess() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressSuccess'));

        Test.startTest();
            Map<String, Object> address = B2CCustomerAddressBook.getCustomerAddressById(contactId, 'my_home_address');
        Test.stopTest();

        System.assertNotEquals(address.keySet().size(), 0, 'The address should have properties.');
        System.assertEquals(address.get('AddressId'), 'my_home_address', 'The address ID should be the same as the mock one.');
    }

    @IsTest
    static void testGetCustomerAddressByIdFailure() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressFailure'));

        Test.startTest();
            Map<String, Object> address = B2CCustomerAddressBook.getCustomerAddressById(contactId, 'my_home_address');
        Test.stopTest();

        System.assertEquals(address.keySet().size(), 0, 'The address should have no properties.');
    }

    @IsTest
    static void testPatchCustomerAddressWrongParams() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressPatchSuccess'));

        Test.startTest();
            String error = B2CCustomerAddressBook.patchCustomerAddress('', '', null);
        Test.stopTest();

        System.assertEquals(error, B2CConstant.buildErrorMessage(error, 'Wrong parameters sent in the method'), 'The error should be returned.');
    }

    @IsTest
    static void testPatchCustomerAddressNoContactFound() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressPatchSuccess'));

        Exception error;
        Test.startTest();
            try {
                String errorMessage = B2CCustomerAddressBook.patchCustomerAddress('testtest', 'blabla', null);
            } catch (Exception e) {
                error = e;
            }
        Test.stopTest();

        System.assertNotEquals(error, null, 'An error should be thrown.');
        System.assertEquals(error.getMessage(), '--> B2C MetaData --> No Contact found mapped to Id [testtest]; please verify that ' +
        'this Contact record is defined.', 'The error should message should state that no contact is found for the given Id.');
    }

    @IsTest
    static void testPatchCustomerAddressSuccess() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressPatchSuccess'));

        Test.startTest();
            String error = B2CCustomerAddressBook.patchCustomerAddress(contactId, 'my_home_address', new Map<String, Object>());
        Test.stopTest();

        System.assertEquals(error, null, 'No error should be returned');
    }

    @IsTest
    static void testPatchCustomerAddressFailure() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CustomerAddressPatchFailure'));

        Test.startTest();
            String error = B2CCustomerAddressBook.patchCustomerAddress(contactId, 'my_home_address', new Map<String, Object>());
        Test.stopTest();

        System.assertEquals(error, B2CConstant.buildErrorMessage(error, 'No customer list with ID \'RefArch1\' could be found.'), 'The error should be returned.');
    }
}
