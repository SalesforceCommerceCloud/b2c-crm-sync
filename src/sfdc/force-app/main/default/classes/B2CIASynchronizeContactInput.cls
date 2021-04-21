/**
 * @author Abraham David Lloyd
 * @date April 17th, 2021
 *
 * @see B2CIASynchronizeContact.synchronizeContactProperties
 * @description This is a helper-class used by the B2CIASynchronizeContact class
 * to expose the input results for contacts to be synchronized.
*/
public class B2CIASynchronizeContactInput {

    ////////////////////////////////////////////////////////////////
    // Include the Contacts that will be synchronized
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Contact sourceContact;

    @InvocableVariable
    public Contact targetContact;

}
