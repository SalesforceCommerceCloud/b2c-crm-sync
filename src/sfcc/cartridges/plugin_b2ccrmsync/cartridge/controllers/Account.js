'use strict';

// Initialize the middleware
var server = require('server');
server.extend(module.superModule);

/**
 * @description Extend the Login method to call the app.customer.loggedIn custom-hook.  When a
 * customer logsIn, synchronize the customer's latest profile updates with the Salesforce Platform.
 *
 * @param name {String} Name of the route to modify
 * @param arguments {Function} List of functions to be appended
 */
server.append('Login', function (req, res, next) {
    this.on('route:Complete', function () {
        if (customer.isAuthenticated() && require('dw/system/HookMgr').hasHook('app.customer.loggedIn')) {
            require('dw/system/HookMgr').callHook(
                'app.customer.loggedIn',
                'loggedIn',
                customer.getProfile()
            );
        }
    });
    next();
});

/**
 * @description Extend the SubmitRegistration method to call the app.customer.created custom-hook.
 * When a customer registers via the storefront -- a profile will be created in the Salesforce Platform.
 *
 * @param name {String} Name of the route to modify
 * @param arguments {Function} List of functions to be appended
 */
server.append('SubmitRegistration', function (req, res, next) {
    this.on('route:Complete', function () {
        if (customer.isAuthenticated() && require('dw/system/HookMgr').hasHook('app.customer.created')) {
            require('dw/system/HookMgr').callHook(
                'app.customer.created',
                'created',
                customer.getProfile()
            );
        }
    });
    next();
});

/**
 * @description Extend the SaveProfile method to call the app.customer.created custom-hook.  When
 * a customer saves a profile, the hook is triggered to synchronize with the Salesforce platform.
 *
 * @param name {String} Name of the route to modify
 * @param arguments {Function} List of functions to be appended
 */
server.append('SaveProfile', function (req, res, next) {
    this.on('route:Complete', function () {
        if (customer.isAuthenticated() && require('dw/system/HookMgr').hasHook('app.customer.updated')) {
            require('dw/system/HookMgr').callHook(
                'app.customer.updated',
                'updated',
                customer.getProfile()
            );
        }
    });
    next();
});

module.exports = server.exports();
