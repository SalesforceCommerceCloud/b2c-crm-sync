'use strict';

// Initialize the middleware
var server = require('server');
server.extend(module.superModule);

/**
 * @description Extend the Logout method to clear the agentSession.  We verify that the current
 * user is not a registered user -- or a storefront session.  If that's the case, we have an
 * Agent in play and must clear the agent session on logout.
 *
 * @param name {String} Name of the route to modify
 * @param arguments {Function} List of functions to be appended
 */
server.prepend('Logout', function (req, res, next) {

    // Initialize local variables
    var agentUserMgr;

    // Is this an agent session?
    if (session.userName !== 'storefront' && session.userName !== 'registered') {

        // If so, initialize the agentUserMgr and logout the agent
        agentUserMgr = require('dw/customer/AgentUserMgr');
        agentUserMgr.logoutAgentUser();

    }

    next();
});

module.exports = server.exports();
