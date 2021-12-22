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
const config = require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync.config'));
const helpers = require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/util/helpers'));
config.services.auth = `http.${config.services.auth}`; // Prepend the 'http' prefix so that the dw-api-mock understands that this is a HTTP Service instance
config.services.rest = `http.${config.services.rest}`; // Prepend the 'http' prefix so that the dw-api-mock understands that this is a HTTP Service instance
const customerProcessMock = require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/mocks/customer.process'));

class Profile {
    constructor(customerNo, email, firstName, lastName, b2cID, sfContactId, sfAccountId) {
        this.customerNo = customerNo;
        this.email = email;
        this.lastName = lastName;
        this.firstName = firstName;
        this.customer = {
            ID: b2cID,
            getID: () => this.customer.ID
        };
        this.custom = {
            b2ccrm_contactId: sfContactId,
            b2ccrm_accountId: sfAccountId,
            b2ccrm_syncResponseText: [],
            b2ccrm_syncStatus: undefined
        };
    }

    getEmail() {
        return this.email;
    }

    getLastName() {
        return this.lastName;
    }

    getFirstName() {
        return this.lastName;
    }

    getCustomer() {
        return this.customer;
    }

    getCustomerNo() {
        return this.customerNo;
    }
}

class Order {
    constructor(profile, customerEmail, lastName, firstName, sfContactId, sfAccountId) {
        this.profile = profile;
        this.customerEmail = customerEmail;
        this.billingAddress = {
            firstName: firstName,
            lastName: lastName,
            getFirstName: () => firstName,
            getLastName: () => lastName
        };
        this.customer = {
            getProfile: () => this.profile
        };
        this.custom = {
            b2ccrm_contactId: sfContactId,
            b2ccrm_accountId: sfAccountId,
            b2ccrm_syncResponseText: [],
            b2ccrm_syncStatus: undefined
        };
        this.orderNo = 'orderNo';
    }

    getOrderNo() {
        return this.orderNo;
    }

    getCustomer() {
        return this.customer;
    }

    getCustomerEmail() {
        return this.customerEmail;
    }

    getBillingAddress() {
        return this.billingAddress;
    }
}

const getEnabledSite = () => {
    const site = require('dw-api-mock/dw/system/Site').getCurrent();
    site.customPreferences.b2ccrm_syncIsEnabled = true;
    site.customPreferences.b2ccrm_syncCustomersEnabled = true;
    site.customPreferences.b2ccrm_syncCustomersOnLoginEnabled = true;
    site.customPreferences.b2ccrm_syncCustomersOnLoginOnceEnabled = true;
    site.customPreferences.b2ccrm_syncCustomersFromOrdersEnabled = true;
    site.customPreferences.b2ccrm_syncCustomersFromGuestOrdersEnabled = true;
    site.customPreferences.b2ccrm_syncApplyProfileIDsToRegisteredOrdersEnabled = true;
    return site;
};

describe('int_b2ccrmsync/cartridge/scripts/b2ccrmsync/hooks/order.process', function () {
    let sandbox;
    let spy;
    let requireStub;
    let profile;
    let order;
    let orderProcessHook;

    before('setup sandbox', function () {
        sandbox = sinon.createSandbox();
    });

    beforeEach(function () {
        global.request.locale = 'en_US';
        requireStub = {
            'dw/system/Site': require('dw-api-mock/dw/system/Site'),
            '*/cartridge/scripts/b2ccrmsync/models/authToken': sandbox.stub().returns(require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/models/authToken'))),
            '*/cartridge/scripts/b2ccrmsync/services/ServiceMgr': require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/ServiceMgr')),
            '*/cartridge/scripts/b2ccrmsync.config': config,
            '*/cartridge/scripts/b2ccrmsync/util/helpers': helpers,
            '*/cartridge/scripts/b2ccrmsync/models/order': proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/models/order'), {
                '*/cartridge/scripts/b2ccrmsync/util/helpers': helpers
            }),
            '*/cartridge/scripts/b2ccrmsync/models/customer': proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/models/customer'), {
                '*/cartridge/scripts/b2ccrmsync/util/helpers': helpers
            })
        };
        orderProcessHook = proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/hooks/order.process'), requireStub);
        profile = new Profile('0000001', 'jdoe@salesforce.com', 'Jane', 'Doe', 'aaaaaa', 'bbbbbb', 'cccccc');
        order = new Order(undefined, 'jdoe@salesforce.com', 'Jane', 'Doe', 'bbbbbb', 'cccccc');
        spy = sinon.spy(require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/ServiceMgr')), 'callRestService');
    });

    afterEach(function () {
        sandbox.restore();
        spy && spy.restore();
    });

    describe('created', function () {
        it('should not do anything in case no order is sent as parameter', function () {
            orderProcessHook.created();

            expect(spy).to.have.not.been.called;
        });

        it('should not do anything in case the b2c-crm-sync site preference is disabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncIsEnabled = false;
            site.customPreferences.b2ccrm_syncCustomersEnabled = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            orderProcessHook.created(order);

            expect(spy).to.have.not.been.called;
        });
        it('should not do anything in case the b2c-crm-sync guest-orders site preference is disabled and the order is a guest-order', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncCustomersFromOrdersEnabled = true;
            site.customPreferences.b2ccrm_syncCustomersFromGuestOrdersEnabled = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            orderProcessHook.created(order);

            expect(spy).to.have.not.been.called;
        });
        it('should not do anything in case the b2c-crm-sync PlatformID site preference is disabled and the order is a registered-order', function () {
            order = new Order(profile, 'jdoe@salesforce.com', 'Jane', 'Doe');
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncCustomersFromOrdersEnabled = true;
            site.customPreferences.b2ccrm_syncApplyProfileIDsToRegisteredOrdersEnabled = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            orderProcessHook.created(order);

            expect(spy).to.have.not.been.called;
        });
        it('should fail to update the order if no auth token is found, or an error occur', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            orderProcessHook.created(order);

            expect(spy).to.have.been.called;
            expect(order.custom.b2ccrm_syncStatus).to.be.equal('failed');
            expect(order.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
        });
        it('should call the rest service to process the guest-order and fail silently if the service replies an error', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['*/cartridge/scripts/b2ccrmsync/services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'ERROR',
                error: 'error',
                errorMessage: 'message'
            });
            orderProcessHook.created(order);

            expect(order.custom.b2ccrm_syncStatus).to.be.equal('failed');
            expect(order.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
        });
        it('should call the rest service to process the guest-order and fail silently if the service OK but contains errors', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            let mockResponse = JSON.parse(JSON.stringify(customerProcessMock));
            mockResponse[0].isSuccess = false;
            mockResponse[0].errors = ['error1', 'error2'];
            requireStub['*/cartridge/scripts/b2ccrmsync/services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'OK',
                object: mockResponse
            });
            orderProcessHook.created(order);

            expect(order.custom.b2ccrm_syncStatus).to.be.equal('failed');
            expect(order.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
        });
        it('should call the rest service to process the guest-order and update the order\'s custom attributes accordingly', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['*/cartridge/scripts/b2ccrmsync/services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'OK',
                object: customerProcessMock
            });
            orderProcessHook.created(order);

            expect(order.custom.b2ccrm_syncStatus).to.be.equal('exported');
            expect(order.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
            expect(order.custom.b2ccrm_accountId).to.be.equal(customerProcessMock[0].outputValues.Contact.AccountId);
            expect(order.custom.b2ccrm_contactId).to.be.equal(customerProcessMock[0].outputValues.Contact.Id);
        });
        it('should call the rest service to process the registered-order and update the order\'s custom attributes accordingly', function () {
            order = new Order(profile, 'jdoe@salesforce.com', 'Jane', 'Doe', 'bbbbbb', 'cccccc');
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['*/cartridge/scripts/b2ccrmsync/services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'OK',
                object: customerProcessMock
            });
            orderProcessHook.created(order);

            expect(order.custom.b2ccrm_syncStatus).to.be.equal('applied_identifiers');
            expect(order.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
            expect(order.custom.b2ccrm_accountId).to.be.equal(profile.custom.b2ccrm_accountId);
            expect(order.custom.b2ccrm_contactId).to.be.equal(profile.custom.b2ccrm_contactId);
        });
    });
});
