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
config.services.auth = `http.${config.services.auth}`; // Prepend the 'http' prefix so that the dw-api-mock understands that this is a HTTP Service instance
config.services.rest = `http.${config.services.rest}`; // Prepend the 'http' prefix so that the dw-api-mock understands that this is a HTTP Service instance
const customerProcessMock = require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/services/mocks/customer.process'));

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

const getEnabledSite = () => {
    const site = require('dw-api-mock/dw/system/Site').getCurrent();
    site.customPreferences.b2ccrm_syncIsEnabled = true;
    site.customPreferences.b2ccrm_syncCustomersEnabled = true;
    site.customPreferences.b2ccrm_syncCustomersOnLoginEnabled = true;
    site.customPreferences.b2ccrm_syncCustomersOnLoginOnceEnabled = true;
    return site;
};

describe('int_b2ccrmsync/cartridge/scripts/hooks/customer.process', function () {
    let sandbox;
    let spy;
    let requireStub;
    let profile;
    let customerProcessHook;

    before('setup sandbox', function () {
        sandbox = sinon.createSandbox();
    });

    beforeEach(function () {
        global.request.locale = 'en_US';
        requireStub = {
            'dw/system/Site': require('dw-api-mock/dw/system/Site'),
            '../models/authToken': sandbox.stub().returns(require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/models/authToken'))),
            '../services/ServiceMgr': require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/services/ServiceMgr')),
            '../b2ccrmsync.config': config
        };
        customerProcessHook = proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/hooks/customer.process'), requireStub);
        profile = new Profile('0000001', 'jdoe@salesforce.com', 'Jane', 'Doe', 'aaaaaa', 'bbbbbb', 'cccccc');
        spy = sinon.spy(require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/services/ServiceMgr')), 'callRestService');
    });

    afterEach(function () {
        sandbox.restore();
        spy && spy.restore();
    });

    describe('loggedIn', function () {
        it('should not do anything in case no profile is sent as parameter', function () {
            customerProcessHook.loggedIn();

            expect(spy).to.have.not.been.called;
        });

        it('should not do anything in case the B2C CRM Sync site preference is disabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncIsEnabled = false;
            site.customPreferences.b2ccrm_syncCustomersEnabled = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            customerProcessHook.loggedIn(profile);

            expect(spy).to.have.not.been.called;
        });

        it('should not do anything in case the loggedIn-specific site preference is disabled', function () {
            const site = getEnabledSite();
            site.customPreferences.b2ccrm_syncCustomersOnLoginEnabled = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            customerProcessHook.loggedIn(profile);

            expect(spy).to.have.not.been.called;
        });

        it('should not do anything in case the profile has already been synched', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            customerProcessHook.loggedIn(profile);

            expect(spy).to.have.not.been.called;
        });

        it('should fail to update the profile if no auth token is found, or an error occur, even if sync is enabled when the profile has already been synched', function () {
            const site = getEnabledSite();
            site.customPreferences.b2ccrm_syncCustomersOnLoginOnceEnabled = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            customerProcessHook.loggedIn(profile);

            expect(spy).to.have.been.called;
            expect(profile.custom.b2ccrm_syncStatus).to.be.equal('failed');
            expect(profile.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
        });

        it('should fail to update the profile if no auth token is found, or an error occur', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            profile.custom.b2ccrm_contactId = undefined;
            customerProcessHook.loggedIn(profile);

            expect(spy).to.have.been.called;
            expect(profile.custom.b2ccrm_syncStatus).to.be.equal('failed');
            expect(profile.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
        });

        it('should call the rest service to process the profile and fail silently if the service replies an error', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['../services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'ERROR',
                error: 'error',
                errorMessage: 'message'
            });
            profile.custom.b2ccrm_contactId = undefined;
            customerProcessHook.loggedIn(profile);

            expect(profile.custom.b2ccrm_syncStatus).to.be.equal('failed');
            expect(profile.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
        });

        it('should call the rest service to process the profile and fail silently if the service OK but contains errors', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            let mockResponse = JSON.parse(JSON.stringify(customerProcessMock));
            mockResponse[0].isSuccess = false;
            mockResponse[0].errors = ['error1', 'error2'];
            requireStub['../services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'OK',
                object: mockResponse
            });
            profile.custom.b2ccrm_contactId = undefined;
            customerProcessHook.loggedIn(profile);

            expect(profile.custom.b2ccrm_syncStatus).to.be.equal('failed');
            expect(profile.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
        });

        it('should call the rest service to process the profile and update the profile custom attributes accordingly', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['../services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'OK',
                object: customerProcessMock
            });
            profile.custom.b2ccrm_contactId = undefined;
            customerProcessHook.loggedIn(profile);

            expect(profile.custom.b2ccrm_syncStatus).to.be.equal('exported');
            expect(profile.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
            expect(profile.custom.b2ccrm_accountId).to.be.equal(customerProcessMock[0].outputValues.Contact.AccountId);
            expect(profile.custom.b2ccrm_contactId).to.be.equal(customerProcessMock[0].outputValues.Contact.Id);
        });
    });

    describe('created', function () {
        it('should not do anything in case no profile is sent as parameter', function () {
            customerProcessHook.created();

            expect(spy).to.have.not.been.called;
        });

        it('should not do anything in case the B2C CRM Sync site preference is disabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncIsEnabled = false;
            site.customPreferences.b2ccrm_syncCustomersEnabled = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            customerProcessHook.created(profile);

            expect(spy).to.have.not.been.called;
        });

        it('should fail to update the profile if no auth token is found, or an error occur', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            customerProcessHook.created(profile);

            expect(spy).to.have.been.called;
            expect(profile.custom.b2ccrm_syncStatus).to.be.equal('failed');
            expect(profile.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
        });

        it('should call the rest service to process the profile and fail silently if the service replies an error', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['../services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'ERROR',
                error: 'error',
                errorMessage: 'message'
            });
            customerProcessHook.created(profile);

            expect(profile.custom.b2ccrm_syncStatus).to.be.equal('failed');
            expect(profile.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
        });

        it('should call the rest service to process the profile and fail silently if the service OK but contains errors', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            let mockResponse = JSON.parse(JSON.stringify(customerProcessMock));
            mockResponse[0].isSuccess = false;
            mockResponse[0].errors = ['error1', 'error2'];
            requireStub['../services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'OK',
                object: mockResponse
            });
            customerProcessHook.created(profile);

            expect(profile.custom.b2ccrm_syncStatus).to.be.equal('failed');
            expect(profile.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
        });

        it('should call the rest service to process the profile and update the profile custom attributes accordingly', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['../services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'OK',
                object: customerProcessMock
            });
            customerProcessHook.created(profile);

            expect(profile.custom.b2ccrm_syncStatus).to.be.equal('exported');
            expect(profile.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
            expect(profile.custom.b2ccrm_accountId).to.be.equal(customerProcessMock[0].outputValues.Contact.AccountId);
            expect(profile.custom.b2ccrm_contactId).to.be.equal(customerProcessMock[0].outputValues.Contact.Id);
        });
    });

    describe('updated', function () {
        it('should not do anything in case no profile is sent as parameter', function () {
            customerProcessHook.updated();

            expect(spy).to.have.not.been.called;
        });

        it('should not do anything in case the B2C CRM Sync site preference is disabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncIsEnabled = false;
            site.customPreferences.b2ccrm_syncCustomersEnabled = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            customerProcessHook.updated(profile);

            expect(spy).to.have.not.been.called;
        });

        it('should fail to update the profile if no auth token is found, or an error occur', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            customerProcessHook.updated(profile);

            expect(spy).to.have.been.called;
            expect(profile.custom.b2ccrm_syncStatus).to.be.equal('failed');
            expect(profile.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
        });

        it('should call the rest service to process the profile and fail silently if the service replies an error', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['../services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'ERROR',
                error: 'error',
                errorMessage: 'message'
            });
            customerProcessHook.updated(profile);

            expect(profile.custom.b2ccrm_syncStatus).to.be.equal('failed');
            expect(profile.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
        });

        it('should call the rest service to process the profile and fail silently if the service OK but contains errors', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            let mockResponse = JSON.parse(JSON.stringify(customerProcessMock));
            mockResponse[0].isSuccess = false;
            mockResponse[0].errors = ['error1', 'error2'];
            requireStub['../services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'OK',
                object: mockResponse
            });
            customerProcessHook.updated(profile);

            expect(profile.custom.b2ccrm_syncStatus).to.be.equal('failed');
            expect(profile.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
        });

        it('should call the rest service to process the profile and update the profile custom attributes accordingly', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['../services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'OK',
                object: customerProcessMock
            });
            customerProcessHook.updated(profile);

            expect(profile.custom.b2ccrm_syncStatus).to.be.equal('exported');
            expect(profile.custom.b2ccrm_syncResponseText.length).to.not.be.equal(0);
            expect(profile.custom.b2ccrm_accountId).to.be.equal(customerProcessMock[0].outputValues.Contact.AccountId);
            expect(profile.custom.b2ccrm_contactId).to.be.equal(customerProcessMock[0].outputValues.Contact.Id);
        });
    });
});
