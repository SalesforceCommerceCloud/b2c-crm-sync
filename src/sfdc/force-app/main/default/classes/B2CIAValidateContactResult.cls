/**
 * @author Abraham David Lloyd
 * @date February 7th, 2021
 *
 * @see B2CIAValidateContact.validateContact
 * @description This is a helper-class used by the B2CIAValidateContact class
 * to expose the validation results for an evaluated Contact.
*/
public class B2CIAValidateContactResult {

    ////////////////////////////////////////////////////////////////
    // Include the dependent objects
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Contact contact;

    @InvocableVariable
    public B2C_CustomerList__c customerList;

    @InvocableVariable
    public B2C_Instance__c b2cInstance;

    @InvocableVariable
    public String processMode;

    ////////////////////////////////////////////////////////////////
    // Define the processMode that was evaluated and result
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Boolean allowIntegrationProcess;

    @InvocableVariable
    public String configurationMessage;

    ////////////////////////////////////////////////////////////////
    // Include the calculated contact processing constraints
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Boolean isInstanceActive;

    @InvocableVariable
    public Boolean isCustomerListActive;

    @InvocableVariable
    public Boolean isContactIntegrationDisabled;

    @InvocableVariable
    public Boolean isProfileRetrievalEnabled;

    @InvocableVariable
    public Boolean isProfilePublishingEnabled;

    @InvocableVariable
    public Boolean isContactCreationEnabled;

    @InvocableVariable
    public Boolean isContactUpdateEnabled;

    /**
     * @description This method is used to set the integration options for the configuration
     * provided (takes the contact, customerList, and processMode -- and sets the integration
     * options for the combination).
     *
     * @param thisContactInput {B2CIAValidateContactInput} Represents the input attributes leverage by this class
     */
    public void setIntegrationOptions(B2CIAValidateContactInput thisContactInput) {

        // Set integration configuration values
        setConfigurationValues(thisContactInput);

        // Validate the processMode
        validateProcessMode();

        // Only continue if integration hasn't been disabled
        if (allowIntegrationProcess == true) {

            // Validate the the global integration controls
            validateGlobalIntegrationControls();

        }

        // Only continue if integration hasn't been disabled (again) --- and we're only evaluating resolution(s)
        if (allowIntegrationProcess == true && this.processMode != B2CConstant.Contact_Integration_ProcessMode_Resolve) {

            // Validate the the process-specific integration controls
            validateProcessIntegrationControls();

        }

    }

    /**
     * @description Helper function to validate that the processMode provided
     * is aligned with configuration expectations.
     */
    private void validateProcessMode() {

        // Validate that supported process modes are defined
        if (!B2CConstant.contactProcessModes.contains(this.processMode)) {

            // Set the configuration message explaining why integration is being disabled
            String errorMessage = B2CConstant.buildErrorMessage(B2CConstant.Errors_IntegrationConfig_UnknownProcessMode, processMode, B2CConstant.contactProcessModes.toString());

            // Set the integration status and error message
            setProcessIntegrationStatus(false, errorMessage);

        }

    }

    /**
     * @description Helper function to evaluate global integration options for
     * customerLists and contact.  If global flags are disabled, there is no need
     * to evaluate the process-level flags.
     */
    private void validateGlobalIntegrationControls() {

        // Initialize local variables
        Boolean output;
        String errorMessage;

        // Is integration disabled on the contact?
        if (contact.B2C_Disable_Integration__c == true) {

            // Set the output variable
            output = false;

            // Set the configuration message explaining why integration is being disabled
            errorMessage = B2CConstant.buildErrorMessage(B2CConstant.Errors_IntegrationConfig_DisabledOnContact, contact.Id);

        // Is the customerList inActive?
        } else if (customerList.Is_Active__c == false) {

            // Set the output variable
            output = false;

            // Set the configuration message explaining why integration is being disabled
            errorMessage = B2CConstant.buildErrorMessage(B2CConstant.Errors_IntegrationConfig_CustomerListIsInActive, customerList.Name);

        // Is the parent b2cInstance inActive?
        } else if (b2cInstance.Is_Active__c == false) {

            // Set the output variable
            output = false;

            // Set the configuration message explaining why integration is being disabled
            errorMessage = B2CConstant.buildErrorMessage(B2CConstant.Errors_IntegrationConfig_InstanceIsInActive, b2cInstance.Name);

        }

        // Was integration disabled?
        if (output == false) {

            // Set the integration status and error message
            setProcessIntegrationStatus(output, errorMessage);

        }

    }

    /**
     * @description Helper function to confirm that the ProcessMode provided
     * is valid and expected.
     */
    private void validateProcessIntegrationControls() {

        // Initialize local variables
        Boolean output;
        String errorMessage;

        // Evaluate the retrieve process-scenario
        if (processMode == B2CConstant.Contact_Integration_ProcessMode_Retrieve) {

            // Is profile retrieval disabled?
            if (isProfileRetrievalEnabled == false) {

                // Set the output variable
                output = false;

                // Set the configuration message explaining why integration is being disabled
                errorMessage = B2CConstant.buildErrorMessage(B2CConstant.Errors_IntegrationConfig_ProfileRetrievalDisabled, customerList.Name);

            // Are contact updates disabled?
            } else if (isContactUpdateEnabled == false) {

                // Set the output variable
                output = false;

                // Set the configuration message explaining why integration is being disabled
                errorMessage = B2CConstant.buildErrorMessage(B2CConstant.Errors_IntegrationConfig_ContactUpdateDisabled, customerList.Name);

            }

        // Evaluate the publish process-scenario
        } else if (processMode == B2CConstant.Contact_Integration_ProcessMode_Publish) {

            // Is profile publishing disabled?
            if (isProfilePublishingEnabled == false) {

                // Set the output variable
                output = false;

                // Set the configuration message explaining why integration is being disabled
                errorMessage = B2CConstant.buildErrorMessage(B2CConstant.Errors_IntegrationConfig_ProfilePublishingDisabled, contact.Id);

            }

        }

        // Was integration disabled?
        if (output == false) {

            // Set the integration status and error message
            setProcessIntegrationStatus(output, errorMessage);

        }

    }

    /**
     * @param supportValue {Boolean} Represents the process integration status
     * @param errorMessage {String} Represents the configuration error message to apply
     */
    private void setProcessIntegrationStatus(Boolean supportValue, String errorMessage) {

        // If the processMode isn't defined -- disable integration
        allowIntegrationProcess = supportValue;

        // Set the configuration message explaining why integration is being disabled
        configurationMessage = errorMessage;

    }

    /**
     * @description This method is used to set the configuration values of this class
     * leverage the inputs provided.  These properties are then evaluated to determine
     * if integration is enabled for the Contact, CustomerList, and processMode specified.
     *
     * @param thisContactInput {B2CIAValidateContactInput} Represents the input attributes used to set configuration values
     */
    private void setConfigurationValues(B2CIAValidateContactInput thisContactInput) {

        // Seed the base variables
        contact = thisContactInput.contact;
        customerList = thisContactInput.customerList;
        b2cInstance = thisContactInput.b2cInstance;
        processMode = thisContactInput.processMode;

        // Default the global configuration flag; automatically assume that the
        // configuration is being enabled -- and then disable via validation
        allowIntegrationProcess = true;

        // Default the global configuration properties
        isInstanceActive = b2cInstance.Is_Active__c;
        isCustomerListActive = customerList.Is_Active__c;
        isContactIntegrationDisabled = contact.B2C_Disable_Integration__c;

        // Default the customerList-managed collection of configuration settings
        isProfileRetrievalEnabled = customerList.Enable_Profile_Retrieval__c;
        isProfilePublishingEnabled = customerList.Enable_Profile_Publishing__c;
        isContactCreationEnabled = customerList.Enable_Profile_Creation__c;
        isContactUpdateEnabled = customerList.Enable_Profile_Updates__c;

    }

}
