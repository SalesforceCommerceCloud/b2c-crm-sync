/**
 * @author Abraham David Lloyd
 * @date August 9th, 2020
 *
 * @description This is the test-class for the B2C Base Meta class -- and validates
 * the exercising of personAccount validation.
 */
@IsTest
public with sharing class B2CBaseMeta_Test {

    /**
     * @see B2CBaseMeta.testForPersonAccounts
     * @description This method is used to test / evaluate if PersonAccounts are enabled
     * within the current org.  It's used as a pre-cursory validation.
     */
    @IsTest
    static void testValidateIfPersonAccountsEnabled() {

        // Initialize local variables
        Boolean output;

        Test.startTest();

        // Attempt to validate if PersonAccounts are enabled
        output = B2CBaseMeta.testForPersonAccounts();

        Test.stopTest();

        // Verify that personAccounts are enabled within the Salesforce org
        //System.assert(output == true, '--> PersonAccounts do not appear to be enabled in this Salesforce org');

    }

}