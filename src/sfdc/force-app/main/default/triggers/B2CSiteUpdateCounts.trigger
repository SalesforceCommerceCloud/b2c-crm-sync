/**
 * @author Abraham David Lloyd
 * @date May 22nd, 2021
 *
 * @description This trigger is used to automate the calculation of siteCounts for CustomerLists and
 * B2C Instances.  When a Site changes, re-calculate the site counts for the parentObjects.
 */
trigger B2CSiteUpdateCounts on B2C_Site__c (after delete, after undelete) {

    try {

        // Do not process this trigger if the control on the trigger is disabled
        if (B2CConfigurationManager.isB2CProcessContactTriggerEnabled() == true ) {

            // If the control is enabled -- the run the count-calculation helper
            B2CUpdateCountsHelper.updateCounts(Trigger.old);

        }

    } catch (Exception e) {}

}
