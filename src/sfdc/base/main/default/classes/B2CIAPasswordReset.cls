/**
 * @author Jordane Bachelet
 * @date December 14th, 2021
 *
 * @description This is a wrapper-class to perform the password reset against B2C Commerce
*/
public with sharing class B2CIAPasswordReset {
    /**
     * @see B2CIAPasswordResetResult
     * @description Invokable action to reset the customer's password within B2C Commerce
     *
     * @param requestArguments {List<B2CIAPasswordResetInput>} Represents the request arguments to process
     * @return {List<B2CIAPasswordResetResult>} Returns the response object
     */
    @InvocableMethod(Label='B2C: Password Reset' Description='Attempts to reset the customer password within B2C Commerce')
    public static List<B2CIAPasswordResetResult> resetCustomerPassword(List<B2CIAPasswordResetInput> requestArguments) {
        List<B2CIAPasswordResetResult> output = new List<B2CIAPasswordResetResult>();

        for (B2CIAPasswordResetInput requestInput: requestArguments) {
            HttpRequest req = B2CHttpRequestHelper.resetPasswordRequest(requestInput.domain, requestInput.siteId, requestInput.version, requestInput.customerId, requestInput.clientId, requestInput.token);
            Http https = new Http();
            HttpResponse res = https.send(req);
            B2CIAPasswordResetResult passwordResetResult = new B2CIAPasswordResetResult();

            // Seed the request parameters for auditing
            passwordResetResult.apiUrl = req.getEndpoint();
            passwordResetResult.requestBody = req.getBody();

            passwordResetResult.status = res.getStatus();
            passwordResetResult.statusCode = res.getStatusCode();

            if (passwordResetResult.statusCode == 204) {
                passwordResetResult.isError = false;
            } else {
                passwordResetResult.errorMessage = B2CConstant.ERRORS_OCAPI_NON200ERROROCCURRED;
                passwordResetResult.isError = true;
                JSONParse parsedJSON = new JSONParse(res.getBody());
                passwordResetResult.responseBody = parsedJSON.toStringPretty();
            }

            output.add(passwordResetResult);
        }

        return output;
    }
}
