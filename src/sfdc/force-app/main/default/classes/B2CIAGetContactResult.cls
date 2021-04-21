/**
 * @author Abraham David Lloyd
 * @date April 12th, 2021
 *
 * @see B2CIAGetContact.getContact
 * @description This is the result-processing used by the B2CIAGetContact class
 * to return the details for a single Contact limited to required fields
 * and fieldMappings.
*/
global class B2CIAGetContactResult {

    @InvocableVariable
    public String crmContactId;

    @InvocableVariable
    public Contact crmContact;

    @InvocableVariable
    public Integer crmContactCount;

}
