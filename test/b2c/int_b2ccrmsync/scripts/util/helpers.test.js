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

const requireStub = {
    'dw/system/Site': require('dw-api-mock/dw/system/Site')
};
const helpers = proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/util/helpers'), requireStub);

describe('int_b2ccrmsync/cartridge/scripts/b2ccrmsync/util/helpers', function () {
    describe('expandJSON', function () {
        it('should parse the given string into a valid object', function () {
            const obj = {
                test: 1,
                value: true
            };
            const newObj = helpers.expandJSON(JSON.stringify(obj));

            expect(newObj).to.not.be.null;
            expect(newObj).to.deep.equal(obj);
        });

        it('should parse the given string into a valid object and return it even if we provide a default value', function () {
            const obj = {
                test: 1,
                value: true
            };
            const defaultObj = {
                test: 2,
                value: false
            };
            const newObj = helpers.expandJSON(JSON.stringify(obj), defaultObj);

            expect(newObj).to.not.be.null;
            expect(newObj).to.deep.equal(obj);
            expect(newObj).to.not.deep.equal(defaultObj);
        });

        it('should fail in case we don\'t provide a string as first parameter, and so return an undefined object', function () {
            const obj = {
                test: 1,
                value: true
            };
            const newObj = helpers.expandJSON(obj);

            expect(newObj).to.be.undefined;
        });

        it('should fail in case we don\'t provide a string as first parameter, and so return the default object', function () {
            const obj = {
                test: 1,
                value: true
            };
            const defaultObj = {
                test: 2,
                value: false
            };
            const newObj = helpers.expandJSON(obj, defaultObj);

            expect(newObj).to.not.be.null;
            expect(newObj).to.deep.equal(defaultObj);
            expect(newObj).to.not.deep.equal(obj);
        });

        it('should fail to parse the object, and so return undefined as no default value is provided', function () {
            const newObj = helpers.expandJSON(undefined);

            expect(newObj).to.be.undefined;
        });

        it('should fail to parse the object, and so return the provided default value', function () {
            const obj = {
                test: 1,
                value: true
            };
            const newObj = helpers.expandJSON(undefined, obj);

            expect(newObj).to.not.be.null;
            expect(newObj).to.deep.equal(obj);
        });
    });

    describe('isIntegrationEnabled', function () {
        it('should be enabled if both preferences are enabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncIsEnabled = true;
            site.customPreferences.b2ccrm_syncCustomersEnabled = true;
            const isEnabled = helpers.isIntegrationEnabled();

            expect(isEnabled).to.be.true;
        });

        it('should be disabled if the b2ccrm_syncIsEnabled preference is disabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncIsEnabled = false;
            site.customPreferences.b2ccrm_syncCustomersEnabled = true;
            const isEnabled = helpers.isIntegrationEnabled();

            expect(isEnabled).to.not.be.true;
        });

        it('should be disabled if the b2ccrm_syncCustomersEnabled preference is disabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncIsEnabled = true;
            site.customPreferences.b2ccrm_syncCustomersEnabled = false;
            const isEnabled = helpers.isIntegrationEnabled();

            expect(isEnabled).to.not.be.true;
        });

        it('should be disabled if both preferences are disabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncIsEnabled = false;
            site.customPreferences.b2ccrm_syncCustomersEnabled = false;
            const isEnabled = helpers.isIntegrationEnabled();

            expect(isEnabled).to.not.be.true;
        });
    });

    describe('sfdcContactIDIdentifierPresent', function () {
        it('should return false if the profile is undefined', function () {
            const hasContactId = helpers.sfdcContactIDIdentifierPresent(undefined);

            expect(hasContactId).to.be.false;
        });

        it('should return false if the profile is null', function () {
            const hasContactId = helpers.sfdcContactIDIdentifierPresent(null);

            expect(hasContactId).to.be.false;
        });

        it('should return false if the profile has no b2ccrm_contactId custom property', function () {
            const hasContactId = helpers.sfdcContactIDIdentifierPresent({
                custom: {}
            });

            expect(hasContactId).to.be.false;
        });

        it('should return false if the profile\'s b2ccrm_contactId custom property is undefined', function () {
            const hasContactId = helpers.sfdcContactIDIdentifierPresent({
                custom: {
                    b2ccrm_contactId: undefined
                }
            });

            expect(hasContactId).to.be.false;
        });

        it('should return false if the profile\'s b2ccrm_contactId custom property is null', function () {
            const hasContactId = helpers.sfdcContactIDIdentifierPresent({
                custom: {
                    b2ccrm_contactId: null
                }
            });

            expect(hasContactId).to.be.false;
        });

        it('should return false if the profile\'s b2ccrm_contactId custom property is an empty string', function () {
            const hasContactId = helpers.sfdcContactIDIdentifierPresent({
                custom: {
                    b2ccrm_contactId: ''
                }
            });

            expect(hasContactId).to.be.false;
        });

        it('should return true if the profile\'s b2ccrm_contactId custom property exists', function () {
            const hasContactId = helpers.sfdcContactIDIdentifierPresent({
                custom: {
                    b2ccrm_contactId: 'id'
                }
            });

            expect(hasContactId).to.be.true;
        });
    });
});
