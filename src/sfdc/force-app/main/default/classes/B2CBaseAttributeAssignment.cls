/**
 * @author Abraham David Lloyd
 * @date May 24th, 2020
 *
 * @description This is the base class used to perform attribute assignments between
 * source B2C Commerce API responses and target Salesforce SObjects (ex. Contact).
*/
public abstract with sharing class B2CBaseAttributeAssignment {

    /**
     * @description Helper function to remove the account-specific PersonAccount properties
     * from a Contact object; we remove these values as they will prevent the Contact from
     * being updated directly if the Person contactModel is enabled
     *
     * @param contactToProcess {SObject} Represents the contact to process
     * @return {SObject} Returns the sObject with the AccountId removed
     */
    public static SObject removePersonAccountProperties(SObject contactToProcess) {

        // Initialize local variables
        String contactAsJSON;
        Map<String, Object> contactMap;
        SObject output;

        // First, serialize the contact as JSON
        contactAsJSON = JSON.serialize(contactToProcess);

        // Convert the contact to a map so that we can manipulate the attributes
        contactMap = new Map<String, Object>(contactToProcess.getPopulatedFieldsAsMap());

        // Loop over the collection of personAccountProperties to remove
        for (String personAccountProperty : B2CConstant.personAccountPropertiesToRemove) {

            // Does the propertyToRemove exist in the contactMap?
            if (contactMap.containsKey(personAccountProperty)) {

                // If so, then remove the property from the Contact
                contactMap.remove(personAccountProperty);

            }

        }

        // Re-serialize the contact details (minus the accountId)
        contactAsJSON = JSON.serialize(contactMap);

        // And finally convert the map to a Contact through deserialization
        output = (SObject)JSON.deserialize(contactAsJSON, Contact.class);

        // Return the output variable
        return output;

    }

    /**
     * @description This method compares the "before" and "after" version of a processed sObject and evaluates
     * if any updates were made to the record.  It does this by iterating over the collection of field mappings
     * and comparing the field values in the "before" and "after" objects.  It collects each of the fieldMappings
     * representing an update / difference between the "before" and "after" sObject versions.
     *
     * @param originalSObject {SObject} Represents a clone of the original sObject being processed (before updates)
     * @param processedSObject {SObject} Represents the processed sObject (with updates; after)
     * @param fieldMappings {List<B2C_Integration_Field_Mappings__mdt>} Represents the collection of field mappings to leverage
     * @return {List<B2C_Integration_Field_Mappings__mdt>} Returns the collection of field mappings that represent updated sObject properties
     */
    public static List<B2C_Integration_Field_Mappings__mdt> getUpdatedFieldMappings(SObject originalSObject, SObject processedSObject, List<B2C_Integration_Field_Mappings__mdt> fieldMappings) {

        // Initialize local variables
        List<B2C_Integration_Field_Mappings__mdt> updatedFieldMappings;
        String coreAttribute;

        // Initialize the collection of updated field mappings
        updatedFieldMappings = new List<B2C_Integration_Field_Mappings__mdt>();

        // Loop over the fieldMappings and evaluate each field
        for (B2C_Integration_Field_Mappings__mdt thisFieldMapping : fieldMappings) {

            // Shorthand references to the core and B2C Commerce attributes
            coreAttribute = thisFieldMapping.Service_Cloud_Attribute__c;

            // Compare the attribute values for the original and processed objects
            if (originalSObject.get(coreAttribute) != processedSObject.get(coreAttribute)) {

                // If they're different, audit the fieldMapping for future use
                updatedFieldMappings.add(thisFieldMapping);

            }

        }

        // Return the collection of updated fieldMappings
        return updatedFieldMappings;

    }

    /**
     * @description This method compares the "before" and "after" version of a processed sObject and evaluates
     * if any updates were made to the record.  It does this by iterating over the collection of field mappings
     * and comparing the field values in the "before" and "after" objects.  If one field is found to have a
     * different value -- then the updated flag is set to true.
     *
     * @param originalSObject {SObject} Represents a clone of the original sObject being processed (before updates)
     * @param processedSObject {SObject} Represents the processed sObject (with updates; after)
     * @param fieldMappings {List<B2C_Integration_Field_Mappings__mdt>} Represents the collection of field mappings to leverage
     * @return {Boolean} Returns true if at least one property was found changed; false if no properties were changed
     */
    public static Boolean hasSObjectBeenUpdated(SObject originalSObject, SObject processedSObject, List<B2C_Integration_Field_Mappings__mdt> fieldMappings) {

        // Initialize local variables
        Boolean hasBeenUpdated;
        String coreAttribute;

        // Default the updated flag
        hasBeenUpdated = false;

        // Loop over the fieldMappings and evaluate each field
        for (B2C_Integration_Field_Mappings__mdt thisFieldMapping : fieldMappings) {

            // Shorthand references to the core and B2C Commerce attributes
            coreAttribute = thisFieldMapping.Service_Cloud_Attribute__c;

            // Compare the attribute values for the original and processed objects
            if (originalSObject.get(coreAttribute) != processedSObject.get(coreAttribute)) {

                // If they're different, set the flag and exit
                hasBeenUpdated = true;
                break;

            }

        }

        // Return the output flag
        return hasBeenUpdated;

    }

    /**
     * @description This method takes a typed sObject, Map / JSONParse representations of the object
     * definition to process, and a collection of fieldMappings identifying which fields to update.  It then
     * evaluates the objects and fieldMappings to determine which fields to update -- and applies those updates
     * to the typed sObject.
     *
     * @param thisObject {SObject} Represents the object being updated
     * @param ObjectJSON {JSONParse} Represents the object definition driving updates
     * @param fieldMappings {List<B2C_Integration_Field_Mappings__mdt>} Represents the collection of fieldMappings to process
     * @return {SObject} Returns the updated SObject with fieldMappings applied
     */
    public static SObject applyMappedFieldValues(SObject thisObject, JSONParse ObjectJSON, List<B2C_Integration_Field_Mappings__mdt> fieldMappings) {

        // Initialize local variables
        Boolean hasSObjProperty;
        Boolean hasJSONObjProperty;
        String thisSObjectType;

        // Initialize the fieldMapping attributes
        String coreAttribute;
        String b2cAttribute;
        Boolean enableForIntegration;
        Boolean consumeB2CUpdates;

        // Initialize the schema properties
        Map<String,Schema.SObjectField> schemaMap;
        Schema.DisplayType fieldDisplayType;

        // Create a reference to the schema map for this object
        thisSObjectType = thisObject.getSObjectType().getDescribe().getName();
        schemaMap = getSchemaMap(thisObject);

        // Loop over the fieldMappings and evaluate / process each one
        for (B2C_Integration_Field_Mappings__mdt thisFieldMapping : fieldMappings) {

            // Shorthand the reference to the integration status
            enableForIntegration = thisFieldMapping.Enable_for_Integration__c;
            consumeB2CUpdates = thisFieldMapping.Consume_Updates_from_B2C_Commerce__c;

            // Skip processing if integration is not enabled for this property or consumingB2CUpdates is disabled
            if (enableForIntegration == false || consumeB2CUpdates == false) { continue; }

            // Shorthand references to the core and B2C Commerce attributes
            coreAttribute = thisFieldMapping.Service_Cloud_Attribute__c;
            b2cAttribute = thisFieldMapping.B2C_Commerce_OCAPI_Attribute__c;

            // Determine if this field exists in the processed JSON object
            hasJSONObjProperty = doesFieldExistInJSONObject(ObjectJSON, b2cAttribute);

            // If this field does not exist in the ObjectJSON, then continue processing fieldMappings
            if (hasJSONObjProperty == false) { continue; }

            // Determine if this field exists in the specified Salesforce object
            hasSObjProperty = doesFieldExist(schemaMap, coreAttribute);

            // If this field does not exist, then continue processing fieldMappings
            if (hasSObjProperty == false) { continue; }

            // Retrieve the schema for the current field being processed
            fieldDisplayType = getFieldDisplayType(schemaMap, thisSObjectType, coreAttribute);

            // If this field display type is empty, then continue processing fieldMappings
            if (fieldDisplayType == null) { continue; }

            // Write the field to the property value specified by parsing it from the JSON field
            thisObject = assignB2CAttributeValue(ObjectJSON, fieldDisplayType, thisObject, coreAttribute, b2cAttribute);

        }

        // Return the updated SObject
        return thisObject;

    }

    /**
     * @see B2CBaseAttributeAssignment.getB2CAttributeStringValue
     * @see B2CBaseAttributeAssignment.getB2CAttributeDecimalValue
     * @see B2CBaseAttributeAssignment.getB2CAttributeIntegerValue
     * @see B2CBaseAttributeAssignment.getB2CAttributeBooleanValue
     * @see B2CBaseAttributeAssignment.getB2CAttributeDateValue
     * @see B2CBaseAttributeAssignment.getB2CAttributeDateTimeValue
     * @description Helper function that assigns b2c attributes and values back to a parent object.
     * This function evaluates the field mapping attribute and casts the attribute value to the appropriate
     * data format for assignment to the SObject.
     *
     * @param b2cProfileJSON {JSONParse} a pre-parsed version of the B2C Profile using the JSONParse library
     * @param fieldSchema {Schema.DisplayType} Represents the schema of the field attribute being evaluated
     * @param parentObject {SObject} Represents the parent object whose attribute is being evaluated and set
     * @param scAttribute {String} Represents the Service Cloud object attribute being evaluated
     * @param b2cAttribute {String} Represents the B2C Commerce attribute being evaluated
     * @return {SObject} Returns the parent object whose attribute value was set by this function
    */
    public static SObject assignB2CAttributeValue(JSONParse b2cProfileJSON, Schema.DisplayType fieldSchema, SObject parentObject, String scAttribute, String b2cAttribute) {

        // Initialize local variables
        String b2cAttributeValueAsString;
        Decimal b2cAttributeValueAsDecimal;
        Integer b2cAttributeValueAsInteger;
        Boolean b2cAttributeValueAsBoolean;
        Date b2cAttributeValueAsDate;
        Datetime b2cAttributeValueAsDateTime;

        // Evaluate if this attribute value should be set as a string
        if (fieldSchema == Schema.DisplayType.STRING ||
            fieldSchema == Schema.DisplayType.TEXTAREA ||
            fieldSchema == Schema.DisplayType.ID ||
            fieldSchema == Schema.DisplayType.PICKLIST ||
            fieldSchema == Schema.DisplayType.REFERENCE ||
            fieldSchema == Schema.DisplayType.PHONE ||
            fieldSchema == Schema.DisplayType.EMAIL ||
            fieldSchema == Schema.DisplayType.URL) {

            // Retrieve the current attribute value as a string for assignment
            b2cAttributeValueAsString = getB2CAttributeStringValue(b2cProfileJSON, b2cAttribute);

            // Assign the derived B2C Attribute value to the contact profile
            parentObject.put(scAttribute, b2cAttributeValueAsString);

        }

        // Next -- evaluate currency and decimal field-types
        else if (fieldSchema == Schema.DisplayType.CURRENCY) {

            // Retrieve the current attribute value as a decimal for assignment
            b2cAttributeValueAsDecimal = getB2CAttributeDecimalValue(b2cProfileJSON, b2cAttribute);

            // Assign the derived B2C Attribute value to the contact profile
            parentObject.put(scAttribute, b2cAttributeValueAsDecimal);

        }

        // Next -- evaluate integers
        else if (fieldSchema == Schema.DisplayType.INTEGER || fieldSchema == Schema.DisplayType.DOUBLE) {

            // Retrieve the current attribute value as a decimal for assignment
            b2cAttributeValueAsInteger = getB2CAttributeIntegerValue(b2cProfileJSON, b2cAttribute);

            // Assign the derived B2C Attribute value to the contact profile
            parentObject.put(scAttribute, b2cAttributeValueAsInteger);

        }

        // Followed by boolean values
        else if (fieldSchema == Schema.DisplayType.BOOLEAN) {

            // Retrieve the current attribute value as a boolean for assignment
            b2cAttributeValueAsBoolean = getB2CAttributeBooleanValue(b2cProfileJSON, b2cAttribute);

            // Assign the derived B2C Attribute value to the contact profile
            parentObject.put(scAttribute, b2cAttributeValueAsBoolean);

        }

        // Next -- evaluate date-time stamps
        else if (fieldSchema == Schema.DisplayType.DATETIME) {

            // Retrieve the current attribute value as a datetime for assignment
            b2cAttributeValueAsDateTime = getB2CAttributeDateTimeValue(b2cProfileJSON, b2cAttribute);

            // Assign the derived B2C Attribute value to the contact profile
            parentObject.put(scAttribute, b2cAttributeValueAsDateTime);

        }

        // Next -- evaluate simple dates
        else if (fieldSchema == Schema.DisplayType.DATE) {

            // Retrieve the current attribute value as a datetime for assignment
            b2cAttributeValueAsDate = getB2CAttributeDateValue(b2cProfileJSON, b2cAttribute);

            // Assign the derived B2C Attribute value to the contact profile
            parentObject.put(scAttribute, b2cAttributeValueAsDate);

        }

        // Return the parent object
        return parentObject;

    }

    /**
     * @description Helper function that converts a string property from its JSON source
     * to the typed value that can then safely be assigned to a source object.
     *
     * @param b2cProfileJSON {JSONParse} a pre-parsed version of the B2C Profile using the JSONParse library
     * @param b2cAttribute {String} Represents the B2C Commerce attribute being evaluated
     * @return {String} Returns the string representation of the attribute being evaluated.
    */
    public static String getB2CAttributeStringValue(JSONParse b2cProfileJSON, String b2cAttribute) {

        // Initialize local variables
        String b2cAttributeValue;

        // Retrieve the string-version of the object attribute
        b2cAttributeValue = b2cProfileJSON.get(b2cAttribute).getStringValue();

        // Return the derived B2C attribute value
        return b2cAttributeValue;

    }

    /**
     * @description Helper function that converts a decimal property from its JSON source
     * to the typed value that can then safely be assigned to a source object.
     *
     * @param b2cProfileJSON {JSONParse} a pre-parsed version of the B2C Profile using the JSONParse library
     * @param b2cAttribute {String} Represents the B2C Commerce attribute being evaluated
     * @return {Decimal} Returns the decimal representation of the attribute being evaluated.
    */
    public static Decimal getB2CAttributeDecimalValue(JSONParse b2cProfileJSON, String b2cAttribute) {

        // Initialize local variables
        Decimal b2cAttributeValue;

        // Retrieve the decimal-version of the object attribute
        b2cAttributeValue = b2cProfileJSON.get(b2cAttribute).getDecimalValue();

        // Return the derived B2C attribute value
        return b2cAttributeValue;

    }

    /**
     * @description Helper function that converts a boolean property from its JSON source
     * to the typed value that can then safely be assigned to a source object.
     *
     * @param b2cProfileJSON {JSONParse} a pre-parsed version of the B2C Profile using the JSONParse library
     * @param b2cAttribute {String} Represents the B2C Commerce attribute being evaluated
     * @return {Boolean} Returns the decimal representation of the attribute being evaluated.
    */
    public static Boolean getB2CAttributeBooleanValue(JSONParse b2cProfileJSON, String b2cAttribute) {

        // Initialize local variables
        Boolean b2cAttributeValue;

        // Retrieve the decimal-version of the object attribute
        b2cAttributeValue = b2cProfileJSON.get(b2cAttribute).getBooleanValue();

        // Return the derived B2C attribute value
        return b2cAttributeValue;

    }

    /**
     * @description Helper function that converts an integer property from its JSON source
     * to the typed value that can then safely be assigned to a source object.
     *
     * @param b2cProfileJSON {JSONParse} a pre-parsed version of the B2C Profile using the JSONParse library
     * @param b2cAttribute {String} Represents the B2C Commerce attribute being evaluated
     * @return {Integer} Returns the Integer representation of the attribute being evaluated.
    */
    public static Integer getB2CAttributeIntegerValue(JSONParse b2cProfileJSON, String b2cAttribute) {

        // Initialize local variables
        Integer b2cAttributeValue;

        // Retrieve the decimal-version of the object attribute
        b2cAttributeValue = b2cProfileJSON.get(b2cAttribute).getIntegerValue();

        // Return the derived B2C attribute value
        return b2cAttributeValue;

    }

    /**
     * @description Helper function that converts a date property from its JSON source
     * to the typed value that can then safely be assigned to a source object.
     *
     * @param b2cProfileJSON {JSONParse} a pre-parsed version of the B2C Profile using the JSONParse library
     * @param b2cAttribute {String} Represents the B2C Commerce attribute being evaluated
     * @return {Date} Returns the Date representation of the attribute being evaluated.
    */
    public static Date getB2CAttributeDateValue(JSONParse b2cProfileJSON, String b2cAttribute) {

        // Initialize local variables
        Date b2cAttributeValue;

        // Retrieve the decimal-version of the object attribute
        b2cAttributeValue = b2cProfileJSON.get(b2cAttribute).getDateValue();

        // Return the derived B2C attribute value
        return b2cAttributeValue;

    }

    /**
     * @description Helper function that converts a date-time property from its JSON source
     * to the typed value that can then safely be assigned to a source object.
     *
     * @param b2cProfileJSON {JSONParse} a pre-parsed version of the B2C Profile using the JSONParse library
     * @param b2cAttribute {String} Represents the B2C Commerce attribute being evaluated
     * @return {Datetime} Returns the Datetime representation of the attribute being evaluated.
    */
    public static Datetime getB2CAttributeDateTimeValue(JSONParse b2cProfileJSON, String b2cAttribute) {

        // Initialize local variables
        Datetime b2cAttributeValue;

        // Retrieve the decimal-version of the object attribute
        b2cAttributeValue = b2cProfileJSON.get(b2cAttribute).getDatetimeValue();

        // Return the derived B2C attribute value
        return b2cAttributeValue;

    }

    /**
     * @description Helper function to determine if a given field exists within an object schema.
     *
     * @param sourceObjectSchema {Map<String,Schema.SObjectField>} Represents the schema of the sObject to inspect
     * @param fieldName {String} Represents the name of the field to evaluate
     * @return {Boolean} Returns true if the field exists -- and false if the field does not exist in the schema
     */
    public static Boolean doesFieldExist(Map<String,Schema.SObjectField> sourceObjectSchema, String fieldName) {

        try {

            // Attempt to validate if the object has the specified field
            return sourceObjectSchema.containsKey(fieldName);

        }

        // Handle errors and return a default value
        catch(Exception ex) {}
        return false;

    }

    /**
     * @description Helper function to determine if a given field exists within a parsed JSON Object
     *
     * @param sourceJSONObj {JSONParse} Represents the parsed JSON Object
     * @param fieldName {String} Represents the name of the field to evaluate
     * @return {Boolean} Returns true if the field exists -- and false if the field does not exist in the schema
     */
    public static Boolean doesFieldExistInJSONObject(JSONParse sourceJSONObj, String fieldName) {

        // Initialize local variables
        JSONParse parsedValue;

        try {

            // Attempt to parse the specified field from the JSON object
            parsedValue = sourceJSONObj.get(fieldName);

            // If the value was parsed -- it exists
            return true;

        }

        // Handle errors and return a default value
        catch(JSONParse.MissingKeyException ex) {}
        return false;

    }

    /**
     * @description Helper function to return the schemaMap for a given sObject
     *
     * @param sourceObject {SObject} Represents the sObject for which the schema will be retrieved
     * @return {Map<String,Schema.SObjectField>} Returns the schemaMap for the specified sObject
     */
    public static Map<String,Schema.SObjectField> getSchemaMap(SObject sourceObject) {

        // Initialize local variables
        String thisSObjectType;
        SObjectType objectSchema;
        Map<String,Schema.SObjectField> schemaMap;

        // Create a reference to the schema map for this object
        thisSObjectType = sourceObject.getSObjectType().getDescribe().getName();
        objectSchema = Schema.getGlobalDescribe().get(thisSObjectType);
        schemaMap = objectSchema.getDescribe().fields.getMap();

        // Return the schema map for the current sObject
        return schemaMap;

    }

    /**
     * @description Helper function to return the fieldDisplayType for a given object schema
     *
     * @param schemaMap {Map<String,Schema.SObjectField>} Represents the fieldSchema for a given sObject
     * @param SObjectType {String} Represents the name of the sObject being processed
     * @param fieldAttribute {String} Represents the attribute for which the displayType will be retrieved
     * @return {Schema.DisplayType} Returns the fieldDisplayType for the specified schema
     */
    public static Schema.DisplayType getFieldDisplayType(Map<String,Schema.SObjectField> schemaMap, String SObjectType, String fieldAttribute) {

        // Initialize local variables
        Schema.SObjectField fieldSchema;
        Schema.DisplayType fieldDisplayType;

        // Retrieve the schema for the current field being processed
        fieldSchema = (Schema.SObjectField) schemaMap.get(fieldAttribute);

        // Validate that the mapping exists in the source object
        if (fieldSchema == null) {

            // TODO Do we throw an error if a field-mapping isn't found
            // Audit that the specific CRM object attribute was not found in the parent object
            System.debug(LoggingLevel.WARN, B2CConstant.buildErrorMessage(B2CConstant.Errors_Common_UnknownFieldMapping, SObjectType, fieldAttribute));

        } else {

            // If the field exists -- then get the field schema details
            fieldDisplayType = fieldSchema.getDescribe().getType();

        }

        // Return the fieldDisplayType that was derived
        return fieldDisplayType;

    }

}
