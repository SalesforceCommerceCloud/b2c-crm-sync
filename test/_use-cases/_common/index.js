module.exports = {
    compareAccountContactIdentifiers: require('./_compareAccountContactIdentifiers'),
    executeAndVerifyB2CProcessResult: require('./_executeAndVerifyB2CProcessResult'),
    executeAndVerifyB2CProcessErrorResult: require('./_executeAndVerifyB2CProcessErrorResult'),
    getEmailForTestProfile: require('./_getEmailForTestProfile'),
    validateAccountContactPropertiesExist: require('./_validateAccountContactPropertiesExist'),
    validateB2CIdentifiers: require('./_validateB2CIdentifiers'),
    validateB2CCustomerListPropertiesExist: require('./_validateB2CCustomerListPropertiesExist'),
    validateB2CProcessErrorResult: require('./_validateB2CProcessErrorResult'),
    validateB2CProcessResult: require('./_validateB2CProcessResult'),
    validateContactAndAccountIDs: require('./_validateContactAndAccountIDs'),
    validateContactProperties: require('./_validateContactProperties'),
    validateRegisteredUserContactUpdatesAreEqual: require('./_validateRegisteredUserContactUpdatesAreEqual'),
    validateRegisteredUserContactUpdatesAreNotEqual: require('./_validateRegisteredUserContactUpdatesAreNotEqual'),
    validateRegisteredUserNoSFDCAttributes: require('./_validateRegisteredUserNoSFDCAttributes'),
    validateRegisteredUserPatchResults: require('./_validateRegisteredUserPatchResults'),
    validateRegisteredUserWithSFDCAttributes: require('./_validateRegisteredUserWithSFDCAttributes')
};
