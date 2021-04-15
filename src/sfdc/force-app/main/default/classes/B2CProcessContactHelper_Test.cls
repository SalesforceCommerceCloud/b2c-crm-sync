/**
 * @author Eric Schultz
 * @date April 11th, 2021
 *
 * @description
*/
@IsTest
private class B2CProcessContactHelper_Test {

    /**
     * @see B2CProcessContactHelper.updateInstanceMap
     * @description
     */
    @IsTest
    static void testMethods() {

        B2C_Instance__c instance = new B2C_Instance__c(
            Name = 'INST',
            API_Url__c = 'https://www.salesforce.com'
        );

        Database.insert( instance );

        B2C_CustomerList__c customerList = new B2C_CustomerList__c(
            Name = 'SF',
            API_Url__c = 'https://www.salesforce.com',
            B2C_Instance__c = instance.Id
        );

        Database.insert( customerList );

        Contact c = new Contact(
            LastName = 'lastname',
            B2C_CustomerList__c = customerList.Id
        );

        Database.insert( c );

        c = [SELECT Id, B2C_Instance__c,B2C_CustomerList__c FROM Contact WHERE Id = :c.Id LIMIT 1];

        Test.startTest();
            Map<String, B2C_CustomerList__c> m = B2CProcessContactHelper.updateCustomerListMap(
                c.B2C_CustomerList_ID__c,
                new Map<String,B2C_CustomerList__c>{
                }
            );

            Map<String, B2C_Instance__c> n = B2CProcessContactHelper.updateInstanceMap(
                c.B2C_Instance__c,
                new Map<String,B2C_Instance__c>{
                }
            );

            B2CProcessContactHelper.getValidateContactInput(
                c,
                instance,
                customerList
            );

        Test.stopTest();

    }
}
