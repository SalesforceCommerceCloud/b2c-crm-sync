'use strict';

// Initialize local variables
var server = require('server');
server.extend(module.superModule);

/**
 * @typedef  {Object} viewData Represents the view data-collection provided by the response
 * @property {Boolean} newCustomer Describes if the current customer represents a newCustomer
 */

/**
 * @description Extend the createAccount method to call the app.customer.created custom-hook.  When
 * an account is registered after placing an order, a corresponding contact will be created in the
 * Salesforce Platform.
 *
 * @param name {String} Name of the route to modify
 * @param arguments {Function} List of functions to be appended
 */
server.append('CreateAccount', function (req, res, next) {
    this.on('route:Complete', function (requ, resp) {

        /** @typedef viewData */
        var viewData;
        viewData = resp.getViewData();

        // If the {newCustomer} object is part of the view data, this means the customer just created it's profile
        if (customer.isAuthenticated() && viewData.newCustomer && require('dw/system/HookMgr').hasHook('app.customer.created')) {
            require('dw/system/HookMgr').callHook(
                'app.customer.created',
                'created',
                customer.getProfile()
            );
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
