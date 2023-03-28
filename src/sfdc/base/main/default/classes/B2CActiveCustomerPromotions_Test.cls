@IsTest
public with sharing class B2CActiveCustomerPromotions_Test {
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
            'B2C_AuthToken__c' => 'my-test-authtoken',
            'B2C_Client_ID__c' => clientId.Id
        });
        B2C_CustomerList__c customerList = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
            'Name' => 'RefArch',
            'B2C_Instance__c' => instance.Id,
            'B2C_Client_ID__c' => clientId.Id,
            'CustomerList_ID__c' => 'RefArch',
            'API_Url__c' => 'https://test.com',
            'OCAPI_Version_No__c' => 'v20_10',
            'Is_Active__c' => true
        });
        Contact contact = (Contact)TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'LastName' => 'lastname',
            'B2C_CustomerList__c' => customerList.Id,
            'B2C_Customer_ID__c' => '001'
        });

        System.assert(instance != null, 'Expected an instance to be created');
        System.assert(clientId != null, 'Expected an clientId to be created');
        System.assert(authToken != null, 'Expected an authToken to be created');
        System.assert(customerList != null, 'Expected a customerList to be created');
        System.assert(contact != null, 'Expected a contact to be created');

        return contact.Id;
    }

    @IsTest
    static void testGetPromotionsLabels() {
        prepareData();

        Test.startTest();
        List<Map<String, String>> fields = B2CActiveCustomerPromotions.getPromotionsLabels();
        Test.stopTest();

        System.assertNotEquals(fields.size(), 0, 'The fields list should be more than 0 size.');
    }

    @IsTest
    static void testGetCouponCodesWrongParams() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CouponCodesSuccess'));

        Test.startTest();
            List<String> coupons = B2CActiveCustomerPromotions.getCouponCodes('', '', '', 0);
        Test.stopTest();

        System.assertEquals(coupons.size(), 0, 'No coupons should be found.');
    }

    @IsTest
    static void testGetCouponCodesNoContactFound() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CouponCodesSuccess'));

        Exception error;
        Test.startTest();
            try {
                List<String> coupons = B2CActiveCustomerPromotions.getCouponCodes('testtest', 'couponId', 'siteId', 0);
            } catch (Exception e) {
                error = e;
            }
        Test.stopTest();

        System.assertNotEquals(error, null, 'An error should be thrown.');
        System.assertEquals(error.getMessage(), '--> B2C MetaData --> No Contact found mapped to Id [testtest]; please verify that ' +
        'this Contact record is defined.', 'The error should message should state that no contact is found for the given Id.');
    }

    @IsTest
    static void testGetCouponCodesSuccess() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CouponCodesSuccess'));

        Test.startTest();
            List<String> coupons = B2CActiveCustomerPromotions.getCouponCodes(contactId, 'couponId', 'siteId', 0);
        Test.stopTest();

        System.assertEquals(coupons.size(), 1, 'The coupons codes list should contain a code.');
        System.assertEquals(coupons.get(0), 'code2', 'The coupon code should be the same as the mock one, which is not issued.');
    }

    @IsTest
    static void testGetCouponCodesFailure() {
        Id contactId = prepareData();
        Test.setMock(HttpCalloutMock.class, new B2CHttpTestCalloutMockGenerator('CouponCodesFailure'));

        Test.startTest();
            List<String> coupons = B2CActiveCustomerPromotions.getCouponCodes(contactId, 'couponId', 'siteId', 0);
        Test.stopTest();

        System.assertEquals(coupons.size(), 0, 'No coupons should be found.');
    }
}
