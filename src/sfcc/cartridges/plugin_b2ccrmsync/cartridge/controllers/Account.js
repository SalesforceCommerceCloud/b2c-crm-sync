/* global customer:false */
'use strict';

// Initialize the middleware
var server = require('server');
server.extend(module.superModule);

/**
 * @description Extend the createAccount method to call the app.customer.created custom-hook
 * @param name {String} Name of the route to modify
 * @param arguments {Function} List of functions to be appended
 */
server.append('Login', function (req, res, next) {
    this.on('route:Complete', function (requ, resp) {
        if (customer.isAuthenticated()) {
            require('dw/system/HookMgr').callHook('app.customer.loggedIn', 'loggedIn', customer.getProfile());
        }
    });
    next();
});

/**
 * @description Extend the createAccount method to call the app.customer.created custom-hook
 * @param name {String} Name of the route to modify
 * @param arguments {Function} List of functions to be appended
 */
server.append('SubmitRegistration', function (req, res, next) {
    this.on('route:Complete', function (requ, resp) {
        if (customer.isAuthenticated()) {
            require('dw/system/HookMgr').callHook('app.customer.created', 'created', customer.getProfile());
        }
    });
    next();
});

/**
 * @description Extend the createAccount method to call the app.customer.created custom-hook
 * @param name {String} Name of the route to modify
 * @param arguments {Function} List of functions to be appended
 */
server.append('SaveProfile', function (req, res, next) {
    this.on('route:Complete', function (requ, resp) {
        if (customer.isAuthenticated()) {
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
