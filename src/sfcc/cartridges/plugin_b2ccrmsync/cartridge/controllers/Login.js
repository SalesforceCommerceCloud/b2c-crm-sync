'use strict';

var server = require('server');
server.extend(module.superModule);

server.prepend('OAuthReentry', function (req, res, next) {
    // Listen on the route:Redirect event as the flow redirects the user to another page once logged in
    this.on('route:Redirect', function () {
        if (customer.isAuthenticated()) {
            require('dw/system/HookMgr').callHook(
                'app.customer.loggedIn',
                'loggedIn',
                customer.getProfile()
            );
        }
    });
    next();
});

module.exports = server.exports();
