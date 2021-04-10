/**
 * @author Abraham David Lloyd
 * @date February 11th, 2021
 *
 * @description This is a helper class that takes the REST API Response from B2C Commerce
 * and moves forward with parsing, processing, and writing updates to the corresponding customerProfile.
*/
global with sharing class B2CIAPublishCustomerProfile extends B2CBaseAttributeAssignment {

    /**
     * @see B2CIAGetAccessTokenResult
     * @description Invokable action to publish a Customer Profile update to B2C Commerce
     *
     * @param requestArguments {List<B2CIAPublishCustomerProfileInput>} Represents the request arguments to process
     * @returns {List<B2CIAPublishCustomerProfileResult>} Returns the response object containing the publish-oriented customer details
     */
    @InvocableMethod(Label='B2C: Publish Customer Profile Definitions' Description='Attempts to publish Salesforce Platform Contact details to mapped B2C Commerce Customer Profiles via the B2C Commerce OCAPI Data API')
    global static List<B2CIAPublishCustomerProfileResult> publishCustomerProfile(List<B2CIAPublishCustomerProfileInput> requestArguments) {

        // Initialize local variables
        Contact thisCustomerProfile;
        SObject thisCustomerProfileToUpdate;
        Integer totalUpdates;
        Map<String, Object> thisB2CProfile;
        List<Contact> contactsToUpdate;
        List<B2C_Integration_Field_Mappings__mdt> fieldMappings;
        List<B2CIAPublishCustomerProfileResult> output;
        B2CIAPublishCustomerProfileResult customerPublishResult;
        String thisB2CProfileJSON;
        JSONParse parsedJSON;
        String accountContactModel;

        // Initialize the request properties
        HttpRequest req;
        Http https;
        HttpResponse res;

        // Start by retrieving the default account / contactModel
        accountContactModel = B2CConfigurationManager.getDefaultAccountContactModel();

        // Initialize the output variable
        output = new List<B2CIAPublishCustomerProfileResult>();
        contactsToUpdate = new List<Contact>();

        // Get the fieldMappings for the customerProfile object
        fieldMappings = B2CMetaFieldMappings.getFieldMappingsForPublishing('Contact');

        // Iterate over the collection of customerProfile results
        for (B2CIAPublishCustomerProfileInput requestInput : requestArguments) {

            // Create a reference to the current CRM Contact
            thisCustomerProfile = requestInput.crmContact;

            // If not, get the publish profile for the current contact record
            thisB2CProfile = B2CContactManager.getPublishProfile(thisCustomerProfile, fieldMappings);

            // Serialize the B2C Profile as a JSON object
            thisB2CProfileJSON = JSON.serializePretty(thisB2CProfile, true);

            // Was a pre-defined profileJSON included in the event?
            if (requestInput.b2cProfileJSON != null && requestInput.b2cProfileJSON.length() > 0) {

                // Otherwise, leverage the pre-defined profileJSON in the response
                thisB2CProfileJSON = requestInput.b2cProfileJSON;

            }

            // Build the request object utilizing the input properties
            req = B2CHttpRequestHelper.getCustomerProfilePatchRequest(requestInput.apiUrl, requestInput.apiVersion, requestInput.accessToken, requestInput.b2cCustomerListId, requestInput.b2cCustomerNo, thisB2CProfileJSON);

            // Initialize the request
            https = new Http();
            res = https.send(req);

            // Initialize the publish result container
            customerPublishResult = new B2CIAPublishCustomerProfileResult();

            // Seed the CRM and B2C versions of the site identifiers
            // These identifiers are used to process future updates to each
            // site record managed by the Salesforce Platform
            customerPublishResult.crmCustomerListId = requestInput.crmCustomerListId;
            customerPublishResult.crmContactId = requestInput.crmContactId;
            customerPublishResult.b2cCustomerListId = requestInput.b2cCustomerListId;
            customerPublishResult.b2cCustomerId = requestInput.b2cCustomerId;
            customerPublishResult.b2cCustomerNo = requestInput.b2cCustomerNo;

            // Write the object representations of the contact and B2C Customer Profile
            customerPublishResult.b2cCustomerProfile = new JSONParse(thisB2CProfileJSON);
            customerPublishResult.crmContact = thisCustomerProfile;

            // Parse the JSON so that we can format the body content
            parsedJSON = new JSONParse(res.getBody());

            // Seed the default properties of the resultObject
            customerPublishResult.status = res.getStatus();
            customerPublishResult.statusCode = res.getStatusCode();
            customerPublishResult.requestPayload = thisB2CProfileJSON;
            customerPublishResult.responseBody = parsedJSON.toStringPretty();
            customerPublishResult.isError = false;

            // Check if the statusCode is found in the response and the response was processed successfully
            if (customerPublishResult.statusCode != 200) {

                // Otherwise, capture the error message
                customerPublishResult.errorMessage = B2CConstant.Errors_OCAPI_Non200ErrorOccurred;
                customerPublishResult.isError = true;

            } else {

                // Calculate and increment total updates to this profile via B2C Commerce Platform Events
                totalUpdates = Integer.valueOf(customerPublishResult.crmContact.get('Total_Updates_to_B2C_Commerce__c'));
                totalUpdates = totalUpdates + 1;

                // Audit the total profile updates and the date an update was last processed
                customerPublishResult.crmContact.put('Total_Updates_to_B2C_Commerce__c', totalUpdates);
                customerPublishResult.crmContact.put('Last_Update_Pushed_to_B2C_Commerce__c', System.Datetime.now());

                // Reset the applied-updates flag -- as updates aren't applied with the publish
                customerPublishResult.crmContact.put('Last_Platform_Event_Processed_Date__c', System.Datetime.now());
                customerPublishResult.crmContact.put('Last_Platform_Event_Applied_Updates__c', false);

                // Create a reference to the customerProfile to update
                thisCustomerProfileToUpdate = (SObject) customerPublishResult.crmContact;

                // Are we currently using the personAccount accountContact model?
                if (accountContactModel == B2CConstant.AccountContactModel_Person) {

                    // Remove the AccountID as we can't update it when the person customerModel is employed
                    thisCustomerProfileToUpdate = removePersonAccountProperties(thisCustomerProfile);

                }

                // Update the CRM Contact with the audit details
                update(thisCustomerProfileToUpdate);

            }

            // Add the result to the output
            output.add(customerPublishResult);

        }

        // Return the output collection
        return output;

    }

}
