/**
 * @author Abraham David Lloyd
 * @date April 19th, 2021
 *
 * @see B2CIARemovePAPropertiesFromContact.removePersonAccountProperties
 * @description This is a helper-class used by the B2CIARemovePAPropertiesFromContact class
 * to expose the validation results for an evaluated Contact.
*/
public class B2CIARemovePAPropertiesFromContactResult {

    ////////////////////////////////////////////////////////////////
    // Include the dependent objects
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Contact sourceContact;

    @InvocableVariable
    public Contact processedContact;

}
