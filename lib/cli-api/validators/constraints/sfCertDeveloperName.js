
const config = require('config');
const validate = require('validate.js');

const characterMinimum = parseInt(config.get('cliOptions.sfCertDeveloperName.minLength'), 10);
const characterMaximum = parseInt(config.get('cliOptions.sfCertDeveloperName.maxLength'), 10);

module.exports = {
    value: {
        presence: {
            allowEmpty: false,
            type: 'string',
            message: function () {
                return validate.format('^%{attr} cannot be null, undefined, and must be a string', config.get('validatejs.attributePlaceholder'));
            }
        },
        length: {
            minimum: characterMinimum,
            maximum: characterMaximum,
            message: function () {
                return validate.format(`^%{attr} must contain at least ${characterMinimum} character(s) and cannot exceed ${characterMaximum} characters`, config.get('validatejs.attributePlaceholder'));
            }
        },
        format: {
            pattern: '^[a-z][a-z0-9]_+',
            flags: 'i',
            message: function () {
                return validate.format('^%{attr} must start with a letter -- and only contain letters, numbers, and underscores', config.get('validatejs.attributePlaceholder'));
            }
        }
    }
};
