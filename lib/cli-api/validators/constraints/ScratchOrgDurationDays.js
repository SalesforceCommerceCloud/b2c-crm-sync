
const config = require('config');
const validate = require('validate.js');

module.exports = {
    value: {
        format: {
            pattern: '^([7-9]|1[0-9]|2[0-9]|30)$',
            flags: 'i',
            message: function () {
                return validate.format('^%{attr} must be between 7-30', config.get('validatejs.attributePlaceholder'));
            }
        }
    }
};
