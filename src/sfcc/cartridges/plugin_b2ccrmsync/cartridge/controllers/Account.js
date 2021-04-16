'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('Login', function (req, res, next) {
    this.on('route:Complete', function (requ, resp) {
        if (customer.isAuthenticated()) {
            require('dw/system/HookMgr').callHook('app.customer.loggedIn', 'loggedIn', customer.getProfile());
        }
    });
    next();
});

server.append('SubmitRegistration', function (req, res, next) {
    this.on('route:Complete', function (requ, resp) {
        if (customer.isAuthenticated()) {
            require('dw/system/HookMgr').callHook('app.customer.created', 'created', customer.getProfile());
        }
    });
    next();
});

server.append('SaveProfile', function (req, res, next) {
    this.on('route:Complete', function (requ, resp) {
        if (customer.isAuthenticated()) {
            require('dw/system/HookMgr').callHook('app.customer.updated', 'updated', customer.getProfile());
        }
    });
    next();
});

module.exports = server.exports();
