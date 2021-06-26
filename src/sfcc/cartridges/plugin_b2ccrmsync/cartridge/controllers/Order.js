'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('CreateAccount', function (req, res, next) {
    this.on('route:Complete', function (requ, resp) {
        var viewData = resp.getViewData();
        // If the {newCustomer} object is part of the view data, this means the customer just created it's profile
        if (customer.isAuthenticated() && viewData.newCustomer && require('dw/system/HookMgr').hasHook('app.customer.created')) {
            require('dw/system/HookMgr').callHook('app.customer.created', 'created', customer.getProfile());
        }
    });
    next();
});

server.append('Confirm', function (req, res, next) {
    this.on('route:Complete', function (requ, resp) {
        var viewData = resp.getViewData();
        if (viewData.order && require('dw/system/HookMgr').hasHook('app.order.created')) {
            // Retrieve again the order as the "order" property from the viewData is the model, which is not holding all the required data
            var order = require('dw/order/OrderMgr').getOrder(viewData.order.orderNumber);
            require('dw/system/HookMgr').callHook('app.order.created', 'created', order);
        }
    });
    next();
});

module.exports = server.exports();
