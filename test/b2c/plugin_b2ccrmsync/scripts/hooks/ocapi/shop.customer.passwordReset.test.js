'use strict';

const path = require('path');
const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const sinonTest = require('sinon-test');
sinon.test = sinonTest(sinon);
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const proxyquire = require('proxyquire').noCallThru();
require('dw-api-mock/demandware-globals');

describe('plugin_b2ccrmsync/cartridge/scripts/b2ccrmsync/hooks/ocapi/shop.customer.passwordReset', function () {
    let sandbox;
    let spy;
    let requireStub;
    let customer;
    let shopCustomerPasswordResetHook;

    before('setup sandbox', function () {
        sandbox = sinon.createSandbox();
    });

    beforeEach(function () {
        requireStub = {
            'dw/system/Site': require('dw-api-mock/dw/system/Site'),
            '*/cartridge/scripts/b2ccrmsync.config': require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync.config')),
            '*/cartridge/scripts/helpers/accountHelpers': {
                sendPasswordResetEmail: (email, customer) => {
                    return email;
                }
            }
        };
        shopCustomerPasswordResetHook = proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/plugin_b2ccrmsync/cartridge/scripts/b2ccrmsync/hooks/ocapi/shop.customer.passwordReset'), requireStub);

        let Profile = require('dw-api-mock/dw/customer/Profile');
        let Customer = require('dw-api-mock/dw/customer/Customer');
        customer = new Customer(new Profile());
        spy = sinon.spy(requireStub['*/cartridge/scripts/helpers/accountHelpers'], 'sendPasswordResetEmail');
    });

    afterEach(function () {
        sandbox.restore();
        spy && spy.restore();
    });

    describe('afterPOST', function () {
        it('should not do anything in case the B2C CRM Sync site preference is disabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncPasswordResetEnabled = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            shopCustomerPasswordResetHook.afterPOST(customer);

            expect(spy).to.have.not.been.called;
        });

        it('should not do anything in case the customer has no profile', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncPasswordResetEnabled = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            customer.profile = undefined;
            shopCustomerPasswordResetHook.afterPOST(customer);

            expect(spy).to.have.not.been.called;
        });

        it('should call the agent helper and send the email to the customer if the preference is enabled and the customer has a profile', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncPasswordResetEnabled = true;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            shopCustomerPasswordResetHook.afterPOST(customer);

            expect(spy).to.have.been.calledWith(customer.getProfile().getEmail(), customer);
        });
    });
});
