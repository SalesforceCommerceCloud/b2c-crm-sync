
const config = require('config'),
    validate = require('validate.js'),
    characterMinimum = parseInt(config.get('cliOptions.b2cSiteIds.minLength'), 10);

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
        },
        format: {
            pattern: '^[\\S]+',
            flags: 'i',
            message: function () {
                return validate.format(
                    '^%{attr} cannot contain any whitespace characters',
                    config.get('validatejs.attributePlaceholder')
                );
            }
        }
    }
};
