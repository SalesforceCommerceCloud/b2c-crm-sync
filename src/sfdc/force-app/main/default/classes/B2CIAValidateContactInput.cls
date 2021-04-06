/**
 * @author Abraham David Lloyd
 * @date February 7th, 2021
 *
 * @see B2CIAValidateContact.validateContact
 * @description This is a helper-class used by the B2CIAValidateContact class
 * to expose the input results for an evaluated Contact.
*/
global class B2CIAValidateContactInput {

    ////////////////////////////////////////////////////////////////
    // Include the Contact, its related CustomerList, and Instance
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Contact contact;

    @InvocableVariable
    public B2C_CustomerList__c customerList;

    @InvocableVariable
    public B2C_Instance__c b2cInstance;

    ////////////////////////////////////////////////////////////////
    // Define the processMode that will be evaluated
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public String processMode;

}