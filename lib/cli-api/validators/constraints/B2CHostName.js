
const config = require('config');
const validate = require('validate.js');

module.exports = {
    value: {
        url: {
            allowLocal: false,
            allowDataUrl: true,
            schemes: ['data'],
            message: function () {
                return validate.format('^%{attr} hostnames should represent valid website urls without protocol declarations', config.get('validatejs.attributePlaceholder'));
            }
        }
    }
};
