/**
 * @author Abraham David Lloyd
 * @date May 17th, 2020
 *
 * @description This is a test class that validates B2C Commerce attribute mappings
 * with actual object / Contact mappings.  We want to ensure that every B2C Commerce
 * Contact attribute is correctly represented in the B2C Profile field mappings.
*/
@IsTest
private class B2CMetaFieldMappings_Test {

    // Initialize constants used to drive / inform testing
    private static String metaDataMissingRecordExceptionName = B2CConstant.ERRORS_EXCEPTIONNAME_DATARECORDMISSING;

    /**
     * @see B2CMetaFieldMappings.toggleAlternateObjectAttributes
     * @description Helper method to exercise toggling alternate object attributes.  We use
     * this method to expose personAccount fieldMappings.
     */
    @IsTest
    static void testToggleAlternateObjectAttributes() {

        // Initialize local Variables
        List<B2C_Integration_Field_Mappings__mdt> fieldMappingsToToggle;
        List<B2C_Integration_Field_Mappings__mdt> fieldMappingsOutput;
        List<B2C_Integration_Field_Mappings__mdt> originalFieldMappings;
        B2C_Integration_Field_Mappings__mdt thisOriginalFieldMapping;
        Integer currentRowIndex;

        // Default the rowIndex
        currentRowIndex = 0;

        Test.startTest();

            // Retrieve the fieldMappings to process
            fieldMappingsToToggle = [
                SELECT  Id,
                        DeveloperName,
                        Service_Cloud_Object__c,
                        Service_Cloud_Attribute__c,
                        Service_Cloud_Attribute_Alt__c
                FROM    B2C_Integration_Field_Mappings__mdt
                WHERE   Service_Cloud_Object__c = 'Contact'
            ];

            // Retrieve the field mappings for an object that does not exist (should throw an error)
            fieldMappingsOutput = B2CMetaFieldMappings.toggleAlternateObjectAttributes(fieldMappingsToToggle);

            // Retrieve the fieldMappings to process
            originalFieldMappings = [
                    SELECT  Id,
                            DeveloperName,
                            Service_Cloud_Object__c,
                            Service_Cloud_Attribute__c,
                            Service_Cloud_Attribute_Alt__c
                    FROM    B2C_Integration_Field_Mappings__mdt
                    WHERE   Service_Cloud_Object__c = 'Contact'
            ];

        Test.stopTest();

        // Validate that the fieldMapping toggle was successful
        for (B2C_Integration_Field_Mappings__mdt thisFieldMapping: fieldMappingsOutput) {

            // Retrieve the current fieldMapping row from the original collection
            thisOriginalFieldMapping = originalFieldMappings.get(currentRowIndex);

            // Validate that the fieldMappings have been successfully toggled for the source collection
            System.assertEquals(thisOriginalFieldMapping.Service_Cloud_Attribute_Alt__c, thisFieldMapping.Service_Cloud_Attribute__c, 'Expected the alternateFieldMappings in the original collection to map to the sourceFieldMappings in the new collection');

            // Increment the currentRowIndex
            currentRowIndex++;

        }

    }

    /**
     * @see B2CMetaFieldMappings.getFieldMappings
     * @description This method is used to test the retrieval of field mappings using
     * identifiers that aren't defined.  It tests that failed mapping requests behave
     * consistently and throw an error.
     */
    @IsTest
    static void testRetrieveUndefinedFieldMappings() {

        // Initialize local variables
        List<B2C_Integration_Field_Mappings__mdt> fieldMappings;
        String mappingObjectType;
        String exceptionName;
        Boolean testResult;

        // Default local properties
        mappingObjectType = 'No Field Mappings';
        testResult = false;

        try {

            Test.startTest();

                // Retrieve the field mappings for an object that does not exist (should throw an error)
                fieldMappings = B2CMetaFieldMappings.getFieldMappings(mappingObjectType);

            Test.stopTest();

        } catch (B2CMetaDataRecordMissingException e) {

            // Pull the name / type of the exception
            exceptionName = e.getTypeName();

            // Validate that the exception type
            if (exceptionName == metaDataMissingRecordExceptionName) { testResult = true; }

        }

        // Validate that the right exception was caught by the zero-record look-up
        System.assert(testResult, '--> Wrong Exception Thrown; Expected [' + metaDataMissingRecordExceptionName + '] and Caught [' + exceptionName + ']');

    }

    /**
     * @see B2CMetaFieldMappings.getFieldMappings
     * @description This method attempts to verify that the contact field mappings
     * are well defined and exist on the contact object.
     */
    @IsTest
    static void verifyContactFieldMappings() {

        // Initialize local variables
        List<B2C_Integration_Field_Mappings__mdt> fieldMappings;
        String mappingObjectType;
        Boolean testResult;

        SObjectType objectSchema;
        Map<String,Schema.SObjectField> schemaMap;
        Schema.SObjectField fieldSchema;

        // Initialize the test contact
        mappingObjectType = 'Contact';
        testResult = false;

        Test.startTest();

        // Retrieve the field mappings for the Contact object
        fieldMappings = B2CMetaFieldMappings.getFieldMappings(mappingObjectType);

        Test.stopTest();

        // Get the schema for the current object
        objectSchema = Schema.getGlobalDescribe().get(mappingObjectType);
        schemaMap = objectSchema.getDescribe().fields.getMap();

        // Loop over each of the field-mappings and validate they exist on the Contact
        for (B2C_Integration_Field_Mappings__mdt thisFieldMapping: fieldMappings) {

            // Retrieve the schema for the current field being processed
            fieldSchema = (Schema.SObjectField) schemaMap.get(thisFieldMapping.Service_Cloud_Attribute__c);

            // Audit that the field mapping is being evaluated and include the shorthanded field-schema results
            System.debug(LoggingLevel.WARN, '--> B2C Evaluating Field Mapping --> [' + thisFieldMapping.Service_Cloud_Attribute__c + '] in Contact Schema --> [' + fieldSchema + ']');

            // Was the attribute found?
            if (fieldSchema == null) {

                // Default the test-result value
                testResult = false;

                // Audit that the field mapping was not found
                System.debug(LoggingLevel.WARN, '--> B2C Exception: Could Not Find Field Mapping [' + thisFieldMapping.Service_Cloud_Attribute__c + '] in Contact Schema');

                // Increment the failure count if the field-mapping count not be found
                if (thisFieldMapping.Enable_for_Integration__c == true) {

                    // Only evaluate field-mappings that are active and in-use
                    System.assert(testResult, 'Could Not Find Active Field Mapping --> [' + thisFieldMapping.Service_Cloud_Attribute__c + '] in Contact Schema');

                }

            }

        }

    }

}
