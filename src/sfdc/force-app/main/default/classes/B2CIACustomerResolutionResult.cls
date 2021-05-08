/**
 * @author Abraham David Lloyd
 * @date May 12th, 2021
 *
 * @see B2CIACustomerResolution.findDupes
 * @description This is the result-processing used by the B2CIACustomerResolution class
 * to return the super-set of resolution results.  It also includes logic to return an
 * error message if duplicate rules fail or are not enabled.
*/
public class B2CIACustomerResolutionResult {

    @InvocableVariable
    public List<Contact> contactList;

    @InvocableVariable
    public Boolean isError;

    @InvocableVariable
    public String errorMessage;

}
