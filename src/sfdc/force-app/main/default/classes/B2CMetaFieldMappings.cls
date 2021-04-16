/**
 * @author Abraham David Lloyd
 * @date May 10th, 2020
 *
 * @description This class is used to manage the field-mappings for Salesforce
 * objects being integrated as part of the B2C tool-kit.  The class accesses
 * field-mappings via customer meta-data describing the B2C Commerce object
 * properties that map back to Salesforce object properties.
*/
public with sharing class B2CMetaFieldMappings extends B2CBaseMeta {

    /**
     * @description This method is used toggle the Salesforce Platform Attributes -- flipping from
     * respecting the standard attribute to the alternate attribute.  The alternate attribute describes
     * an alternate field relationship related to the primary one.
     *
     * @param fieldMappingsToToggle {List<B2C_Integration_Field_Mappings__mdt>} Represents the collection of fieldMappings to toggle
     * @return List<B2C_Integration_Field_Mappings__mdt> Returns a collection of field mappings
     */
    public static List<B2C_Integration_Field_Mappings__mdt> toggleAlternateObjectAttributes(List<B2C_Integration_Field_Mappings__mdt> fieldMappingsToToggle) {

        // Initialize local Variables
        List<B2C_Integration_Field_Mappings__mdt> output;
        String salesforceObjectAttribute;
        String salesforceObjectAttributeAlt;

        // Default the output collection
        output = new List<B2C_Integration_Field_Mappings__mdt>();

        // Loop over the collection of field mappings, and toggle the independent elements
        for (B2C_Integration_Field_Mappings__mdt thisFieldMapping : fieldMappingsToToggle) {

            // Create a reference to the alternate and standard fields
            salesforceObjectAttribute = thisFieldMapping.Service_Cloud_Attribute__c;
            salesforceObjectAttributeAlt = thisFieldMapping.Service_Cloud_Attribute_Alt__c;

            // Only toggle when an alternate mapping is defined
            if (salesforceObjectAttributeAlt != null) {

                // Toggle the Salesforce Platform fieldMappings
                thisFieldMapping.Service_Cloud_Attribute__c = salesforceObjectAttributeAlt;
                thisFieldMapping.Service_Cloud_Attribute_Alt__c = salesforceObjectAttribute;

            }

            // Add the mapping to the output collection
            output.add(thisFieldMapping);

        }

        // Return the output variable
        return output;

    }

    /**
     * @description This method is used to retrieve the collection of multi-cloud
     * active field mappings for a given Salesforce object.
     *
     * @param objectType {String} Represents the name / type of the Salesforce object whose field-mappings are defined
     * @return List<B2C_Integration_Field_Mappings__mdt> Returns a collection of field mappings
     */
    public static List<B2C_Integration_Field_Mappings__mdt> getFieldMappings(String objectType) {

        // Initialize local variables
        List<B2C_Integration_Field_Mappings__mdt> outputFieldMappings;
        String errorMsg;

        // Default the error message
        errorMsg = B2CConstant.buildErrorMessage(B2CConstant.Errors_Meta_FieldMappingObjectNotFound, objectType);

        // Retrieve the collection of field-mappings related to this object
        outputFieldMappings = [
            SELECT  Service_Cloud_Object__c,
                    Service_Cloud_Attribute__c,
                    Service_Cloud_Attribute_Alt__c,
                    B2C_Commerce_OCAPI_Attribute__c,
                    Seed_Property_on_First_Time_Sync__c,
                    Push_Updates_to_B2C_Commerce__c,
                    Consume_Updates_from_B2C_Commerce__c,
                    Enable_for_Integration__c
            FROM    B2C_Integration_Field_Mappings__mdt
            WHERE   Service_Cloud_Object__c = :objectType
                    AND Enable_for_Integration__c = TRUE
        ];

        // Were any records returned by this query?
        testForEmptyRecordSet(outputFieldMappings.size(), errorMsg);

        // Return the field-mapping values
        return outputFieldMappings;

    }

    /**
     * @description This method is used to retrieve the collection of multi-cloud
     * active field mappings for a given Salesforce object that support API retrieval.
     *
     * @param objectType {String} Represents the name / type of the Salesforce object whose field-mappings are being retrieved
     * @return List<B2C_Integration_Field_Mappings__mdt> Returns a collection of field mappings
     */
    public static List<B2C_Integration_Field_Mappings__mdt> getFieldMappingsForRetrieval(String objectType) {

        // Initialize local variables
        List<B2C_Integration_Field_Mappings__mdt> outputFieldMappings;
        String errorMsg;

        // Default the error message
        errorMsg = B2CConstant.buildErrorMessage(B2CConstant.Errors_Meta_FieldMappingObjectNotFound, objectType);

        // Retrieve the collection of field-mappings related to this object
        outputFieldMappings = [
                SELECT  Service_Cloud_Object__c,
                        Service_Cloud_Attribute__c,
                        Service_Cloud_Attribute_Alt__c,
                        B2C_Commerce_OCAPI_Attribute__c,
                        Seed_Property_on_First_Time_Sync__c,
                        Push_Updates_to_B2C_Commerce__c,
                        Consume_Updates_from_B2C_Commerce__c,
                        Enable_for_Integration__c
                FROM    B2C_Integration_Field_Mappings__mdt
                WHERE   Service_Cloud_Object__c = :objectType
                        AND Enable_for_Integration__c = TRUE
                        AND Consume_Updates_from_B2C_Commerce__c = TRUE
        ];

        // Were any records returned by this query?
        testForEmptyRecordSet(outputFieldMappings.size(), errorMsg);

        // Return the field-mapping values
        return outputFieldMappings;

    }

    /**
     * @description This method is used to retrieve the collection of multi-cloud
     * publishable field mappings for a given Salesforce object (ie -- these fields
     * can be published to B2C Commerce
     *
     * @param objectType {String} Represents the name / type of the Salesforce object whose field-mappings are being retrieved
     * @return List<B2C_Integration_Field_Mappings__mdt> Returns a collection of field mappings
     */
    public static List<B2C_Integration_Field_Mappings__mdt> getFieldMappingsForPublishing(String objectType) {

        // Initialize local variables
        List<B2C_Integration_Field_Mappings__mdt> outputFieldMappings;
        String errorMsg;

        // Default the error message
        errorMsg = B2CConstant.buildErrorMessage(B2CConstant.Errors_Meta_FieldMappingObjectNotFound, objectType);

        // Retrieve the collection of field-mappings related to this object
        outputFieldMappings = [
                SELECT  Service_Cloud_Object__c,
                        Service_Cloud_Attribute__c,
                        Service_Cloud_Attribute_Alt__c,
                        B2C_Commerce_OCAPI_Attribute__c,
                        Seed_Property_on_First_Time_Sync__c,
                        Push_Updates_to_B2C_Commerce__c,
                        Consume_Updates_from_B2C_Commerce__c,
                        Enable_for_Integration__c
                FROM    B2C_Integration_Field_Mappings__mdt
                WHERE   Service_Cloud_Object__c = :objectType
                        AND Enable_for_Integration__c = TRUE
                        AND Push_Updates_to_B2C_Commerce__c = TRUE
        ];

        // Were any records returned by this query?
        testForEmptyRecordSet(outputFieldMappings.size(), errorMsg);

        // Return the field-mapping values
        return outputFieldMappings;

    }

}
