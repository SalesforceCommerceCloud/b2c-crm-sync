/**
 * @author Abraham David Lloyd
 * @date February 13th, 2021
 *
 * @description This trigger is used to create Platform Events that trigger an
 * update of the Contact with a details of a mapped B2C Commerce Customer Profile.
 */
trigger B2CProcessContact on Contact (before update) {

    try {

        // Only process and evaluate updates to Contacts when the trigger is enabled
        // Do not process this trigger if the AccountContactModel is configured for PersonAccounts
        if (Trigger.isUpdate && B2CConfigurationManager.isB2CProcessContactTriggerEnabled() == true &&
            B2CConfigurationManager.getDefaultAccountContactModel() == B2CConstant.ACCOUNTCONTACTMODEL_STANDARD) {

            // Invoke the trigger handler and process the contactUpdates
            B2CProcessContactHelper.processTrigger(Trigger.new, Trigger.old);

        }

    } catch (Exception e) {

        // Audit that an error was caught
        System.debug(System.LoggingLevel.ERROR, '--> B2C Exception: ' + e.getMessage());

    }

}
