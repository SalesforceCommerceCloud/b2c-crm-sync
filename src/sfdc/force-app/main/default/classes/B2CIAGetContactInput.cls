/**
 * @author Abraham David Lloyd
 * @date April 12th, 2021
 *
 * @see B2CIAGetContact.getContact
 * @description This is a helper-class used by the B2CIAGetContact class
 * to retrieve the details for a single Contact limited to required fields
 * and fieldMappings.
*/
global class B2CIAGetContactInput {

    @InvocableVariable
    public String crmContactId;

    @InvocableVariable
    public Boolean omitAccountId;

}
