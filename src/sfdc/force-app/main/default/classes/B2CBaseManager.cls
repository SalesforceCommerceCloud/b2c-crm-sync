/**
 * @author Abraham David Lloyd
 * @date May 25th, 2020
 *
 * @description This is the base class for all Managers, and will be used
 * to include all common functions leveraged by manager classes.
*/
public abstract with sharing class B2CBaseManager extends B2CBaseAttributeAssignment {

    /**
     * @description Helper method to evaluate if any exceptions were found
     * in the httpResponse.  If so, a hard error is thrown.
     *
     * @param res {HttpResponse} Represents the httpResponse processed via
     * the B2C Commerce REST API request
     */
    public static void evaluateResponseForExceptions(HttpResponse res) {

        // Initialize local variables
        String errorMsg;

        // Was the processed status-code valid?
        if (res.getStatus() != 'OK') {

            // Otherwise, create an error explaining the status code was incorrect
            errorMsg = B2CConstant.Errors_Common_GetStatus + ' [' + res.getStatus() + '] --> ';
            errorMsg += res.getBody();

            // Take the error message and throw it as a callout-exception
            CalloutException e = new CalloutException();
            e.setMessage(errorMsg);
            throw e;

        }

    }

}