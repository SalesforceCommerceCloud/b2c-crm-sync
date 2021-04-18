module.exports = {
    executeAndVerifyB2CProcessResult: require('./_executeAndVerifyB2CProcessResult'),
    validateAccountContactPropertiesExist: require('./_validateAccountContactPropertiesExist'),
    validateB2CIdentifiers: require('./_validateB2CIdentifiers'),
    validateB2CCustomerListPropertiesExist: require('./_validateB2CCustomerListPropertiesExist'),
    validateB2CProcessResult: require('./_validateB2CProcessResult'),
    validateContactAndAccountIDs: require('./_validateContactAndAccountIDs'),
    validateContactProperties: require('./_validateContactProperties'),
    validateRegisteredUserContactUpdatesAreEqual: require('./_validateRegisteredUserContactUpdatesAreEqual'),
    validateRegisteredUserContactUpdatesAreNotEqual: require('./_validateRegisteredUserContactUpdatesAreNotEqual'),
    validateRegisteredUserNoSFDCAttributes: require('./_validateRegisteredUserNoSFDCAttributes'),
    validateRegisteredUserPatchResults: require('./_validateRegisteredUserPatchResults'),
    validateRegisteredUserWithSFDCAttributes: require('./_validateRegisteredUserWithSFDCAttributes')
};
