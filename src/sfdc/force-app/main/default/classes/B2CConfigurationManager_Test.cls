
@isTest
public with sharing class B2CConfigurationManager_Test {

    @isTest
    public static void getDefaultAccountContactNames() {

        B2C_CRM_Sync_Default_Configuration__mdt configurationProfile = [
            SELECT  Active_Configuration__r.Default_Account_Name__c,
                    Active_Configuration__r.Default_Contact_Name__c
            FROM    B2C_CRM_Sync_Default_Configuration__mdt
            WHERE   DeveloperName = 'Production_Configuration'
            LIMIT   1
        ];
        Test.startTest();
        Map<String, String> defaultAccountContactNames = B2CConfigurationManager.getDefaultAccountContactNames();
        Test.stopTest();

        System.assertEquals(
            configurationProfile.Active_Configuration__r.Default_Account_Name__c,
            defaultAccountContactNames.get('accountName'), 
            'Retrieve Account Name from config'
        );
        System.assertEquals(
                configurationProfile.Active_Configuration__r.Default_Contact_Name__c,
                defaultAccountContactNames.get('contactName'), 
                'Retrieve Contact Name from config'
        );
    }

    @isTest
    public static void isB2CProcessContactTriggerEnabled() {
        B2C_CRM_Sync_Default_Configuration__mdt configurationProfile = [
                SELECT  Active_Configuration__r.DeveloperName,
                        Active_Configuration__r.MasterLabel,
                        Active_Configuration__r.Enable_B2C_Process_Contact_Trigger__c
                FROM    B2C_CRM_Sync_Default_Configuration__mdt
                WHERE   DeveloperName = 'Production_Configuration'
                LIMIT   1
        ];

        Test.startTest();
        Boolean isB2CProcessContactTriggerEnabled = B2CConfigurationManager.isB2CProcessContactTriggerEnabled();
        Test.stopTest();
        
        System.assertEquals(
            configurationProfile.Active_Configuration__r.Enable_B2C_Process_Contact_Trigger__c,
            isB2CProcessContactTriggerEnabled,
            'Retrieve ProcessContactTrigger from config'
    );
    }
}
