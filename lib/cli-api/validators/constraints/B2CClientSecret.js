
const config = require('config'),
    validate = require('validate.js'),
    characterMinimum = parseInt(config.get('cliOptions.b2cClientSecret.minLength'), 10);

module.exports = {
    value: {
        presence: {
            allowEmpty: false,
            type: 'string',
            message: function () {
                return validate.format(
                    '^%{attr} cannot be null, undefined, and must be a string',
                    config.get('validatejs.attributePlaceholder')
                );
            }
        },
        length: {
            minimum: characterMinimum,
            message: function () {
                return validate.format(
                    `^%{attr} must contain at least ${characterMinimum} character(s)`,
                    config.get('validatejs.attributePlaceholder')
                );
            }
        }
    }
};
