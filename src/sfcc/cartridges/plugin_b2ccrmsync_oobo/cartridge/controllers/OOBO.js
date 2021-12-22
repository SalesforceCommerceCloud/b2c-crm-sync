'use strict';

var server = require('server');

/**
 * @function function renderAgentHeader
 * @description Overriding the session-initialization to handle the Order-On-Behalf from Service-Cloud for guest customers.
 * For guest customers, PlaceHolder customer is used to establish an Auth between SC & CC. This is to create an agent session.
 * Once the auth is created, this PlaceHolder session is explicitly invalidated, but the agent context remains active.
 */
server.get('AgentHeader', server.middleware.include, function (req, res, next) {
    var URLUtils,
        Resource,
        agentHeaderParam,
        Site,
        isSyncEnabled,
        isAgentHeaderEnabled,
        displayAgentHeader,
        customerName,
        customerNo;

    // Initialize classes
    URLUtils = require('dw/web/URLUtils');
    Resource = require('dw/web/Resource');

    // Retrieve the agent header parameter from the collection of httpParameters
    agentHeaderParam = request.httpParameterMap.get('show-agentheader');

    // Evaluate if b2c-crm-sync is enabled -- and if the agentHeader is enabled as well
    Site = require('dw/system/Site').getCurrent();
    isSyncEnabled = Site.getCustomPreferenceValue('b2ccrm_syncIsEnabled');
    isAgentHeaderEnabled = Site.getCustomPreferenceValue('b2ccrm_syncAgentHeaderIsEnabled');

    // Evaluate if the agentHeader should be rendered (either force rendering via a URL parameter or evaluate the siteConfig and session to determine rendering)
    if ((agentHeaderParam.value === 'customer' || agentHeaderParam.value === 'anonymous')
        || (isSyncEnabled === true && isAgentHeaderEnabled === true && session.userName !== 'storefront' && session.userName !== 'registered')) {

        // Default the customerName;
        customerName = '';
        customerNo = '';

        // Evaluate which type of agent-header is being rendered
        if (session.userName !== 'storefront' && (session.customer.authenticated || agentHeaderParam.value === 'customer')) {

            // Default the view-mode
            displayAgentHeader = 'customer';

            // Only process the customerName if it exists in the session
            if (session.customer.profile != null) {

                // Default the customerNo for this customer
                customerNo = session.customer.profile.customerNo;

                // Build out the displayName of the customer -- start with the firstName
                if (session.customer.profile.firstName.length > 0) { customerName = session.customer.profile.firstName; }

                // Append the lastName to the customerName
                if (session.customer.profile.lastName.length > 0) {
                    if (customerName.length > 0) { customerName += ' '; }
                    customerName += session.customer.profile.lastName;
                }

            }

        // Otherwise, handle rendering the anonymous customer agentHeader
        } else if ((session.userName !== 'storefront' && session.userName !== 'registered') || agentHeaderParam.value === 'anonymous') {
            displayAgentHeader = 'anonymous';
        }

        // Default the customerName and customerNo using resourceLabels if the values were not automatically defaulted
        if (customerName.length === 0) { customerName = Resource.msg('agentheader.customername', 'b2ccrmsync', null); }
        if (customerNo.length === 0) { customerNo = Resource.msg('agentheader.customerno', 'b2ccrmsync', null); }

        // Render the Service Agent OOBO Header
        res.render(
            'components/header/agentOOBOHeader',
            {
                customerName: customerName,
                customerNo: customerNo,
                agentHeader: displayAgentHeader,
                logoutUrl: URLUtils.url('Login-Logout').toString()
            }
        );

        return next();

    }

});

module.exports = server.exports();
