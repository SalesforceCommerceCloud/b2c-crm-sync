/**
 * @author Jordane Bachelet
 * @date June 29th, 2021
 *
 * @description This class is a helper class used to create B2C Data Sources on the.
 * Salesforce Platform that can be leveraged by Salesforce Connect.
 */
public with sharing class B2CDataSourceHelper {
    /**
     * @description This method creates the Schema of External Object based on configured mapping fields and return the table schema for the External Object generation
     *
     * @param tableName {String}
     * @param tableLabelSingular {String}
     * @param tableLabelPlural {String}
     * @param tableDescription {String}
     * @param indirectLookupColumn {String}
     * @param indirectLookupColumnLabel {String}
     * @param indirectLookupColumnDescription {String}
     * @param indirectLookupTargetObject {String}
     * @param indirectLookupTargetField {String}
     * @param fieldMappings List<B2C_Integration_Field_Mappings__mdt>
     * @return {List<DataSource.Table>} tables
     * */
    public static List<DataSource.Table> generateSyncTables(
        String tableName,
        String tableLabelSingular,
        String tableLabelPlural,
        String tableDescription,
        String indirectLookupColumn,
        String indirectLookupColumnLabel,
        String indirectLookupColumnDescription,
        String indirectLookupTargetObject,
        String indirectLookupTargetField,
        List<B2C_Integration_Field_Mappings__mdt> fieldMappings) {
        List<DataSource.Table> tables = new List<DataSource.Table>();
        // Get the fieldMappings for the customer address object and add them to the columns list
        List<DataSource.Column> columns = B2CDataSourceHelper.generateColumns(fieldMappings);

        // Create the indirect look-up column governing the address-book relationships
        DataSource.Column indirectColumn = DataSource.Column.indirectLookup(indirectLookupColumn, indirectLookupTargetObject, indirectLookupTargetField);
        indirectColumn.label = indirectLookupColumnLabel;
        indirectColumn.description = indirectLookupColumnDescription;

        // Always apply the following columns:
        // - ExternalId -> Required by Salesforce Connect as unique identifier in the Core Platform
        // - Display URL -> Required by Salesforce Connect to be able to open the detail page within the external system
        // - indirectLookupColumn -> The indirect lookup to the "Parent" record
        columns.add(DataSource.Column.text('ExternalId', 255));
        columns.add(DataSource.Column.url('DisplayUrl'));
        columns.add(indirectColumn);

        tables.add(
            DataSource.Table.get(
                tableName,
                tableLabelSingular,
                tableLabelPlural,
                tableDescription,
                'ExternalId',
                columns
            )
        );

        return tables;
    }

    /**
     * @description Generate the columns for a table from the given field mappings
     *
     * @param fieldMappings {List<B2C_Integration_Field_Mappings__mdt>}  The field mappings to use to generate the columns
     * @return {List<DataSource.Column>}
     */
    public static List<DataSource.Column> generateColumns(List<B2C_Integration_Field_Mappings__mdt> fieldMappings) {
        List<DataSource.Column> columns = new List<DataSource.Column>();

        for (B2C_Integration_Field_Mappings__mdt fieldMapping : fieldMappings) {
            DataSource.Column column = new DataSource.Column();

            if (fieldMapping.B2C_Commerce_Attribute_Type__c == 'boolean') {
                column = DataSource.Column.boolean(fieldMapping.Service_Cloud_Attribute__c);
            } else if (fieldMapping.B2C_Commerce_Attribute_Type__c == 'integer') {
                column = DataSource.Column.integer(fieldMapping.Service_Cloud_Attribute__c, 10);
            } else if (fieldMapping.B2C_Commerce_Attribute_Type__c == 'number') {
                column = DataSource.Column.number(fieldMapping.Service_Cloud_Attribute__c, 10, 2);
            } else { // By default treat as a string
                column = DataSource.Column.text(fieldMapping.Service_Cloud_Attribute__c, 255);
            }

            column.label = fieldMapping.Field_Label__c;
            column.description = fieldMapping.Field_Description__c;
            columns.add(column);
        }

        return columns;
    }

    /**
     * @description Retrieve the configured field mappings from the given {data}
     *
     * @param customerId {String}  The customer Id
     * @param data {JSONParse} The data retrieved from the B2C Commerce API
     * @param fieldMappings {List<B2C_Integration_Field_Mappings__mdt>} The collection of fieldMappings to process
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
                // This probably fires only because the value is not set on the address in the B2C Commerce instance for this address, but the attribute still exists
                System.debug(
                    'The attribute {' + fieldMapping.B2C_Commerce_OCAPI_Attribute__c + '} ' +
                    'has not been found in the given object {' + data.toStringPretty() + '} ' +
                    ' for the customer {' + customerId + '}.'
                );
            }
        }

        return mappedObject;
    }

    /**
     * @description Get the contact that matches the given {customerId}
     * If multiple records are found, the query limits to the first one
     *
     * @param customerId {String} The customer Id to use to find the contact
     * @return {Contact} The found contact or null if none is found
     */
    public static Contact getContactByCustomerId(String customerId) {
        String errorMsg = B2CConstant.buildErrorMessage(B2CConstant.Errors_Meta_ContactNotFound, customerId);
        Query contactQuery = new Query('Contact');
        contactQuery.selectField('AccountId');
        contactQuery.selectField('B2C_Customer_Id__c');
        contactQuery.selectField('B2C_Customer_No__c');
        contactQuery.selectField('B2C_CustomerList__r.Name');
        contactQuery.selectField('B2C_CustomerList__r.API_Url__c');
        contactQuery.selectField('B2C_CustomerList__r.B2C_Client_ID__c');
        contactQuery.selectField('B2C_CustomerList__r.OCAPI_Version_No__c');
        contactQuery.setLimit(1);
        contactQuery.addConditionEq('B2C_Customer_ID__c', customerId);
        contactQuery.addConditionEq('Id', customerId);
        contactQuery.addConditionEq('AccountId', customerId);
        contactQuery.switchToDisjunction();

        List<Contact> contacts = contactQuery.run();

        return (Contact)B2CBaseMeta.processReturnResult('Contact', false, contacts, errorMsg);
    }
}
