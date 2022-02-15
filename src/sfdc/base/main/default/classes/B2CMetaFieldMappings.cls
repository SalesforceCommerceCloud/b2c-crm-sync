/**
 * @author Abraham David Lloyd
 * @date May 10th, 2020
 *
 * @description This class is used to manage the field-mappings for Salesforce
 * objects being integrated as part of the B2C tool-kit.  The class accesses
 * field-mappings via customer meta-data describing the B2C Commerce object
 * properties that map back to Salesforce object properties.
*/
//noinspection LongLine
public with sharing class B2CMetaFieldMappings extends B2CBaseMeta {

    /**
     * @description This method is used toggle the Salesforce Platform Attributes -- flipping from
     * respecting the standard attribute to the alternate attribute.  The alternate attribute describes
     * an alternate field relationship related to the primary one.
     *
     * @param fieldMappingsToToggle {List<B2C_Integration_Field_Mappings__mdt>} Represents the collection
     * of fieldMappings to toggle
     * @return List<B2C_Integration_Field_Mappings__mdt> Returns a collection of field mappings
     */
    public static List<B2C_Integration_Field_Mappings__mdt> toggleAlternateObjectAttributes(
        List<B2C_Integration_Field_Mappings__mdt> fieldMappingsToToggle
    ) {

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
        errorMsg = B2CConstant.buildErrorMessage(B2CConstant.ERRORS_META_FIELDMAPPINGOBJECTNOTFOUND, objectType);

        if (
            // Verify that we can access these fields
            B2C_Integration_Field_Mappings__mdt.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_Integration_Field_Mappings__mdt.fields.Service_Cloud_Object__c.isAccessible() &&
            Schema.SObjectType.B2C_Integration_Field_Mappings__mdt.fields.Service_Cloud_Attribute__c.isAccessible() &&
            Schema.SObjectType.B2C_Integration_Field_Mappings__mdt.fields.Service_Cloud_Attribute_Alt__c.isAccessible() &&
            Schema.SObjectType.B2C_Integration_Field_Mappings__mdt.fields.B2C_Commerce_OCAPI_Attribute__c.isAccessible() &&
            Schema.SObjectType.B2C_Integration_Field_Mappings__mdt.fields.Seed_Property_on_First_Time_Sync__c.isAccessible() &&
            Schema.SObjectType.B2C_Integration_Field_Mappings__mdt.fields.Push_Updates_to_B2C_Commerce__c.isAccessible() &&
            Schema.SObjectType.B2C_Integration_Field_Mappings__mdt.fields.Consume_Updates_from_B2C_Commerce__c.isAccessible() &&
            Schema.SObjectType.B2C_Integration_Field_Mappings__mdt.fields.Enable_for_Integration__c.isAccessible() &&
            Schema.SObjectType.B2C_Integration_Field_Mappings__mdt.fields.Field_Label__c.isAccessible() &&
            Schema.SObjectType.B2C_Integration_Field_Mappings__mdt.fields.Field_Description__c.isAccessible() &&
            Schema.SObjectType.B2C_Integration_Field_Mappings__mdt.fields.Service_Cloud_Object__c.isAccessible() &&
            Schema.SObjectType.B2C_Integration_Field_Mappings__mdt.fields.Enable_for_Integration__c.isAccessible()
        ) {

            // Retrieve the collection of field-mappings related to this object
            outputFieldMappings = [
                SELECT  Service_Cloud_Object__c,
                        Service_Cloud_Attribute__c,
                        Service_Cloud_Attribute_Alt__c,
                        B2C_Commerce_OCAPI_Attribute__c,
                        Seed_Property_on_First_Time_Sync__c,
                        Push_Updates_to_B2C_Commerce__c,
                        Consume_Updates_from_B2C_Commerce__c,
                        Enable_for_Integration__c,
                        Field_Label__c,
                        Field_Description__c
                FROM    B2C_Integration_Field_Mappings__mdt
                WHERE   Service_Cloud_Object__c = :objectType
                AND     Enable_for_Integration__c = TRUE
            ];

            // Were any records returned by this query?
            testForEmptyRecordSet(outputFieldMappings.size(), errorMsg);

        }

        // Return the field-mapping values
        return outputFieldMappings;

    }

    /**
     * @description This method is used to retrieve the collection of multi-cloud
     * active field mappings for a given Salesforce object that support API retrieval.
     *
     * @param objectType {String} Represents the name / type of the Salesforce object whose
     * field-mappings are being retrieved
     * @return List<B2C_Integration_Field_Mappings__mdt> Returns a collection of field mappings
     */
    public static List<B2C_Integration_Field_Mappings__mdt> getFieldMappingsForRetrieval(String objectType) {

        // Initialize local variables
        List<B2C_Integration_Field_Mappings__mdt> outputFieldMappings;
        String errorMsg;

        // Default the error message
        errorMsg = B2CConstant.buildErrorMessage(B2CConstant.ERRORS_META_FIELDMAPPINGOBJECTNOTFOUND, objectType);

        // Retrieve the collection of field-mappings related to this object
        outputFieldMappings = [
                SELECT  Service_Cloud_Object__c,
                        Service_Cloud_Attribute__c,
                        Service_Cloud_Attribute_Alt__c,
                        B2C_Commerce_OCAPI_Attribute__c,
                        B2C_Commerce_Attribute_Type__c,
                        Seed_Property_on_First_Time_Sync__c,
                        Push_Updates_to_B2C_Commerce__c,
                        Consume_Updates_from_B2C_Commerce__c,
                        Enable_for_Integration__c,
                        Field_Label__c,
                        Field_Description__c
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
     * active field mappings for a given Salesforce object that should be rendered in the custom UI.
     *
     * @param objectType {String} Represents the name / type of the Salesforce object whose
     * field-mappings are being retrieved
     * @return List<B2C_Integration_Field_Mappings__mdt> Returns a collection of field mappings
     */
    public static List<B2C_Integration_Field_Mappings__mdt> getFieldMappingsForUIRendering(String objectType) {

        // Initialize local variables
        List<B2C_Integration_Field_Mappings__mdt> outputFieldMappings;
        String errorMsg;

        // Default the error message
        errorMsg = B2CConstant.buildErrorMessage(B2CConstant.ERRORS_META_FIELDMAPPINGOBJECTNOTFOUND, objectType);

        // Retrieve the collection of field-mappings related to this object
        outputFieldMappings = [
                SELECT  Service_Cloud_Object__c,
                        Service_Cloud_Attribute__c,
                        Service_Cloud_Attribute_Alt__c,
                        B2C_Commerce_OCAPI_Attribute__c,
                        B2C_Commerce_Attribute_Type__c,
                        Seed_Property_on_First_Time_Sync__c,
                        Push_Updates_to_B2C_Commerce__c,
                        Consume_Updates_from_B2C_Commerce__c,
                        Enable_for_Integration__c,
                        Field_Label__c,
                        Field_Description__c,
                        Position_in_UI__c
                FROM    B2C_Integration_Field_Mappings__mdt
                WHERE   Service_Cloud_Object__c = :objectType
                        AND Enable_for_Integration__c = TRUE
                        AND Show_in_UI__c = TRUE
                ORDER BY Position_in_UI__c ASC
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
     * @param objectType {String} Represents the name / type of the Salesforce object
     * whose field-mappings are being retrieved
     * @return List<B2C_Integration_Field_Mappings__mdt> Returns a collection of field mappings
     */
    public static List<B2C_Integration_Field_Mappings__mdt> getFieldMappingsForPublishing(String objectType) {

        // Initialize local variables
        List<B2C_Integration_Field_Mappings__mdt> outputFieldMappings;
        String errorMsg;

        // Default the error message
        errorMsg = B2CConstant.buildErrorMessage(B2CConstant.ERRORS_META_FIELDMAPPINGOBJECTNOTFOUND, objectType);

        // Retrieve the collection of field-mappings related to this object
        outputFieldMappings = [
                SELECT  Service_Cloud_Object__c,
                        Service_Cloud_Attribute__c,
                        Service_Cloud_Attribute_Alt__c,
                        B2C_Commerce_OCAPI_Attribute__c,
                        B2C_Commerce_Attribute_Type__c,
                        Seed_Property_on_First_Time_Sync__c,
                        Push_Updates_to_B2C_Commerce__c,
                        Consume_Updates_from_B2C_Commerce__c,
                        Enable_for_Integration__c,
                        Field_Label__c,
                        Field_Description__c,
                        Position_in_UI__c
                FROM    B2C_Integration_Field_Mappings__mdt
                WHERE   Service_Cloud_Object__c = :objectType
                        AND Enable_for_Integration__c = TRUE
                        AND Push_Updates_to_B2C_Commerce__c = TRUE
                ORDER BY Position_in_UI__c ASC
        ];

        // Were any records returned by this query?
        testForEmptyRecordSet(outputFieldMappings.size(), errorMsg);

        // Return the field-mapping values
        return outputFieldMappings;
    }

    /**
     * @description Retrieve the configured field mappings from the given {data}
     *
     * @param customerId {String}  The customer Id
     * @param data {JSONParse} The data retrieved from the B2C Commerce API
     * @param fieldMappings {List<B2C_Integration_Field_Mappings__mdt>} The collection of fieldMappings to process
     *
     * @return {Map<String, Object>} The list of found fields
     */
    public static Map<String, Object> mapFields(String customerId, JSONParse data, List<B2C_Integration_Field_Mappings__mdt> fieldMappings) {
        Map<String, Object> mappedObject = new Map<String, Object>();

        for (B2C_Integration_Field_Mappings__mdt fieldMapping : fieldMappings) {
            try {
                if (fieldMapping.B2C_Commerce_Attribute_Type__c == 'boolean') {
                    mappedObject.put(fieldMapping.Service_Cloud_Attribute__c, data.get(fieldMapping.B2C_Commerce_OCAPI_Attribute__c).getBooleanValue());
                } else if (fieldMapping.B2C_Commerce_Attribute_Type__c == 'integer') {
                    mappedObject.put(fieldMapping.Service_Cloud_Attribute__c, data.get(fieldMapping.B2C_Commerce_OCAPI_Attribute__c).getIntegerValue());
                } else if (fieldMapping.B2C_Commerce_Attribute_Type__c == 'number') {
                    mappedObject.put(fieldMapping.Service_Cloud_Attribute__c, data.get(fieldMapping.B2C_Commerce_OCAPI_Attribute__c).getDecimalValue());
                } else { // By default treat as a string
                    mappedObject.put(fieldMapping.Service_Cloud_Attribute__c, data.get(fieldMapping.B2C_Commerce_OCAPI_Attribute__c).getStringValue());
                }
            } catch (JSONParse.MissingKeyException e) {
                // Log the error but don't abort
                // This probably fires only because the value is not set on the address in the B2C Commerce
                // instance for this address, but the attribute still exists
                System.debug(
                    System.LoggingLevel.ERROR,
                    '--> B2C Exception: The attribute {' + fieldMapping.B2C_Commerce_OCAPI_Attribute__c + '} ' +
                    'has not been found in the given object {' + data.toStringPretty() + '} ' +
                    ' for the customer {' + customerId + '}.'
                );
            }
        }

        mappedObject.put('key', EncodingUtil.ConvertTohex(Crypto.GenerateAESKey(128)));

        return mappedObject;
    }
}
