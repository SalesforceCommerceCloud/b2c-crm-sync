/**
 * @author Abraham David Lloyd
 * @date February 14th, 2021
 *
 * @description This class is used to retrieve the default configuration settings
 * for the B2C CRM Sync application.
 */
public with sharing class B2CConfigurationManager {

    /**
     * @description Helper function retrieves the associated Account Manager / JWT authentication
     * configuration settings that are related to the active configuration.
     * @return {Map<String, String>} Returns a map containing the related accountManager configuration settings
     */
    public static Map<String, String> getAccountManagerSettings() {

        // Initialize local variables
        B2C_CRM_Sync_Default_Configuration__mdt configurationProfile;
        Map<String, String> output;

        // Initialize the output map
        output = new Map<String, String>();

        if (
            // Validate that we have CRUD permissions to access this data
            B2C_CRM_Sync_Default_Configuration__mdt.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_CRM_Sync_Default_Configuration__mdt.fields.DeveloperName.isAccessible() &&
            B2C_CRMSync_Setting__mdt.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_CRMSync_Setting__mdt.fields.Account_Record_Type_Developername__c.isAccessible()
        ) {
            // Get the default configuration profile
            configurationProfile = [
                    SELECT  Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Account_Manager_Url__c,
                            Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Account_Manager_Port__c,
                            Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Account_Manager_Token_Url__c,
                            Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Expiration_in_Minutes__c,
                            Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.JWT_Algorithm__c,
                            Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.JWT_SFCC_Algorithm__c,
                            Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Retry_Count__c,
                            Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Persist_B2C_AuthTokens__c
                    FROM    B2C_CRM_Sync_Default_Configuration__mdt
                    WHERE   DeveloperName = 'Production_Configuration'
                    LIMIT   1
            ];

            // Set the output variable to contain the Account Manager configuration settings to leverage
            output.put('AccountManagerUrl', configurationProfile.Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Account_Manager_Url__c);
            output.put('AccountManagerPort', configurationProfile.Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Account_Manager_Port__c);
            output.put('AccountManagerSuffix', configurationProfile.Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Account_Manager_Token_Url__c);
            output.put('ExpirationInMinutes', String.valueOf(configurationProfile.Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Expiration_in_Minutes__c));
            output.put('JWTSFDCAlgorithm', configurationProfile.Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.JWT_Algorithm__c);
            output.put('JWTSFCCAlgorithm', configurationProfile.Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.JWT_SFCC_Algorithm__c);
            output.put('RetryCount', String.valueOf(configurationProfile.Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Retry_Count__c));
            output.put('PersistAuthTokens', String.valueOf(configurationProfile.Active_Configuration__r.B2C_CRM_Sync_AuthToken_Settings__r.Persist_B2C_AuthTokens__c));
        }

        // Return the associated Account Manager configuration settings
        return output;

    }

    /**
     * @description Helper function retrieves the default businessAccount
     * developerName used for accounts / contacts.
     * @return {String} Returns the developerName for the B2c Business Account
     */
    public static String getAccountRecordTypeDeveloperName() {
        if (
            // Validate that we have CRUD permissions to access this data
            B2C_CRM_Sync_Default_Configuration__mdt.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_CRM_Sync_Default_Configuration__mdt.fields.DeveloperName.isAccessible() &&
            B2C_CRMSync_Setting__mdt.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_CRMSync_Setting__mdt.fields.Account_Record_Type_Developername__c.isAccessible()
        ) {
            // Get the default configuration profile
            B2C_CRM_Sync_Default_Configuration__mdt configurationProfile = [
                SELECT Active_Configuration__r.Account_Record_Type_Developername__c
                FROM B2C_CRM_Sync_Default_Configuration__mdt
                WHERE DeveloperName = 'Production_Configuration'
                LIMIT 1
            ];

            return configurationProfile.Active_Configuration__r.Account_Record_Type_Developername__c;

        }

        return null;

    }

    /**
     * @description Helper function retrieves the default personAccount
     * developerName used for accounts / contacts.
     * @return {String} Returns the developerName for the B2c Person Account
     */
    public static String getPersonAccountRecordTypeDeveloperName() {
        if (
            // Validate that we have CRUD permissions to access this data
            B2C_CRM_Sync_Default_Configuration__mdt.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_CRM_Sync_Default_Configuration__mdt.fields.DeveloperName.isAccessible() &&
            B2C_CRMSync_Setting__mdt.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_CRMSync_Setting__mdt.fields.PersonAccount_Record_Type_Developername__c.isAccessible()
        ) {
            // Get the default configuration profile
            B2C_CRM_Sync_Default_Configuration__mdt configurationProfile = [
                SELECT Active_Configuration__r.PersonAccount_Record_Type_Developername__c
                FROM B2C_CRM_Sync_Default_Configuration__mdt
                WHERE DeveloperName = 'Production_Configuration'
                LIMIT 1
            ];

            // Set the output variable to contain the specified configuration property
            return configurationProfile.Active_Configuration__r.PersonAccount_Record_Type_Developername__c;
        }

        return null;
    }

    /**
     * @description Helper function retrieves the default customerModel based on the
     * configuration profile that is configured.
     * @return {String} Returns the configured customerModel (Standard or Person).
     */
    public static String getDefaultAccountContactModel() {
        if (
            // Validate that we have CRUD permissions to access this data
            B2C_CRM_Sync_Default_Configuration__mdt.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_CRM_Sync_Default_Configuration__mdt.fields.DeveloperName.isAccessible() &&
            B2C_CRMSync_Setting__mdt.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_CRMSync_Setting__mdt.fields.Account_Contact_Model__c.isAccessible()
        ) {
            // Get the default configuration profile
            B2C_CRM_Sync_Default_Configuration__mdt configurationProfile = [
                SELECT Active_Configuration__r.Account_Contact_Model__c
                FROM B2C_CRM_Sync_Default_Configuration__mdt
                WHERE DeveloperName = 'Production_Configuration'
                LIMIT 1
            ];

            return configurationProfile.Active_Configuration__r.Account_Contact_Model__c;

        }

        return null;

    }

    /**
     * @description Helper function that returns the default Account / Contact names.
     * @return {Map<String, String>} Returns the names used to default the Account Name
     * and Contact lastName during the resolution and contact-creation process
     */
    public static Map<String, String> getDefaultAccountContactNames() {

        // Initialize local variables
        B2C_CRM_Sync_Default_Configuration__mdt configurationProfile;
        Map<String, String> output;

        // Initialize the output map
        output = new Map<String, String>();

        if (
            // Validate that we have CRUD permissions to access this data
            B2C_CRM_Sync_Default_Configuration__mdt.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_CRM_Sync_Default_Configuration__mdt.fields.DeveloperName.isAccessible() &&
            B2C_CRMSync_Setting__mdt.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_CRMSync_Setting__mdt.fields.Default_Account_Name__c.isAccessible() &&
            Schema.SObjectType.B2C_CRMSync_Setting__mdt.fields.Default_Contact_Name__c.isAccessible()
        ) {

            // Get the default configuration profile
            configurationProfile = [
                SELECT  Active_Configuration__r.Default_Account_Name__c,
                        Active_Configuration__r.Default_Contact_Name__c
                FROM    B2C_CRM_Sync_Default_Configuration__mdt
                WHERE   DeveloperName = 'Production_Configuration'
                LIMIT   1
            ];

            // Capture and seed the default account / contact names
            output.put('accountName', configurationProfile.Active_Configuration__r.Default_Account_Name__c);
            output.put('contactName', configurationProfile.Active_Configuration__r.Default_Contact_Name__c);

        }

        // Return the output property
        return output;

    }

    /**
     * @description Helper function that retrieves the current default configuration.
     * @return {Boolean} Returns the enabled / active status of the B2C Process Contact trigger
     */
    public static Boolean isB2CProcessContactTriggerEnabled() {

        // Initialize local variables
        B2C_CRM_Sync_Default_Configuration__mdt configurationProfile;
        Boolean output;

        if (
            // Validate that we have CRUD permissions to access this data
            B2C_CRM_Sync_Default_Configuration__mdt.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_CRMSync_Setting__mdt.fields.DeveloperName.isAccessible() &&
            Schema.SObjectType.B2C_CRMSync_Setting__mdt.fields.MasterLabel.isAccessible() &&
            Schema.SObjectType.B2C_CRMSync_Setting__mdt.fields.Enable_B2C_Process_Contact_Trigger__c.isAccessible()
        ) {

            // Get the default configuration profile
            configurationProfile = [
                SELECT  Active_Configuration__r.DeveloperName,
                        Active_Configuration__r.MasterLabel,
                        Active_Configuration__r.Enable_B2C_Process_Contact_Trigger__c
                FROM    B2C_CRM_Sync_Default_Configuration__mdt
                WHERE   DeveloperName = 'Production_Configuration'
                LIMIT   1
            ];

            // Return the enabled status of the B2C ProcessContact Trigger
            output = configurationProfile.Active_Configuration__r.Enable_B2C_Process_Contact_Trigger__c;

        }

        // Return the output value
        return output;

    }

    /**
     * @description Helper function that retrieves the current default configuration.
     * @return {Boolean} Returns the enabled / active status of the B2C ClientID CertValidation trigger
     */
    public static Boolean isB2CClientIDCertValidationTriggerEnabled() {

        // Initialize local variables
        B2C_CRM_Sync_Default_Configuration__mdt configurationProfile;
        Boolean output;

        if (
            // Validate that we have CRUD permissions to access this data
            B2C_CRM_Sync_Default_Configuration__mdt.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_CRMSync_Setting__mdt.fields.DeveloperName.isAccessible() &&
            Schema.SObjectType.B2C_CRMSync_Setting__mdt.fields.MasterLabel.isAccessible() &&
            Schema.SObjectType.B2C_CRMSync_Setting__mdt.fields.Enable_B2C_Process_Contact_Trigger__c.isAccessible()
        ) {

            // Get the default configuration profile
            configurationProfile = [
                SELECT  Active_Configuration__r.DeveloperName,
                        Active_Configuration__r.MasterLabel,
                        Active_Configuration__r.Enable_Client_ID_CertValidation_Trigger__c
                FROM    B2C_CRM_Sync_Default_Configuration__mdt
                WHERE   DeveloperName = 'Production_Configuration'
                LIMIT   1
            ];

            // Return the enabled status of the B2C Client ID certValidation trigger
            output = configurationProfile.Active_Configuration__r.Enable_Client_ID_CertValidation_Trigger__c;

        }

        // Return the output value
        return output;

    }

}
