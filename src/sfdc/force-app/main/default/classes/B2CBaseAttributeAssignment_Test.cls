/**
 * @author Abraham David Lloyd
 * @date May 25th 2020
 *
 * @description This class is used to test the attribute assignment logic used to
 * cast JSON attributes to SObject attributes for a given data-type.
 */
@IsTest
private class B2CBaseAttributeAssignment_Test {

    // Define the name of the test sObject used for validation
    public static String sObjectTypeName = 'B2C_Schema_Test__c';

    // Default the property values that are used to seed the test JSON string
    public static String sourceStringValue = 'This is my test-string value.';
    public static String sourcePicklistValue = 'Value One';
    public static String sourceDecimalValue = '2.0';
    public static String sourceIntegerValue = '2';
    public static String sourceBooleanValue = 'true';
    public static String sourceDateTimeValue = '2019-12-30T15:38:42.000Z';
    public static String sourceDateTimeComparisonValue = '2019-12-30 15:38:42';
    public static String sourceDateValue = '2016-09-16';

    // Default the JSON string that will be used to test assignment methods
    public static String jsonToTest = '{\n' +
        '"testString": "' + sourceStringValue + '",\n' +
        '"testPicklist": "' + sourcePicklistValue + '",\n' +
        '"testDecimal": ' + sourceDecimalValue + ',\n' +
        '"testInteger": ' + sourceIntegerValue + ',\n' +
        '"testBoolean": ' + sourceBooleanValue + ',\n' +
        '"testDateTime": "' + sourceDateTimeValue + '",\n' +
        '"testDate": "' + sourceDateValue + '"\n' +
    '}';

    /**
     * @see B2CBaseAttributeAssignment.assignMissingFieldValues
     * @description This method is used to verify that we can iterate over two
     * objects of a similar type -- and assign the missing fieldValues found
     * in the sourceObject to the targetObject.
     */
    @IsTest
    static void testAssignMissingFieldValues() {

        // Initialize local variables
        SObject sourceContact;
        SObject targetContact;
        Map<String, Object> outputResults;
        List<String> missingFields;
        SObject synchronizedContact;

        // Create test-data representing the source Contact
        sourceContact = TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'Unknown',
            'LastName' => 'User',
            'Email' => 'test@qa.salesforce.com',
            'Description' => 'This is a test description',
            'Title' => 'Test Title'
        });

        // Create test-data representing the target Contact to update
        targetContact = new Contact();
        targetContact.put('FirstName', 'Known');
        targetContact.put('LastName', 'User');
        targetContact.put('Email', 'test@qa.salesforce.com');

        Test.startTest();

            // Attempt to assign the fieldValues missing from the targetContact
            outputResults = B2CBaseAttributeAssignment.assignMissingFieldValues(sourceContact, (SObject) targetContact);

        Test.stopTest();

        // First, validate that the expected outputKeys are found in the outputResults
        System.assert(outputResults.containsKey('missingFields'), ' -- expected to find the key [missingFields] in the outputResults');
        System.assert(outputResults.containsKey('synchronizedObject'), ' -- expected to find the key [synchronizedObject] in the outputResults');

        // Create and cast the references to the individual output values
        missingFields = (List<String>) outputResults.get('missingFields');
        synchronizedContact = (SObject) outputResults.get('synchronizedObject');

        // Validate that the correct number of synchronized fields were found
        System.assert(missingFields.size() == 2, ' -- expected to find [2] missing fields from the target / synchronized object');
        System.assertEquals(synchronizedContact.get('Description'), sourceContact.get('Description'), ' -- expected the [Description] values to be equal between the source and target / synchronized object');
        System.assertEquals(synchronizedContact.get('Title'), sourceContact.get('Title'), ' -- expected the [Title] values to be equal between the source and target / synchronized object');
        System.assertNotEquals(synchronizedContact.get('FirstName'), sourceContact.get('FirstName'), ' -- expected the [FirstName] values to not be equal between the source and target / synchronized object');

    }

    /**
     * @see B2CBaseAttributeAssignment.hasSObjectBeenUpdated
     * @description This method is used to verify that we can identify when
     * fieldUpdates occur to similar sObjects (ex. Contacts) leveraging our
     * collection of fieldMapping definitions.  Should resolve to true.
     */
    @IsTest
    static void testHasSObjectBeenUpdatedSuccess() {

        // Initialize local variables
        SObject sourceContact;
        SObject targetContact;
        List<B2C_Integration_Field_Mappings__mdt> fieldMappings;
        Boolean outputResults;

        // Create test-data representing the source Contact
        sourceContact = TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'Unknown',
            'LastName' => 'User',
            'Email' => 'test@qa.salesforce.com'
        });

        // Create test-data representing the target / updated Contact
        targetContact = TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'Known',
            'LastName' => 'User',
            'Email' => 'test@qa.updated.salesforce.com'
        });

        // Retrieve the fieldMappings collection to exercise in this test
        fieldMappings = B2CMetaFieldMappings.getFieldMappings('Contact');

        Test.startTest();

            // Evaluate if the target sObject (Contact) has had a field in the fieldMappings collection updated
            outputResults = B2CBaseAttributeAssignment.hasSObjectBeenUpdated(sourceContact, targetContact, fieldMappings);

        Test.stopTest();

        // Validate that the targetContact does show that it was updated
        System.assert(outputResults == true, ' -- should be true; the fields in the targetContact have been updated and align with fieldMappings');

    }


    /**
     * @see B2CBaseAttributeAssignment.getUpdatedFieldMappings
     * @description This method is used to verify that we can identify the sObject fields that
     * are updated on a given source sObject.  Should resolve to true.
     */
    @IsTest
    static void testGetUpdatedFieldMappingsSuccess() {

        // Initialize local variables
        SObject sourceContact;
        SObject updatedContact;
        List<B2C_Integration_Field_Mappings__mdt> fieldMappings;
        List<B2C_Integration_Field_Mappings__mdt> outputResults;

        // Create test-data representing the source Contact
        sourceContact = TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'Unknown',
            'LastName' => 'User',
            'Email' => 'test@qa.salesforce.com'
        });

        // Create test-data representing the target / updated Contact
        updatedContact = TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'Unknown',
            'LastName' => 'User',
            'Email' => 'test@qa.updated.salesforce.com'
        });

        // Retrieve the fieldMappings collection to exercise in this test
        fieldMappings = B2CMetaFieldMappings.getFieldMappings('Contact');

        Test.startTest();

            // Retrieve the updated fieldMappings identified when comparing the two Contacts specified
            outputResults = B2CBaseAttributeAssignment.getUpdatedFieldMappings(sourceContact, updatedContact, fieldMappings);

        Test.stopTest();

        // Validate that expected fieldMapping is exposed by the method being tested
        System.assertEquals(outputResults.size(), 1, 'Expected that a single fieldMapping is returned (email was updated)');
        System.assertEquals(outputResults.get(0).Service_Cloud_Attribute__c, 'Email', ' Expected that Email is the fieldMapping definition that was identified');

    }

    /**
       * @see B2CBaseAttributeAssignment.hasSObjectBeenUpdated
       * @description This method is used to verify that we can identify when
       * fieldUpdates occur to similar sObjects (ex. Contacts) leveraging our
       * collection of fieldMapping definitions.  Should resolve to false and
       * not detect any field updates -- as we're cloning the sourceContact.
       */
    @IsTest
    static void testHasSObjectBeenUpdatedFailure() {

        // Initialize local variables
        SObject sourceContact;
        SObject targetContact;
        List<B2C_Integration_Field_Mappings__mdt> fieldMappings;
        Boolean outputResults;

        // Create test-data representing the source Contact
        sourceContact = TestDataFactory.createSObject('Contact', new Map<String,Object>{
            'FirstName' => 'Unknown',
            'LastName' => 'User',
            'Email' => 'test@qa.salesforce.com'
        });

        // Create test-data representing the target / updated Contact (cloned; no updates)
        targetContact = sourceContact.clone(true, true);

        // Retrieve the fieldMappings collection to exercise in this test
        fieldMappings = B2CMetaFieldMappings.getFieldMappings('Contact');

        Test.startTest();

            // Evaluate if the target sObject (Contact) has had a field in the fieldMappings collection updated
            outputResults = B2CBaseAttributeAssignment.hasSObjectBeenUpdated(sourceContact, targetContact, fieldMappings);

        Test.stopTest();

        // Validate that the targetContact does show that it was updated
        System.assert(outputResults == false, ' -- should be false; the fields in the targetContact have not been updated');

    }

    /**
     * @see B2CBaseAttributeAssignment.applyMappedFieldValues
     * @description This method is used to validate that invalid source
     * field mappings are skipped but does not impede processing of other
     * correctly mapped fields.
     */
    @IsTest
    static void testInvalidSourceObjectFieldMappings() {

        // Initialize local variables
        JSONParse b2cObjectJSON;
        SObject testObject;
        List<B2C_Integration_Field_Mappings__mdt> fieldMappings;
        B2C_Integration_Field_Mappings__mdt thisFieldMapping;
        String postAssignmentStringValue;

        // Create the JSON to parse
        b2cObjectJSON = new JSONParse(jsonToTest);

        // Create the sObject to populate
        testObject = Schema.getGlobalDescribe().get(sObjectTypeName).newSObject();

        // Create the field mapping collection
        fieldMappings = new List<B2C_Integration_Field_Mappings__mdt>();

        // Create an instance of a fieldMapping string definition
        thisFieldMapping = new B2C_Integration_Field_Mappings__mdt();
        thisFieldMapping.Service_Cloud_Object__c = 'B2C_Schema_Test__c';
        thisFieldMapping.Service_Cloud_Attribute__c = 'String_Field__c';
        thisFieldMapping.B2C_Commerce_OCAPI_Attribute__c = 'testString';
        thisFieldMapping.Enable_for_Integration__c = true;
        thisFieldMapping.Consume_Updates_from_B2C_Commerce__c = true;
        thisFieldMapping.Seed_Property_on_First_Time_Sync__c = true;

        // Add the fieldMapping to the collection
        fieldMappings.add(thisFieldMapping);

        // Create an instance of a fieldMapping string definition
        thisFieldMapping = new B2C_Integration_Field_Mappings__mdt();
        thisFieldMapping.Service_Cloud_Object__c = 'B2C_Schema_Test__c';
        thisFieldMapping.Service_Cloud_Attribute__c = 'Textarea_Field__c';
        thisFieldMapping.B2C_Commerce_OCAPI_Attribute__c = 'unmappedTestString';
        thisFieldMapping.Enable_for_Integration__c = true;
        thisFieldMapping.Consume_Updates_from_B2C_Commerce__c = true;
        thisFieldMapping.Seed_Property_on_First_Time_Sync__c = true;

        // Add the fieldMapping to the collection
        fieldMappings.add(thisFieldMapping);

        Test.startTest();

            // Invoke the assignment function and validate the string-value
            testObject = B2CBaseAttributeAssignment.applyMappedFieldValues(testObject, b2cObjectJSON, fieldMappings);

            // Get the string assignment values after processing the field mappings
            postAssignmentStringValue = String.valueOf(testObject.get('String_Field__c'));

        Test.stopTest();

        // Evaluate each of the fields for valid / expected values for the string fields
        System.assert(postAssignmentStringValue == sourceStringValue, '--> Expected [' + postAssignmentStringValue + '] to equal [' + sourceStringValue + ']');

    }

    /**
     * @see B2CBaseAttributeAssignment.applyMappedFieldValues
     * @description This method is used to validate that fields can be applied
     * to sObjects from parsedJSON and driven by meta-data mappings describing
     * which B2C Commerce fields map to which sObject fields
     */
    @IsTest
    static void testApplyMappedFieldStringValues() {

        // Initialize local variables
        JSONParse b2cObjectJSON;
        SObject testObject;
        List<B2C_Integration_Field_Mappings__mdt> fieldMappings;
        B2C_Integration_Field_Mappings__mdt thisFieldMapping;
        String postAssignmentStringValue;
        String postAssignmentPicklistValue;
        String postAssignmentTextareaValue;

        // Create the JSON to parse
        b2cObjectJSON = new JSONParse(jsonToTest);

        // Create the sObject to populate
        testObject = Schema.getGlobalDescribe().get(sObjectTypeName).newSObject();

        // Create the field mapping collection
        fieldMappings = new List<B2C_Integration_Field_Mappings__mdt>();

        // Create an instance of a fieldMapping string definition
        thisFieldMapping = new B2C_Integration_Field_Mappings__mdt();
        thisFieldMapping.Service_Cloud_Object__c = 'B2C_Schema_Test__c';
        thisFieldMapping.Service_Cloud_Attribute__c = 'String_Field__c';
        thisFieldMapping.B2C_Commerce_OCAPI_Attribute__c = 'testString';
        thisFieldMapping.Enable_for_Integration__c = true;
        thisFieldMapping.Consume_Updates_from_B2C_Commerce__c = true;
        thisFieldMapping.Seed_Property_on_First_Time_Sync__c = true;

        // Add the fieldMapping to the collection
        fieldMappings.add(thisFieldMapping);

        // Create an instance of a fieldMapping string definition
        thisFieldMapping = new B2C_Integration_Field_Mappings__mdt();
        thisFieldMapping.Service_Cloud_Object__c = 'B2C_Schema_Test__c';
        thisFieldMapping.Service_Cloud_Attribute__c = 'Textarea_Field__c';
        thisFieldMapping.B2C_Commerce_OCAPI_Attribute__c = 'testString';
        thisFieldMapping.Enable_for_Integration__c = true;
        thisFieldMapping.Consume_Updates_from_B2C_Commerce__c = true;
        thisFieldMapping.Seed_Property_on_First_Time_Sync__c = true;

        // Add the fieldMapping to the collection
        fieldMappings.add(thisFieldMapping);

        // Create an instance of a fieldMapping string definition
        thisFieldMapping = new B2C_Integration_Field_Mappings__mdt();
        thisFieldMapping.Service_Cloud_Object__c = 'B2C_Schema_Test__c';
        thisFieldMapping.Service_Cloud_Attribute__c = 'Picklist_Field__c';
        thisFieldMapping.B2C_Commerce_OCAPI_Attribute__c = 'testPicklist';
        thisFieldMapping.Enable_for_Integration__c = true;
        thisFieldMapping.Consume_Updates_from_B2C_Commerce__c = true;
        thisFieldMapping.Seed_Property_on_First_Time_Sync__c = true;

        // Add the fieldMapping to the collection
        fieldMappings.add(thisFieldMapping);

        Test.startTest();

            // Invoke the assignment function and validate the string-value
            testObject = B2CBaseAttributeAssignment.applyMappedFieldValues(testObject, b2cObjectJSON, fieldMappings);

            // Get the string assignment values after processing the field mappings
            postAssignmentStringValue = String.valueOf(testObject.get('String_Field__c'));
            postAssignmentPicklistValue = String.valueOf(testObject.get('Picklist_Field__c'));
            postAssignmentTextareaValue = String.valueOf(testObject.get('Textarea_Field__c'));

        Test.stopTest();

        // Evaluate each of the fields for valid / expected values for the string fields
        System.assert(postAssignmentStringValue == sourceStringValue, '--> Expected [' + postAssignmentStringValue + '] to equal [' + sourceStringValue + ']');
        System.assert(postAssignmentPicklistValue == sourcePicklistValue, '--> Expected [' + postAssignmentPicklistValue + '] to equal [' + sourcePicklistValue + ']');
        System.assert(postAssignmentTextareaValue == sourceStringValue, '--> Expected [' + postAssignmentTextareaValue + '] to equal [' + sourceStringValue + ']');

    }

    /**
     * @see B2CBaseAttributeAssignment.assignB2CAttributeValue
     * @description This method is used to validate the assignment of dateTime
     * values to sObject properties from JSON objects
     */
    @IsTest
    static void testDateTimeB2CAttributeAssignment() {

        // Initialize local variables
        JSONParse b2cObjectJSON;
        Map<String,Schema.SObjectField> schemaMap;
        Schema.DisplayType fieldDisplayType;
        SObject testObject;
        String sfDateTimeAttribute;
        String b2cDateTimeAttribute;
        Datetime dateTimeValue;

        // Define the testObject name
        sfDateTimeAttribute = 'DateTime_Field__c';
        b2cDateTimeAttribute = 'testDateTime';

        // Create the parsed JSON and SObjects
        b2cObjectJSON = new JSONParse(jsonToTest);
        testObject = Schema.getGlobalDescribe().get(sObjectTypeName).newSObject();
        schemaMap = B2CBaseAttributeAssignment.getSchemaMap(testObject);

        Test.startTest();

            // Attempt to assign the specified date-time value to the parent sObject
            fieldDisplayType = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, sfDateTimeAttribute);
            testObject = B2CBaseAttributeAssignment.assignB2CAttributeValue(b2cObjectJSON, fieldDisplayType, testObject, sfDateTimeAttribute, b2cDateTimeAttribute);

            // Get the set value in a valid datetime format
            dateTimeValue = (Datetime)testObject.get(sfDateTimeAttribute);

        Test.stopTest();

        // Validate that the datetime-field value was set to the corresponding sObject property
        System.assert(String.valueOfGmt(dateTimeValue) == sourceDateTimeComparisonValue, '--> Expected [' + String.valueOfGmt(dateTimeValue) + '] to equal [' + sourceDateTimeComparisonValue + ']');

    }

    /**
     * @see B2CBaseAttributeAssignment.assignB2CAttributeValue
     * @description This method is used to validate the assignment of date
     * values to sObject properties from JSON objects
     */
    @IsTest
    static void testDateB2CAttributeAssignment() {

        // Initialize local variables
        JSONParse b2cObjectJSON;
        Map<String,Schema.SObjectField> schemaMap;
        Schema.DisplayType fieldDisplayType;
        SObject testObject;
        String sfDateAttribute;
        String b2cDateAttribute;

        // Define the testObject name
        sfDateAttribute = 'Date_Field__c';
        b2cDateAttribute = 'testDate';

        // Create the parsed JSON and SObjects
        b2cObjectJSON = new JSONParse(jsonToTest);
        testObject = Schema.getGlobalDescribe().get(sObjectTypeName).newSObject();
        schemaMap = B2CBaseAttributeAssignment.getSchemaMap(testObject);

        Test.startTest();

            // Attempt to assign the specified date value to the parent sObject
            fieldDisplayType = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, sfDateAttribute);
            testObject = B2CBaseAttributeAssignment.assignB2CAttributeValue(b2cObjectJSON, fieldDisplayType, testObject, sfDateAttribute, b2cDateAttribute);

        Test.stopTest();

        // Validate that the date-field value was set to the corresponding sObject property
        System.assert(testObject.get(sfDateAttribute) == Date.valueOf(sourceDateValue), '--> Expected [' + testObject.get(sfDateAttribute) + '] to equal [' + sourceDateValue + ']');

    }

    /**
     * @see B2CBaseAttributeAssignment.assignB2CAttributeValue
     * @description This method is used to validate the assignment of integer
     * values to sObject properties from JSON objects
     */
    @IsTest
    static void testBooleanB2CAttributeAssignment() {

        // Initialize local variables
        JSONParse b2cObjectJSON;
        Map<String,Schema.SObjectField> schemaMap;
        Schema.DisplayType fieldDisplayType;
        SObject testObject;
        String sfBooleanAttribute;
        String b2cBooleanAttribute;

        // Define the testObject name
        sfBooleanAttribute = 'Boolean_Field__c';
        b2cBooleanAttribute = 'testBoolean';

        // Create the parsed JSON and SObjects
        b2cObjectJSON = new JSONParse(jsonToTest);
        testObject = Schema.getGlobalDescribe().get(sObjectTypeName).newSObject();
        schemaMap = B2CBaseAttributeAssignment.getSchemaMap(testObject);

        Test.startTest();

            // Attempt to assign the specified boolean value to the parent sObject
            fieldDisplayType = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, sfBooleanAttribute);
            testObject = B2CBaseAttributeAssignment.assignB2CAttributeValue(b2cObjectJSON, fieldDisplayType, testObject, sfBooleanAttribute, b2cBooleanAttribute);

        Test.stopTest();

        // Validate that the boolean-field value was set to the corresponding sObject property
        System.assert(testObject.get(sfBooleanAttribute) == Boolean.valueOf(sourceBooleanValue), '--> Expected [' + testObject.get(sfBooleanAttribute) + '] to equal [' + sourceBooleanValue + ']');

    }

    /**
     * @see B2CBaseAttributeAssignment.assignB2CAttributeValue
     * @description This method is used to validate the assignment of integer
     * values to sObject properties from JSON objects
     */
    @IsTest
    static void testIntegerB2CAttributeAssignment() {

        // Initialize local variables
        JSONParse b2cObjectJSON;
        Map<String,Schema.SObjectField> schemaMap;
        Schema.DisplayType fieldDisplayType;
        SObject testObject;
        String sfIntegerAttribute;
        String b2cIntegerAttribute;

        // Define the testObject name
        sfIntegerAttribute = 'Integer_Field__c';
        b2cIntegerAttribute = 'testInteger';

        // Create the parsed JSON and SObjects
        b2cObjectJSON = new JSONParse(jsonToTest);
        testObject = Schema.getGlobalDescribe().get(sObjectTypeName).newSObject();
        schemaMap = B2CBaseAttributeAssignment.getSchemaMap(testObject);

        Test.startTest();

            // Attempt to assign the specified integer value to the parent sObject
            fieldDisplayType = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, sfIntegerAttribute);
            testObject = B2CBaseAttributeAssignment.assignB2CAttributeValue(b2cObjectJSON, fieldDisplayType, testObject, sfIntegerAttribute, b2cIntegerAttribute);

        Test.stopTest();

        // Validate that the integer-field value was set to the sObject's corresponding fields
        System.assert(testObject.get(sfIntegerAttribute) == Decimal.valueOf(sourceIntegerValue), '--> Expected [' + testObject.get(sfIntegerAttribute) + '] to equal [' + sourceIntegerValue + ']');

    }

    /**
     * @see B2CBaseAttributeAssignment.assignB2CAttributeValue
     * @description This method is used to validate the assignment of currency
     * values to sObject properties from JSON objects
     */
    @IsTest
    static void testCurrencyB2CAttributeAssignment() {

        // Initialize local variables
        JSONParse b2cObjectJSON;
        Map<String,Schema.SObjectField> schemaMap;
        Schema.DisplayType fieldDisplayType;
        SObject testObject;
        String sfCurrencyAttribute;
        String b2cCurrencyAttribute;

        // Define the testObject name
        sfCurrencyAttribute = 'Currency_Field__c';
        b2cCurrencyAttribute = 'testDecimal';

        // Create the parsed JSON and SObjects
        b2cObjectJSON = new JSONParse(jsonToTest);
        testObject = Schema.getGlobalDescribe().get(sObjectTypeName).newSObject();
        schemaMap = B2CBaseAttributeAssignment.getSchemaMap(testObject);

        Test.startTest();

            // Attempt to assign the specified currency value to the parent sObject
            fieldDisplayType = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, sfCurrencyAttribute);
            testObject = B2CBaseAttributeAssignment.assignB2CAttributeValue(b2cObjectJSON, fieldDisplayType, testObject, sfCurrencyAttribute, b2cCurrencyAttribute);

        Test.stopTest();

        // Validate that the currency-field value was set across the different strings supported by our sObject
        System.assert(testObject.get(sfCurrencyAttribute) == Decimal.valueOf(sourceDecimalValue), '--> Expected [' + testObject.get(sfCurrencyAttribute) + '] to equal [' + sourceDecimalValue + ']');

    }

    /**
     * @see B2CBaseAttributeAssignment.assignB2CAttributeValue
     * @description This method is used to validate the assignment of string
     * values to sObject properties from JSON objects
     */
    @IsTest
    static void testStringB2CAttributeAssignment() {

        // Initialize local variables
        JSONParse b2cObjectJSON;
        Map<String,Schema.SObjectField> schemaMap;
        Schema.DisplayType fieldDisplayType;
        SObject testObject;
        String sfStringAttribute;
        String sfPicklistAttribute;
        String sfTextAreaAttribute;
        String b2cStringAttribute;
        String b2cPicklistAttribute;

        // Define the testObject name
        sfStringAttribute = 'String_Field__c';
        sfPicklistAttribute = 'Picklist_Field__c';
        sfTextAreaAttribute = 'Textarea_Field__c';
        b2cStringAttribute = 'testString';
        b2cPicklistAttribute = 'testPicklist';

        // Create the parsed JSON and SObjects
        b2cObjectJSON = new JSONParse(jsonToTest);
        testObject = Schema.getGlobalDescribe().get(sObjectTypeName).newSObject();
        schemaMap = B2CBaseAttributeAssignment.getSchemaMap(testObject);

        Test.startTest();

            // Attempt to assign the specified string value to the parent sObject
            fieldDisplayType = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, sfStringAttribute);
            testObject = B2CBaseAttributeAssignment.assignB2CAttributeValue(b2cObjectJSON, fieldDisplayType, testObject, sfStringAttribute, b2cStringAttribute);

            // Attempt to assign the specified pickList value to the parent sObject
            fieldDisplayType = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, sfPicklistAttribute);
            testObject = B2CBaseAttributeAssignment.assignB2CAttributeValue(b2cObjectJSON, fieldDisplayType, testObject, sfPicklistAttribute, b2cPicklistAttribute);

            // Attempt to assign the specified textArea value to the parent sObject
            fieldDisplayType = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, sfTextAreaAttribute);
            testObject = B2CBaseAttributeAssignment.assignB2CAttributeValue(b2cObjectJSON, fieldDisplayType, testObject, sfTextAreaAttribute, b2cStringAttribute);

        Test.stopTest();

        // Validate that the string-field value was set across the different strings supported by our sObject
        System.assert(testObject.get(sfStringAttribute) == sourceStringValue, '--> Expected [' + testObject.get(sfStringAttribute) + '] to equal [' + sourceStringValue + ']');
        System.assert(testObject.get(sfPicklistAttribute) == sourcePicklistValue, '--> Expected [' + testObject.get(sfPicklistAttribute) + '] to equal [' + sourcePicklistValue + ']');
        System.assert(testObject.get(sfTextAreaAttribute) == sourceStringValue, '--> Expected [' + testObject.get(sfTextAreaAttribute) + '] to equal [' + sourceStringValue + ']');

    }

    /**
     * @see B2CBaseAttributeAssignment.getB2CAttributeStringValue
     * @description This method is used to exercise string assignment and string
     * conversion of JSON values.  It validates that multiple data-types covert
     * back to a string successfully via the JSON parser being employed.
     */
    @IsTest
    static void testStringAssignment() {

        // Initialize local variables
        String assignedStringValue;
        String assignedDecimalValue;
        String assignedIntegerValue;
        String assignedBooleanValue;
        String assignedDateTimeValue;
        String assignedDateValue;
        JSONParse parsedJSON;

        // Parse the test JSON string
        parsedJSON = new JSONParse(jsonToTest);

        Test.startTest();

            // Retrieve the string versions of each data-type included in JSON that was parsed
            assignedStringValue = B2CBaseAttributeAssignment.getB2CAttributeStringValue(parsedJSON, 'testString');
            assignedDecimalValue = B2CBaseAttributeAssignment.getB2CAttributeStringValue(parsedJSON, 'testDecimal');
            assignedIntegerValue = B2CBaseAttributeAssignment.getB2CAttributeStringValue(parsedJSON, 'testInteger');
            assignedBooleanValue = B2CBaseAttributeAssignment.getB2CAttributeStringValue(parsedJSON, 'testBoolean');
            assignedDateTimeValue = B2CBaseAttributeAssignment.getB2CAttributeStringValue(parsedJSON, 'testDateTime');
            assignedDateValue = B2CBaseAttributeAssignment.getB2CAttributeStringValue(parsedJSON, 'testDate');

        Test.stopTest();

        // Validate the string processing results
        System.assert(sourceStringValue == assignedStringValue, '--> Expected [' + sourceStringValue + '] and validated [' + assignedStringValue + ']');
        System.assert(sourceDecimalValue == assignedDecimalValue, '--> Expected [' + sourceDecimalValue + '] and validated [' + assignedDecimalValue + ']');
        System.assert(sourceIntegerValue == assignedIntegerValue, '--> Expected [' + sourceDecimalValue + '] and validated [' + assignedDecimalValue + ']');
        System.assert(sourceBooleanValue == assignedBooleanValue, '--> Expected [' + sourceDecimalValue + '] and validated [' + assignedDecimalValue + ']');
        System.assert(sourceDateTimeValue == assignedDateTimeValue, '--> Expected [' + sourceDecimalValue + '] and validated [' + assignedDecimalValue + ']');
        System.assert(sourceDateValue == assignedDateValue, '--> Expected [' + sourceDecimalValue + '] and validated [' + assignedDecimalValue + ']');

    }

    /**
     * @see B2CBaseAttributeAssignment.getB2CAttributeDecimalValue
     * @description This method is used to exercise decimal assignment and
     * conversion of JSON values.  It validates that parsed strings are successfully
     * converted to decimal values.
     */
    @IsTest
    static void testDecimalAssignment() {

        // Initialize local variables
        Decimal assignedDecimalValue;
        JSONParse parsedJSON;

        // Parse the test JSON string
        parsedJSON = new JSONParse(jsonToTest);

        Test.startTest();

        // Attempt to parse the string attribute and return the decimal value
        assignedDecimalValue = B2CBaseAttributeAssignment.getB2CAttributeDecimalValue(parsedJSON, 'testDecimal');

        Test.stopTest();

        // Validate the decimal processing results
        System.assert(Decimal.valueOf(sourceDecimalValue) == assignedDecimalValue, '--> Expected [' + String.valueOf(sourceDecimalValue) + '] and validated [' + String.valueOf(assignedDecimalValue) + ']');

    }

    /**
     * @see B2CBaseAttributeAssignment.getB2CAttributeBooleanValue
     * @description This method is used to exercise boolean assignment and
     * conversion of JSON values.  It validates that parsed strings are successfully
     * converted to boolean values.
     */
    @IsTest
    static void testBooleanAssignment() {

        // Initialize local variables
        Boolean assignedBooleanValue;
        JSONParse parsedJSON;

        // Parse the test JSON string
        parsedJSON = new JSONParse(jsonToTest);

        Test.startTest();

        // Attempt to parse the string attribute and return the boolean value
        assignedBooleanValue = B2CBaseAttributeAssignment.getB2CAttributeBooleanValue(parsedJSON, 'testBoolean');

        Test.stopTest();

        // Validate the boolean processing results
        System.assert(Boolean.valueOf(sourceBooleanValue) == assignedBooleanValue, '--> Expected [' + sourceBooleanValue + '] and validated [' + String.valueOf(assignedBooleanValue) + ']');

    }

    /**
     * @see B2CBaseAttributeAssignment.getB2CAttributeIntegerValue
     * @description This method is used to exercise integer assignment and
     * conversion of JSON values.  It validates that parsed integers are successfully
     * converted to integer values.
     */
    @IsTest
    static void testIntegerAssignment() {

        // Initialize local variables
        Integer assignedIntegerValue;
        JSONParse parsedJSON;

        // Parse the test JSON string
        parsedJSON = new JSONParse(jsonToTest);

        Test.startTest();

        // Attempt to parse the integer attribute and return the integer value
        assignedIntegerValue = B2CBaseAttributeAssignment.getB2CAttributeIntegerValue(parsedJSON, 'testInteger');

        Test.stopTest();

        // Validate the integer processing results
        System.assert(Integer.valueOf(sourceIntegerValue) == assignedIntegerValue, '--> Expected [' + sourceIntegerValue + '] and validated [' + String.valueOf(assignedIntegerValue) + ']');

    }

    /**
     * @see B2CBaseAttributeAssignment.getB2CAttributeDateTimeValue
     * @description This method is used to validate that we can parse a date-time
     * value successfully from a JSON document by parsing it with the JSONParser class.
     */
    @IsTest
    static void testDateTimeAssignment() {

        // Initialize local variables
        String JSONToParse;
        JSONParse parsedJSON;
        Datetime attributeValue;

        // Default the JSON data we'll parse for this test
        JSONToParse = '{ "testDate": "2012-04-23T18:25:43.511Z" }';

        // Attempt to parse the JSON
        parsedJSON = new JSONParse(JSONToParse);

        Test.startTest();

        // Parse the dateTime value from the test object
        attributeValue = B2CBaseAttributeAssignment.getB2CAttributeDateTimeValue(parsedJSON, 'testDate');

        Test.stopTest();

        // Validate each of the elements of the date being parsed
        System.assert(2012 == attributeValue.yearGmt(), 'Expected [2012] and instead parsed [' + String.valueOf(attributeValue.yearGmt()) + ']');
        System.assert(4 == attributeValue.monthGmt(), 'Expected [4] and instead parsed [' + String.valueOf(attributeValue.monthGmt()) + ']');
        System.assert(23 == attributeValue.dayGmt(), 'Expected [23] and instead parsed [' + String.valueOf(attributeValue.dayGmt()) + ']');
        System.assert(18 == attributeValue.hourGmt(), 'Expected [18] and instead parsed [' + String.valueOf(attributeValue.hourGmt()) + ']');
        System.assert(25 == attributeValue.minuteGmt(), 'Expected [25] and instead parsed [' + String.valueOf(attributeValue.minuteGmt()) + ']');
        System.assert(43 == attributeValue.secondGmt(), 'Expected [43] and instead parsed [' + String.valueOf(attributeValue.secondGmt()) + ']');

    }

    /**
     * @see B2CBaseAttributeAssignment.getB2CAttributeDateValue
     * @description This method is used to validate that we can parse a date value
     * successfully from a JSON document by parsing it with the JSONParser class.
     */
    @IsTest
    static void testDateAssignment() {

        // Initialize local variables
        String JSONToParse;
        JSONParse parsedJSON;
        Datetime attributeValue;

        // Default the JSON data we'll parse for this test
        JSONToParse = '{ "testDate": "2012-04-23T18:25:43.511Z" }';

        // Attempt to parse the JSON
        parsedJSON = new JSONParse(JSONToParse);

        Test.startTest();

        // Parse the date value from the test object
        attributeValue = B2CBaseAttributeAssignment.getB2CAttributeDateValue(parsedJSON, 'testDate');

        Test.stopTest();

        // Validate each of the elements of the date being parsed
        System.assert(2012 == attributeValue.yearGmt(), 'Expected [2012] and instead parsed [' + String.valueOf(attributeValue.yearGmt()) + ']');
        System.assert(4 == attributeValue.monthGmt(), 'Expected [4] and instead parsed [' + String.valueOf(attributeValue.monthGmt()) + ']');
        System.assert(23 == attributeValue.dayGmt(), 'Expected [23] and instead parsed [' + String.valueOf(attributeValue.dayGmt()) + ']');

    }

    /**
     * @see B2CBaseAttributeAssignment.doesFieldExist
     * @description This method is used to validate that we can identify when
     * a field exists by interrogating the fieldSchema for an object.
     */
    @IsTest
    static void testDoesFieldExist() {

        // Initialize the schema properties
        String thisSObjectType;
        SObject thisObject;
        SObjectType objectSchema;
        Map<String,Schema.SObjectField> schemaMap;
        Boolean idTestResult;
        Boolean fooTestResult;

        // Initialize the testObject
        thisObject = Schema.getGlobalDescribe().get(sObjectTypeName).newSObject();

        // Create a reference to the schema map for this object
        thisSObjectType = thisObject.getSObjectType().getDescribe().getName();
        objectSchema = Schema.getGlobalDescribe().get(thisSObjectType);
        schemaMap = objectSchema.getDescribe().fields.getMap();

        Test.startTest();

        // Exercise the fieldExists method by testing a field that does / does not exist on the Account object
        idTestResult = B2CBaseAttributeAssignment.doesFieldExist(schemaMap, 'Id');
        fooTestResult = B2CBaseAttributeAssignment.doesFieldExist(schemaMap, 'foo');

        Test.stopTest();

        // Validate the field verification results
        System.assert(idTestResult == true, '--> Expected [true] as the [Id] field should exist on the [' + sObjectTypeName + '] object');
        System.assert(fooTestResult == false, '--> Expected [false] as the [foo] field should not exist on the [' + sObjectTypeName + '] object');

    }

    /**
     * @see B2CBaseAttributeAssignment.getSchemaMap
     * @description This method is used to retrieve the schema map for a given
     * sObject type (the map is used to interrogate field display properties)
     */
    @IsTest
    static void testGetSchemaMap() {

        // Initialize the schema properties
        SObject thisObject;
        Map<String,Schema.SObjectField> schemaMap;

        // Initialize the testObject
        thisObject = Schema.getGlobalDescribe().get(sObjectTypeName).newSObject();

        Test.startTest();

        // Retrieve the schema map for this sObject
        schemaMap = B2CBaseAttributeAssignment.getSchemaMap(thisObject);

        Test.stopTest();

        // Validate that the object's field definitions are included in the result
        System.assert(schemaMap.containsKey('Id') == true, '--> Expected [Id] to exist on the [' + sObjectTypeName + '] object');
        System.assert(schemaMap.containsKey('Name') == true, '--> Expected [Name] to exist exist on the [' + sObjectTypeName + '] object');
        System.assert(schemaMap.containsKey('Boolean_Field__c') == true, '--> Expected [Boolean_Field__c] to exist exist on the [' + sObjectTypeName + '] object');
        System.assert(schemaMap.containsKey('Currency_Field__c') == true, '--> Expected [Currency_Field__c] to exist exist on the [' + sObjectTypeName + '] object');
        System.assert(schemaMap.containsKey('Date_Field__c') == true, '--> Expected [Date_Field__c] to exist exist on the [' + sObjectTypeName + '] object');
        System.assert(schemaMap.containsKey('DateTime_Field__c') == true, '--> Expected [DateTime_Field__c] to exist exist on the [' + sObjectTypeName + '] object');
        System.assert(schemaMap.containsKey('Double_Field__c') == true, '--> Expected [Double_Field__c] to exist exist on the [' + sObjectTypeName + '] object');
        System.assert(schemaMap.containsKey('Integer_Field__c') == true, '--> Expected [Integer_Field__c] to exist exist on the [' + sObjectTypeName + '] object');
        System.assert(schemaMap.containsKey('Picklist_Field__c') == true, '--> Expected [Picklist_Field__c] to exist exist on the [' + sObjectTypeName + '] object');
        System.assert(schemaMap.containsKey('String_Field__c') == true, '--> Expected [String_Field__c] to exist exist on the [' + sObjectTypeName + '] object');
        System.assert(schemaMap.containsKey('Textarea_Field__c') == true, '--> Expected [Textarea_Field__c] to exist exist on the [' + sObjectTypeName + '] object');

    }

    /**
     * @see B2CBaseAttributeAssignment.getFieldDisplayType
     * @description This method is used to test the retrieval of a field displayType
     * for a given sObject's field schemaMap
     */
    @IsTest
    static void testGetFieldDisplayType() {

        // Initialize the schema properties
        SObject thisObject;
        Map<String,Schema.SObjectField> schemaMap;
        Schema.DisplayType fieldDisplayTypeBoolean;
        Schema.DisplayType fieldDisplayTypeCurrency;
        Schema.DisplayType fieldDisplayTypeInteger;
        Schema.DisplayType fieldDisplayTypeDouble;
        Schema.DisplayType fieldDisplayTypeDate;
        Schema.DisplayType fieldDisplayTypeDateTime;
        Schema.DisplayType fieldDisplayTypeString;
        Schema.DisplayType fieldDisplayTypePicklist;
        Schema.DisplayType fieldDisplayTypeTextarea;

        // Initialize the testObject and pull the schemaMap
        thisObject = Schema.getGlobalDescribe().get(sObjectTypeName).newSObject();
        schemaMap = B2CBaseAttributeAssignment.getSchemaMap(thisObject);

        Test.startTest();

        // Retrieve the display types for the test object's fields
        fieldDisplayTypeBoolean = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, 'Boolean_Field__c');
        fieldDisplayTypeCurrency = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, 'Currency_Field__c');
        fieldDisplayTypeInteger = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, 'Integer_Field__c');
        fieldDisplayTypeDouble = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, 'Double_Field__c');
        fieldDisplayTypeDate = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, 'Date_Field__c');
        fieldDisplayTypeDateTime = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, 'DateTime_Field__c');
        fieldDisplayTypeString = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, 'String_Field__c');
        fieldDisplayTypePicklist = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, 'Picklist_Field__c');
        fieldDisplayTypeTextarea = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, 'Textarea_Field__c');

        Test.stopTest();

        // Validate each of the field display types for our test sObject
        System.assert(fieldDisplayTypeBoolean == Schema.DisplayType.BOOLEAN, '--> ['+ String.valueOf(fieldDisplayTypeBoolean) +']; Expected [Boolean_Field__c] to have a fieldDisplayValue of [BOOLEAN]');
        System.assert(fieldDisplayTypeCurrency == Schema.DisplayType.CURRENCY, '--> ['+ String.valueOf(fieldDisplayTypeCurrency) +']; Expected [Currency_Field__c] to have a fieldDisplayValue of [CURRENCY]');
        System.assert(fieldDisplayTypeInteger == Schema.DisplayType.DOUBLE, '--> ['+ String.valueOf(fieldDisplayTypeInteger) +']; Expected [Integer_Field__c] to have a fieldDisplayValue of [INTEGER]');
        System.assert(fieldDisplayTypeDouble == Schema.DisplayType.DOUBLE, '--> ['+ String.valueOf(fieldDisplayTypeDouble) +']; Expected [Double_Field__c] to have a fieldDisplayValue of [DOUBLE]');
        System.assert(fieldDisplayTypeDate == Schema.DisplayType.DATE, '--> ['+ String.valueOf(fieldDisplayTypeDate) +']; Expected [Date_Field__c] to have a fieldDisplayValue of [DATE]');
        System.assert(fieldDisplayTypeDateTime == Schema.DisplayType.DATETIME, '--> ['+ String.valueOf(fieldDisplayTypeDateTime) +']; Expected [DateTime_Field__c] to have a fieldDisplayValue of [DATETIME]');
        System.assert(fieldDisplayTypeString == Schema.DisplayType.STRING, '--> ['+ String.valueOf(fieldDisplayTypeString) +']; Expected [String_Field__c] to have a fieldDisplayValue of [STRING]');
        System.assert(fieldDisplayTypePicklist == Schema.DisplayType.PICKLIST, '--> ['+ String.valueOf(fieldDisplayTypePicklist) +']; Expected [Picklist_Field__c] to have a fieldDisplayValue of [PICKLIST]');
        System.assert(fieldDisplayTypeTextarea == Schema.DisplayType.TEXTAREA, '--> ['+ String.valueOf(fieldDisplayTypeTextarea) +']; Expected [Textarea_Field__c] to have a fieldDisplayValue of [TEXTAREA]');

    }

    /**
     * @see B2CBaseAttributeAssignment.getFieldDisplayType
     * @description This method is used to test the retrieval of a field displayType
     * for a given sObject's field schemaMap (and validate null error handling)
     */
    @IsTest
    static void testGetNullFieldDisplayType() {

        // Initialize the schema properties
        SObject thisObject;
        Map<String,Schema.SObjectField> schemaMap;
        Schema.DisplayType fieldDisplayTypeResult;
        String unknownFieldName;

        // Default the unknown field name
        unknownFieldName = 'Unknown_Attribute__c';

        // Initialize the testObject and pull the schemaMap
        thisObject = Schema.getGlobalDescribe().get(sObjectTypeName).newSObject();
        schemaMap = B2CBaseAttributeAssignment.getSchemaMap(thisObject);

        Test.startTest();

        // Attempt to resolve a field that doesn't exist in the field schema
        fieldDisplayTypeResult = B2CBaseAttributeAssignment.getFieldDisplayType(schemaMap, sObjectTypeName, unknownFieldName);

        Test.stopTest();

        // Evaluate that the field display type resolves as null for a field that doesn't exist in an sObject
        System.assert(fieldDisplayTypeResult == null, '--> [Expected [' + unknownFieldName + '] to resolve to a null fieldType instead of [' + String.valueOf(fieldDisplayTypeResult) + ']');

    }

}
