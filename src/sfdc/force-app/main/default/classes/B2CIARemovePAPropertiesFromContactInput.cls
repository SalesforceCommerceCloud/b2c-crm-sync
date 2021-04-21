/**
 * @author Abraham David Lloyd
 * @date February 7th, 2021
 *
 * @see B2CIARemovePAPropertiesFromContact.removePersonAccountProperties
 * @description This is a helper-class used by the B2CIARemovePAPropertiesFromContact class
 * to expose the input results for an evaluated Contact.
*/
global class B2CIARemovePAPropertiesFromContactInput {

    ////////////////////////////////////////////////////////////////
    // Include the Contact that will be stripped on PersonAccount properties
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Contact contact;

}
