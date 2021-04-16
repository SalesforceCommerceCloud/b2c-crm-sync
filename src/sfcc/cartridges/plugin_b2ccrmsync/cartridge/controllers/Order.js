'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('CreateAccount', function (req, res, next) {
    this.on('route:Complete', function (requ, resp) {
        var viewData = resp.getViewData();
        // If the {newCustomer} object is part of the view data, this means the customer just created it's profile
        if (customer.isAuthenticated() && viewData.newCustomer) {
            require('dw/system/HookMgr').callHook('app.customer.created', 'created', customer.getProfile());
        }
    });
    next();
});

module.exports = server.exports();
