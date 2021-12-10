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
}
