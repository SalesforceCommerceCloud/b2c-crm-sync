
const config = require('config'),
    validate = require('validate.js'),
    characterMinimum = parseInt(config.get('cliOptions.b2cCodeVersion.minLength'), 10);

module.exports = {
    value: {
        presence: {
            allowEmpty: false,
            type: 'string',
            message: function () {
                return validate.format(
                    '^%{attr} cannot be null, undefined, and must be a string',
                    config.get('validatejs.attributePlaceholder'));
            }
        },
        length: {
            minimum: characterMinimum,
            message: function () {
                return validate.format(
                    `^%{attr} must contain at least ${characterMinimum} character(s)`,
                    config.get('validatejs.attributePlaceholder'));
            }
        },
        format: {
            pattern: '^[a-z][a-z0-9_\.]+',
            flags: 'i',
            message: function () {
                return validate.format(
                    '^%{attr} must start with a letter -- and only contain letters, numbers, dots and underscores',
                    config.get('validatejs.attributePlaceholder'));
            }
        }
    }
};
