/**
 * @author Abraham David Lloyd
 * @date April 11th, 2021
 *
 * @description This trigger is used to create Platform Events that trigger an
 * update of the PersonAccount with a details of a mapped B2C Commerce Customer Profile.
 */
trigger B2CProcessPersonAccount on Account (before update) {

    try {

        // Only process and evaluate updates to PersonAccounts when the trigger is enabled
        // Do not process this trigger if the AccountContactModel is configured for Accounts / Contacts
        if (Trigger.isUpdate && B2CConfigurationManager.isB2CProcessContactTriggerEnabled() == true &&
                B2CConfigurationManager.getDefaultAccountContactModel() == B2CConstant.ACCOUNTCONTACTMODEL_PERSON) {

            // Process the trigger and handle the personAccount updates
            B2CProcessPersonAccountHelper.processTrigger(Trigger.new, Trigger.old);

        }

    } catch (Exception e) {}

}
