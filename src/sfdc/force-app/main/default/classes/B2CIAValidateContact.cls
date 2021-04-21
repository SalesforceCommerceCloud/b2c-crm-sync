/**
 * @author Abraham David Lloyd
 * @date February 7th, 2021
 *
 * @description This is a helper class takes a given Contact record and validates if the
 * record can be processed.  It evaluates the record as well as the parent B2C Commerce
 * CustomerList to determine if updates should be processed.
*/
public with sharing class B2CIAValidateContact {

    /**
     * @description This class is used to generate Contact processing validation results for a given customerList, instance, and contact.  It
     * processes the integration permissions and active flags for these objects to determine what integration permissions are supported.
     *
     * @param contactsToVerify {List<B2CIAValidateContactInput>} Represents the collection of contactInputs used to infer contact permissions
     * @return {List<B2CIAValidateContactResult>} Represents the collection of validation results for the input arguments
     */
    @InvocableMethod(Label='B2C: Validate Contact Integration Options' Description='Attempts to verify if the Contact being processed is valid, well-formed, and its parent CustomerList is active and integration-enabled.')
    public static List<B2CIAValidateContactResult> validateContact(List<B2CIAValidateContactInput> contactsToVerify) {

        // Initialize local variables
        List<B2CIAValidateContactResult> output;
        B2CIAValidateContactResult thisValidationResult;

        // Initialize the output collection
        output = new List<B2CIAValidateContactResult>();

        // Loop over the collection of contacts to process
        for (B2CIAValidateContactInput thisContactInput : contactsToVerify) {

            // Create an instance of the validationResult
            thisValidationResult = new B2CIAValidateContactResult();

            // Seed and calculate the integration options
            thisValidationResult.setIntegrationOptions(thisContactInput);

            // Add the validationResult to the output collection
            output.add(thisValidationResult);

        }

        // Return the output collection
        return output;

    }

}
