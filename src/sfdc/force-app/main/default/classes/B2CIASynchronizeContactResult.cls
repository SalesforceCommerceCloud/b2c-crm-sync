/**
 * @author Abraham David Lloyd
 * @date April 17th, 2021
 *
 * @see B2CIASynchronizeContact.synchronizeContactProperties
 * @description This is a helper-class used by the B2CIASynchronizeContact class
 * to expose the synchronization processing results for the evaluated Contacts.
*/
global class B2CIASynchronizeContactResult {

    ////////////////////////////////////////////////////////////////
    // Include the Contacts that were processed
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Contact sourceContact;

    @InvocableVariable
    public Contact originalTargetContact;

    @InvocableVariable
    public List<String> missingContactFields;

    @InvocableVariable
    public Contact synchronizedTargetContact;

}
