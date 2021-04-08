module.exports = {
    // Include the validators exposed to CLI commands
    validateHostName: require('./_validateHostName'),
    validateString: require('./_validateString'),
    verifyPropertyCollection: require('./_verifyPropertyCollection'),

    validateB2CClientID: require('./_validateB2CClientID'),
    validateB2CClientSecret: require('./_validateB2CClientSecret'),
    validateB2CCodeVersion: require('./_validateB2CCodeVersion'),
    validateB2CSiteIDs: require('./_validateB2CSiteIDs'),
    verifyB2CSiteProperties: require('./_verifyB2CSiteProperties'),
    validateDurationDays: require('./_validateDurationDays')
};
