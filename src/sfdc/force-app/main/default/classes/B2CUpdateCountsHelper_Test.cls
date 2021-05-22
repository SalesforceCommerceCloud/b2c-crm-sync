/**
 * @author Abraham David Lloyd
 * @date May 22nd, 2021
 *
 * @description This test-class is used to exercise the updateCounts helper.  The helper calculates
 * customerList and siteCounts for instances and customerLists.
 */
@IsTest
private class B2CUpdateCountsHelper_Test {

    @IsTest
    static void testSingleInstanceCustomerListInsert() {

        // Initialize local variables
        B2C_Instance__c instance1;
        B2C_Instance__c thisInstanceBefore;
        B2C_Instance__c thisInstanceAfter;
        B2C_CustomerList__c customerList1;
        B2C_CustomerList__c customerList2;

        Test.startTest();

            // Setup a single customerList we can use for testing / validation
            instance1 = (B2C_Instance__c)TestDataFactory.createSObject('B2C_Instance__c', new Map<String,Object>{
                'Name' => 'instance1',
                'API_Url__c' => 'https://instance1.salesforce.com',
                'Is_Active__c' => true
            });

            // Setup a single customerList we can use for testing / validation
            customerList1 = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
                'Name' => 'customerList1',
                'Is_Active__c' => true,
                'API_Url__c' => 'https://clist1.salesforce.com',
                'B2C_Instance__c' => instance1.Id
            });

            // Retrieve a copy of the instance -- including the current customerList counts
            thisInstanceBefore = [SELECT Id, Name, Total_CustomerLists__c FROM B2C_Instance__c WHERE Name = :instance1.Name];

            // Setup a single customerList we can use for testing / validation
            customerList2 = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
                'Name' => 'customerList2',
                'Is_Active__c' => true,
                'API_Url__c' => 'https://clist2.salesforce.com',
                'B2C_Instance__c' => instance1.Id
            });

            // Retrieve a copy of the instance -- after processing the customerList insert
            thisInstanceAfter = [SELECT Id, Name, Total_CustomerLists__c FROM B2C_Instance__c WHERE Name = :instance1.Name];

        Test.stopTest();

        // Validate that the instanceCount for customerLists was increased by one
        System.assert((thisInstanceBefore.Total_CustomerLists__c + 1) == thisInstanceAfter.Total_CustomerLists__c, 'Expected the totalCustomerList count to be incremented by one (1)');

    }

    @IsTest
    static void testSingleInstanceCustomerListDelete() {

        // Initialize local variables
        B2C_Instance__c instance1;
        B2C_Instance__c thisInstanceBefore;
        B2C_Instance__c thisInstanceAfter;
        B2C_CustomerList__c customerList1;
        B2C_CustomerList__c customerList2;

        Test.startTest();

            // Setup a single customerList we can use for testing / validation
            instance1 = (B2C_Instance__c)TestDataFactory.createSObject('B2C_Instance__c', new Map<String,Object>{
                'Name' => 'instance1',
                'API_Url__c' => 'https://instance1.salesforce.com',
                'Is_Active__c' => true
            });

            // Setup a single customerList we can use for testing / validation
            customerList1 = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
                'Name' => 'customerList1',
                'Is_Active__c' => true,
                'API_Url__c' => 'https://clist1.salesforce.com',
                'B2C_Instance__c' => instance1.Id
            });

            // Setup a single customerList we can use for testing / validation
            customerList2 = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
                'Name' => 'customerList2',
                'Is_Active__c' => true,
                'API_Url__c' => 'https://clist2.salesforce.com',
                'B2C_Instance__c' => instance1.Id
            });

            // Retrieve a copy of the instance -- including the current customerList counts
            thisInstanceBefore = [SELECT Id, Name, Total_CustomerLists__c FROM B2C_Instance__c WHERE Name = :instance1.Name];

            // Remove the 2nd customerList
            Database.delete(customerList2);

            // Retrieve a copy of the instance -- after processing the customerList delete
            thisInstanceAfter = [SELECT Id, Name, Total_CustomerLists__c FROM B2C_Instance__c WHERE Name = :instance1.Name];

        Test.stopTest();

        System.debug('--> thisInstanceBefore | ' + thisInstanceBefore);
        System.debug('--> thisInstanceAfter | ' + thisInstanceAfter);

        // Validate that the instanceCount for customerLists was decreased by one
        System.assert((thisInstanceBefore.Total_CustomerLists__c - 1) == thisInstanceAfter.Total_CustomerLists__c, 'Expected the totalCustomerList count to be decremented by one (1)');

    }

    @IsTest
    static void testSingleInstanceCustomerListDeleteToZero() {

        // Initialize local variables
        B2C_Instance__c instance1;
        B2C_Instance__c thisInstanceBefore;
        B2C_Instance__c thisInstanceAfter;
        B2C_CustomerList__c customerList1;

        // Setup a single customerList we can use for testing / validation
        instance1 = (B2C_Instance__c)TestDataFactory.createSObject('B2C_Instance__c', new Map<String,Object>{
            'Name' => 'instance1',
            'API_Url__c' => 'https://instance1.salesforce.com',
            'Is_Active__c' => true
        });

        // Setup a single customerList we can use for testing / validation
        customerList1 = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
            'Name' => 'customerList1',
            'Is_Active__c' => true,
            'API_Url__c' => 'https://clist1.salesforce.com',
            'B2C_Instance__c' => instance1.Id
        });

        Test.startTest();

            // Retrieve a copy of the instance -- including the current customerList counts
            thisInstanceBefore = [SELECT Id, Name, Total_CustomerLists__c FROM B2C_Instance__c WHERE Name = :instance1.Name];

            // Remove the 1st customerList
            Database.delete(customerList1);

            // Retrieve a copy of the instance -- after processing the customerList delete
            thisInstanceAfter = [SELECT Id, Name, Total_CustomerLists__c FROM B2C_Instance__c WHERE Name = :instance1.Name];

        Test.stopTest();

        // Validate that the instanceCount for customerLists was set to zero
        System.assertEquals(0, thisInstanceAfter.Total_CustomerLists__c, 'Expected the totalCustomerList count to be set to zero (0)');

    }

    @IsTest
    static void testSingleInstanceSiteInsert() {

        // Initialize local variables
        B2C_Instance__c instance1;
        B2C_Instance__c thisInstanceBefore;
        B2C_Instance__c thisInstanceAfter;
        B2C_CustomerList__c customerList1;
        B2C_CustomerList__c thisCustomerListBefore;
        B2C_CustomerList__c thisCustomerListAfter;
        B2C_Site__c site1;
        B2C_Site__c site2;

        Test.startTest();

            // Setup a single customerList we can use for testing / validation
            instance1 = (B2C_Instance__c)TestDataFactory.createSObject('B2C_Instance__c', new Map<String,Object>{
                'Name' => 'instance1',
                'API_Url__c' => 'https://instance1.salesforce.com',
                'Is_Active__c' => true
            });

            // Setup a single customerList we can use for testing / validation
            customerList1 = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
                'Name' => 'customerList1',
                'Is_Active__c' => true,
                'API_Url__c' => 'https://clist1.salesforce.com',
                'B2C_Instance__c' => instance1.Id
            });

            // Setup a single site we can use for testing / validation
            site1 = (B2C_Site__c)TestDataFactory.createSObject('B2C_Site__c', new Map<String,Object>{
                'Name' => 'site1',
                'Is_Active__c' => true,
                'Storefront_Name__c' => 'Site 1',
                'API_Url__c' => 'https://site1.salesforce.com',
                'Customer_List__c' => customerList1.Id
            });

            // Retrieve a copy of the instance -- including the current customerList counts
            thisInstanceBefore = [SELECT Id, Name, Total_CustomerLists__c, Total_Sites__c FROM B2C_Instance__c WHERE Name = :instance1.Name];
            thisCustomerListBefore = [SELECT Id, Name, Total_Sites__c FROM B2C_CustomerList__c WHERE Name = :customerList1.Name];

            // Setup a single site we can use for testing / validation
            site2 = (B2C_Site__c)TestDataFactory.createSObject('B2C_Site__c', new Map<String,Object>{
                'Name' => 'site1',
                'Is_Active__c' => true,
                'Storefront_Name__c' => 'Site 2',
                'API_Url__c' => 'https://site2.salesforce.com',
                'Customer_List__c' => customerList1.Id
            });

            // Retrieve a copy of the instance -- after processing the customerList insert
            thisInstanceAfter = [SELECT Id, Name, Total_CustomerLists__c, Total_Sites__c FROM B2C_Instance__c WHERE Name = :instance1.Name];
            thisCustomerListAfter = [SELECT Id, Name, Total_Sites__c FROM B2C_CustomerList__c WHERE Name = :customerList1.Name];

        Test.stopTest();

        // Validate that the instanceCount for customerLists was increased by one
        System.assert((thisCustomerListBefore.Total_Sites__c + 1) == thisCustomerListAfter.Total_Sites__c, 'Expected the totalSites count for the customerList to be incremented by one (1)');
        System.assert((thisInstanceBefore.Total_Sites__c + 1) == thisInstanceAfter.Total_Sites__c, 'Expected the totalSites count for the instance to be incremented by one (1)');

    }

    @IsTest
    static void testSingleInstanceSiteDelete() {

        // Initialize local variables
        B2C_Instance__c instance1;
        B2C_Instance__c thisInstanceBefore;
        B2C_Instance__c thisInstanceAfter;
        B2C_CustomerList__c customerList1;
        B2C_CustomerList__c thisCustomerListBefore;
        B2C_CustomerList__c thisCustomerListAfter;
        B2C_Site__c site1;
        B2C_Site__c site2;

        Test.startTest();

            // Setup a single customerList we can use for testing / validation
            instance1 = (B2C_Instance__c)TestDataFactory.createSObject('B2C_Instance__c', new Map<String,Object>{
                    'Name' => 'instance1',
                    'API_Url__c' => 'https://instance1.salesforce.com',
                    'Is_Active__c' => true
            });

            // Setup a single customerList we can use for testing / validation
            customerList1 = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
                    'Name' => 'customerList1',
                    'Is_Active__c' => true,
                    'API_Url__c' => 'https://clist1.salesforce.com',
                    'B2C_Instance__c' => instance1.Id
            });

            // Setup a single site we can use for testing / validation
            site1 = (B2C_Site__c)TestDataFactory.createSObject('B2C_Site__c', new Map<String,Object>{
                    'Name' => 'site1',
                    'Is_Active__c' => true,
                    'Storefront_Name__c' => 'Site 1',
                    'API_Url__c' => 'https://site1.salesforce.com',
                    'Customer_List__c' => customerList1.Id
            });

            // Setup a second site we can use for testing / validation
            site2 = (B2C_Site__c)TestDataFactory.createSObject('B2C_Site__c', new Map<String,Object>{
                    'Name' => 'site2',
                    'Is_Active__c' => true,
                    'Storefront_Name__c' => 'Site 2',
                    'API_Url__c' => 'https://site2.salesforce.com',
                    'Customer_List__c' => customerList1.Id
            });

            // Retrieve a copy of the instance -- including the current customerList counts
            thisInstanceBefore = [SELECT Id, Name, Total_Sites__c FROM B2C_Instance__c WHERE Name = :instance1.Name];
            thisCustomerListBefore = [SELECT Id, Name, Total_Sites__c FROM B2C_CustomerList__c WHERE Name = :customerList1.Name];

            // Remove the 2nd site
            Database.delete(site2);

            // Retrieve a copy of the instance -- after processing the customerList delete
            thisInstanceAfter = [SELECT Id, Name, Total_Sites__c FROM B2C_Instance__c WHERE Name = :instance1.Name];
            thisCustomerListAfter = [SELECT Id, Name, Total_Sites__c FROM B2C_CustomerList__c WHERE Name = :customerList1.Name];

        Test.stopTest();

        // Validate that the instanceCount for sites was decreased by one
        System.assert((thisInstanceBefore.Total_Sites__c - 1) == thisInstanceAfter.Total_Sites__c, 'Expected the instance totalSite count to be decremented by one (1)');
        System.assert((thisCustomerListBefore.Total_Sites__c - 1) == thisCustomerListAfter.Total_Sites__c, 'Expected the customerList totalSite count to be decremented by one (1)');

    }

    @IsTest
    static void testSingleInstanceSiteDeleteToZero() {

        // Initialize local variables
        B2C_Instance__c instance1;
        B2C_Instance__c thisInstanceBefore;
        B2C_Instance__c thisInstanceAfter;
        B2C_CustomerList__c customerList1;
        B2C_CustomerList__c thisCustomerListBefore;
        B2C_CustomerList__c thisCustomerListAfter;
        B2C_Site__c site1;

        Test.startTest();

            // Setup a single customerList we can use for testing / validation
            instance1 = (B2C_Instance__c)TestDataFactory.createSObject('B2C_Instance__c', new Map<String,Object>{
                    'Name' => 'instance1',
                    'API_Url__c' => 'https://instance1.salesforce.com',
                    'Is_Active__c' => true
            });

            // Setup a single customerList we can use for testing / validation
            customerList1 = (B2C_CustomerList__c)TestDataFactory.createSObject('B2C_CustomerList__c', new Map<String,Object>{
                    'Name' => 'customerList1',
                    'Is_Active__c' => true,
                    'API_Url__c' => 'https://clist1.salesforce.com',
                    'B2C_Instance__c' => instance1.Id
            });

            // Setup a single site we can use for testing / validation
            site1 = (B2C_Site__c)TestDataFactory.createSObject('B2C_Site__c', new Map<String,Object>{
                    'Name' => 'site1',
                    'Is_Active__c' => true,
                    'Storefront_Name__c' => 'Site 1',
                    'API_Url__c' => 'https://site1.salesforce.com',
                    'Customer_List__c' => customerList1.Id
            });

            // Retrieve a copy of the instance -- including the current customerList counts
            thisInstanceBefore = [SELECT Id, Name, Total_Sites__c FROM B2C_Instance__c WHERE Name = :instance1.Name];
            thisCustomerListBefore = [SELECT Id, Name, Total_Sites__c FROM B2C_CustomerList__c WHERE Name = :customerList1.Name];

            // Remove the 2nd site
            Database.delete(site1);

            // Retrieve a copy of the instance -- after processing the customerList delete
            thisInstanceAfter = [SELECT Id, Name, Total_Sites__c FROM B2C_Instance__c WHERE Name = :instance1.Name];
            thisCustomerListAfter = [SELECT Id, Name, Total_Sites__c FROM B2C_CustomerList__c WHERE Name = :customerList1.Name];

        Test.stopTest();

        // Validate that the instanceCount for customerLists was set to zero
        System.assertEquals(0, thisInstanceAfter.Total_Sites__c, 'Expected the instance totalSites count to be set to zero (0)');
        System.assertEquals(0, thisCustomerListAfter.Total_Sites__c, 'Expected the customerList totalSites count to be set to zero (0)');

    }

}
