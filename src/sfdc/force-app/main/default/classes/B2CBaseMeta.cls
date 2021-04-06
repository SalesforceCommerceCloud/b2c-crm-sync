/**
 * @author Abraham David Lloyd
 * @date May 24th, 2020
 *
 * @description This class is the base class for all meta base-classes, and contains
 * common methods that are leveraged by SOQL driven meta-data functions.
 */
public abstract with sharing class B2CBaseMeta {

    /**
     * @description This method is a common / helper message used to test if
     * personAccounts are enabled in the current org.
     *
     * @return {Boolean} Describes if personAccounts are enabled (true / false)
     */
    public static Boolean testForPersonAccounts()
    {
        try
        {

            // Try to use the isPersonAccount field.
            SObject testObject = new Account();
            testObject.get( 'isPersonAccount' );

            // If we got here without an exception, return true.
            return true;

        }
        catch( Exception ex )
        {

            // An exception was generated trying to access the isPersonAccount field
            // so person accounts aren't enabled; return false.
            return false;

        }

    }

    /**
     * @description This method is a common / helper message used to validate that
     * empty record-sets throw a consistent exception.
     *
     * @param recordCount {Integer} Represents the total record-count from a given list
     * @param errorMsg {String} Describes the message used to throw a given error message
     */
    public static void testForEmptyRecordSet(Integer recordCount, String errorMsg) {

        // Initialize local variables
        String defaultErrorMsg;

        // Default the error message
        defaultErrorMsg = B2CConstant.Errors_Meta_NoRecordsFoundQuery;

        // Override the error message with the value provided
        if (errorMsg != null) { defaultErrorMsg = errorMsg; }

        // Were any records returned or was an empty recordSet provided?
        if (recordCount == 0 || recordCount == null) {

            // If not, throw the missing record exception
            throw new B2CMetaDataRecordMissingException(errorMsg);

        }

    }

    /**
     * @description Helper function to evaluate common query criteria and generate a CRUD
     * response for object validation (either throw an error or return a new empty object
     * factory-style).
     *
     * @param sObjectName {String} Describes the name of the sObject type being processed
     * @param returnEmptyObject {Boolean} Flag describing if an empty object should be returned factory-style
     * @param recordSet {List<SObject>} Represents the query-result set being evaluated
     * @param errorMsg {String} Represents the error message to include in a thrown error
     *
     * @return {sObject} Returns an sObject typed based on the sObjectName specified
     */
    public static SObject processReturnResult(String sObjectName, Boolean returnEmptyObject, List<SObject> recordSet, String errorMsg) {

        // Evaluate if an empty object should be returned
        if (returnEmptyObject == false) {

            // Were any records returned by this query?
            testForEmptyRecordSet(recordSet.size(), errorMsg);

            // Return the first record retrieved
            return recordSet.get(0);

        } else {

            // Was a valid customerList found?
            if (recordSet.size() > 0) {

                // If so, return the first record retrieved
                return recordSet.get(0);

            } else {

                // Otherwise, return an empty sObject of the specified type
                return Schema.getGlobalDescribe().get(sObjectName).newSObject();

            }

        }

    }

}