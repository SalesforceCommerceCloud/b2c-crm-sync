/* global session:false */
'use strict';

var server = require('server');
server.extend(module.superModule);

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
