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
const customerRetrieveMock = require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/mocks/customer.retrieve'));
const Profile = require('dw-api-mock/dw/customer/Profile');

const getEnabledSite = () => {
    const site = require('dw-api-mock/dw/system/Site').getCurrent();
    site.customPreferences.b2ccrm_syncIsEnabled = true;
    site.customPreferences.b2ccrm_syncCustomersEnabled = true;
    site.customPreferences.b2ccrm_syncCustomersOnLoginEnabled = true;
    return site;
};

describe('int_b2ccrmsync/cartridge/scripts/b2ccrmsync/hooks/customer.retrieve', function () {
    let sandbox;
    let spy;
    let requireStub;
    let profile;
    let customerRetrieveHook;

    before('setup sandbox', function () {
        sandbox = sinon.createSandbox();
    });

    beforeEach(function () {
        global.request.locale = 'en_US';
        requireStub = {
            'dw/system/Site': require('dw-api-mock/dw/system/Site'),
            'dw/system/HookMgr': require('dw-api-mock/dw/system/HookMgr'),
            'dw/web/Resource': require('dw-api-mock/dw/web/Resource'),
            '*/cartridge/scripts/b2ccrmsync/models/authToken': sandbox.stub().returns(require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/models/authToken'))),
            '*/cartridge/scripts/b2ccrmsync/services/ServiceMgr': require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/ServiceMgr')),
            '*/cartridge/scripts/b2ccrmsync.config': config,
            '*/cartridge/scripts/b2ccrmsync/util/helpers': helpers,
            '*/cartridge/scripts/b2ccrmsync/models/customer': proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/models/customer'), {
                '*/cartridge/scripts/b2ccrmsync/util/helpers': helpers
            })
        };
        customerRetrieveHook = proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/hooks/customer.retrieve'), requireStub);
        requireStub['dw/web/Resource'].msg = sandbox.stub().returns('Id,Lastname,CustomerNo');
        profile = new Profile();
        profile.customerNo = '0000001';
        profile.setEmail('jdoe@salesforce.com');
        profile.setLastName('Doe');
        profile.custom = {
            b2ccrm_contactId: 'bbbbbb',
            b2ccrm_accountId: 'cccccc',
            b2ccrm_syncResponseText: [],
            b2ccrm_syncStatus: undefined
        };
        spy = sinon.spy(require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/ServiceMgr')), 'callRestService');
    });

    afterEach(function () {
        sandbox.restore();
        spy && spy.restore();
    });

    describe('retrieve', function () {
        it('should not do anything in case no profile is sent as parameter', function () {
            const result = customerRetrieveHook.retrieve();

            expect(spy).to.have.not.been.called;
            expect(result).to.be.undefined;
        });

        it('should not do anything in case the B2C CRM Sync site preference is disabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncIsEnabled = false;
            site.customPreferences.b2ccrm_syncCustomersEnabled = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            const result = customerRetrieveHook.retrieve();

            expect(spy).to.have.not.been.called;
            expect(result).to.be.undefined;
        });

        it('should fail to retrieve the profile if no auth token is found, or an error occur', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['dw/system/HookMgr'].hasHook = sandbox.stub().returns(true);
            const result = customerRetrieveHook.retrieve();

            expect(spy).to.have.not.been.called;
            expect(result).to.be.undefined;
        });

        it('should fail to retrieve the profile if the object given in paremeters does not contain at least one required parameter', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['dw/system/HookMgr'].hasHook = sandbox.stub().returns(true);
            const result = customerRetrieveHook.retrieve({
                test: 'value'
            });

            expect(spy).to.have.not.been.called;
            expect(result).to.be.undefined;
        });

        it('should call the rest service to retrieve the profile and fail silently if the service replies an error', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['dw/system/HookMgr'].hasHook = sandbox.stub().returns(true);
            requireStub['*/cartridge/scripts/b2ccrmsync/services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'ERROR',
                error: 'error',
                errorMessage: 'message'
            });
            const result = customerRetrieveHook.retrieve(profile);

            expect(result).to.be.undefined;
        });

        it('should call the rest service to retrieve the profile and fail silently if the service OK but contains errors', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['dw/system/HookMgr'].hasHook = sandbox.stub().returns(true);
            let mockResponse = JSON.parse(JSON.stringify(customerRetrieveMock));
            mockResponse[0].isSuccess = false;
            mockResponse[0].errors = ['error1', 'error2'];
            requireStub['*/cartridge/scripts/b2ccrmsync/services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'OK',
                object: mockResponse
            });
            const result = customerRetrieveHook.retrieve(profile);

            expect(result).to.be.undefined;
        });

        it('should call the rest service to retrieve the profile and abort because no profile have been found', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['dw/system/HookMgr'].hasHook = sandbox.stub().returns(true);
            let mockResponse = JSON.parse(JSON.stringify(customerRetrieveMock));
            mockResponse[0].outputValues = undefined;
            requireStub['*/cartridge/scripts/b2ccrmsync/services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'OK',
                object: mockResponse
            });
            const result = customerRetrieveHook.retrieve(profile);

            expect(result).to.be.undefined;
        });

        it('should call the rest service to retrieve the profile and update the profile custom attributes accordingly', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['dw/system/HookMgr'].hasHook = sandbox.stub().returns(true);
            requireStub['*/cartridge/scripts/b2ccrmsync/services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'OK',
                object: customerRetrieveMock
            });

            const result = customerRetrieveHook.retrieve(profile, true);

            expect(result).to.not.be.undefined;
            expect(result).to.deep.equal(customerRetrieveMock[0].outputValues);
        });

        it('should call the rest service to retrieve the profile and update the profile custom attributes accordingly when sending an object as parameter', function () {
            const site = getEnabledSite();
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['dw/system/HookMgr'].hasHook = sandbox.stub().returns(true);
            requireStub['*/cartridge/scripts/b2ccrmsync/services/ServiceMgr'].callRestService = sandbox.stub().returns({
                status: 'OK',
                object: customerRetrieveMock
            });
            const result = customerRetrieveHook.retrieve({
                Id: '000001'
            });

            expect(result).to.not.be.undefined;
            expect(result).to.deep.equal(customerRetrieveMock[0].outputValues);
        });
    });
});
