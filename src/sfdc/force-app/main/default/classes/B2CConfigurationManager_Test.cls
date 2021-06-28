/**
 * @author Abraham David Lloyd
 * @date May 25th 2021
 *
 * @description This class is used exercise the configurationManager class and access the
 * configuration settings for b2c-crm-sync.
 */
@IsTest
public with sharing class B2CConfigurationManager_Test {

    @IsTest
    public static void getAccountManagerSettingsTest() {

        // Get the default configuration profile
        B2C_CRM_Sync_Default_Configuration__mdt configurationProfile = [
            SELECT  Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Account_Manager_Url__c,
                    Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Account_Manager_Port__c,
                    Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Account_Manager_Token_Url__c,
                    Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Expiration_in_Minutes__c,
                    Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.JWT_Algorithm__c,
                    Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.JWT_SFCC_Algorithm__c
            FROM    B2C_CRM_Sync_Default_Configuration__mdt
            WHERE   DeveloperName = 'Production_Configuration'
            LIMIT   1
        ];

        Test.startTest();

            Map<String, String> accountManagerSettings = B2CConfigurationManager.getAccountManagerSettings();

        Test.stopTest();

        System.assertEquals(
            configurationProfile.Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Account_Manager_Url__c,
            accountManagerSettings.get('AccountManagerUrl'),
            'Could not verify accountManagerUrl via the getAccountManagerSettings() method.'
        );

    }

    @IsTest
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
            'Could not verify that the systemConfiguration accountName is retrievable via the configurationManager'
        );

        System.assertEquals(
            configurationProfile.Active_Configuration__r.Default_Contact_Name__c,
            defaultAccountContactNames.get('contactName'),
            'Could not verify that the systemConfiguration contactName is retrievable via the configurationManager'
        );
    }

    @IsTest
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
            'Could not verify that the B2CProcessContact configuration setting is retrievable via the configurationManager'
        );

    }

    @IsTest
    public static void isJWTCertValidationTriggerEnabled() {
        B2C_CRM_Sync_Default_Configuration__mdt configurationProfile = [
            SELECT  Active_Configuration__r.DeveloperName,
                    Active_Configuration__r.MasterLabel,
                    Active_Configuration__r.Enable_Client_ID_CertValidation_Trigger__c
            FROM    B2C_CRM_Sync_Default_Configuration__mdt
            WHERE   DeveloperName = 'Production_Configuration'
            LIMIT   1
        ];

        Test.startTest();

            Boolean triggerConfigValue = B2CConfigurationManager.isB2CClientIDCertValidationTriggerEnabled();

        Test.stopTest();

        System.assertEquals(
            configurationProfile.Active_Configuration__r.Enable_Client_ID_CertValidation_Trigger__c,
            triggerConfigValue,
            'Could not verify that the jwtCertificateValidation configuration setting is retrievable via the configurationManager'
        );

    }

}
