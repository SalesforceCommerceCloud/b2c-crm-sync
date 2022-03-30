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

describe('int_b2ccrmsync/cartridge/scripts/b2ccrmsync/hooks/ocapi/shop.customer', function () {
    let sandbox;
    let hookSpy;
    let promotionSpy;
    let requireStub;
    let customer;
    let promotions;
    let customerResponse;
    let shopCustomerHook;

    before('setup sandbox', function () {
        sandbox = sinon.createSandbox();
    });

    beforeEach(function () {
        requireStub = {
            'dw/system/Site': require('dw-api-mock/dw/system/Site'),
            'dw/system/HookMgr': require('dw-api-mock/dw/system/HookMgr'),
            'dw/campaign/PromotionMgr': require('dw-api-mock/dw/campaign/PromotionMgr'),
            'dw/campaign/PromotionPlan': require('dw-api-mock/dw/campaign/PromotionPlan'),
            '*/cartridge/scripts/b2ccrmsync.config': require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync.config'))
        };
        shopCustomerHook = proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/hooks/ocapi/shop.customer'), requireStub);

        let Profile = require('dw-api-mock/dw/customer/Profile');
        let Customer = require('dw-api-mock/dw/customer/Customer');
        let Promotion = require('dw-api-mock/dw/campaign/Promotion');
        customer = new Customer(new Profile());
        customerResponse = {};
        promotions = [new Promotion(), new Promotion()];
        hookSpy = sinon.spy(require('dw-api-mock/dw/system/HookMgr'), 'callHook');
        promotionSpy = sinon.spy(require('dw-api-mock/dw/campaign/PromotionMgr'), 'getActiveCustomerPromotions');
    });

    afterEach(function () {
        sandbox.restore();
        hookSpy && hookSpy.restore();
        promotionSpy && promotionSpy.restore();
    });

    describe('afterPOST', function () {
        it('should not do anything in case the B2C CRM Sync site preference is disabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncCustomersViaOCAPI = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            shopCustomerHook.afterPOST(customer);

            expect(hookSpy).to.have.not.been.called;
        });

        it('should not do anything in case the B2C CRM Sync site hook is not present in the codebase', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncCustomersViaOCAPI = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['dw/system/HookMgr'].hasHook = sandbox.stub().returns(false);
            shopCustomerHook.afterPOST(customer);

            expect(hookSpy).to.have.not.been.called;
        });

        it('should not do anything in case the customer is not authenticated', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncCustomersViaOCAPI = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            customer.authenticated = false;
            shopCustomerHook.afterPOST(customer);

            expect(hookSpy).to.have.not.been.called;
        });

        it('should call the HookMgr if the preference is enabled and the customer is authenticated', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncCustomersViaOCAPI = true;
            requireStub['dw/system/HookMgr'].hasHook = sandbox.stub().returns(true);
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            customer.authenticated = true;
            shopCustomerHook.afterPOST(customer);

            expect(hookSpy).to.have.been.calledWith('app.customer.created', 'created', customer.getProfile());
        });
    });

    describe('afterPATCH', function () {
        it('should not do anything in case the B2C CRM Sync site preference is disabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncCustomersViaOCAPI = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            shopCustomerHook.afterPATCH(customer);

            expect(hookSpy).to.have.not.been.called;
        });

        it('should not do anything in case the B2C CRM Sync site hook is not present in the codebase', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncCustomersViaOCAPI = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['dw/system/HookMgr'].hasHook = sandbox.stub().returns(false);
            shopCustomerHook.afterPATCH(customer);

            expect(hookSpy).to.have.not.been.called;
        });

        it('should not do anything in case the customer is not authenticated', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncCustomersViaOCAPI = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            customer.authenticated = false;
            shopCustomerHook.afterPATCH(customer);

            expect(hookSpy).to.have.not.been.called;
        });

        it('should call the HookMgr if the preference is enabled and the customer is authenticated', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncCustomersViaOCAPI = true;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['dw/system/HookMgr'].hasHook = sandbox.stub().returns(true);
            customer.authenticated = true;
            shopCustomerHook.afterPATCH(customer);

            expect(hookSpy).to.have.been.calledWith('app.customer.updated', 'updated', customer.getProfile());
        });
    });

    describe('modifyGETResponse', function () {
        it('should not do anything in case the B2C CRM Sync site preference is disabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncEnhanceOCAPICustomerResponse = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            shopCustomerHook.modifyGETResponse(customer, customerResponse);

            expect(promotionSpy).to.have.not.been.called;
        });

        it('should not do anything in case the B2C CRM Sync site preference is enabled but the custom expand GET parameter is missing', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncEnhanceOCAPICustomerResponse = true;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            global.request.getHttpParameters = sandbox.stub().returns({});
            shopCustomerHook.modifyGETResponse(customer, customerResponse);

            expect(promotionSpy).to.have.not.been.called;
        });

        it('should call the PromotionMgr if the preference is enabled and the GET param is passed, but return no promotions', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncEnhanceOCAPICustomerResponse = true;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            global.request.getHttpParameters = sandbox.stub().returns({
                custom_expand: 'promotions'
            });
            var PromotionPlan = require('dw-api-mock/dw/campaign/PromotionPlan');
            var promotionPlan = new PromotionPlan([]);
            requireStub['dw/campaign/PromotionMgr'].getActiveCustomerPromotions = sandbox.stub().returns(promotionPlan);

            shopCustomerHook.modifyGETResponse(customer, customerResponse);

            expect(customerResponse.c_active_promotions).to.exist;
            expect(customerResponse.c_active_promotions.length).to.be.equal(0);
        });


        it('should provide promotions if the customer is eligible to promotions', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncEnhanceOCAPICustomerResponse = true;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            global.request.getHttpParameters = sandbox.stub().returns({
                custom_expand: 'promotions'
            });
            var PromotionPlan = require('dw-api-mock/dw/campaign/PromotionPlan');
            var promotionPlan = new PromotionPlan(promotions);
            requireStub['dw/campaign/PromotionMgr'].getActiveCustomerPromotions = sandbox.stub().returns(promotionPlan);

            shopCustomerHook.modifyGETResponse(customer, customerResponse);

            expect(customerResponse.c_active_promotions).to.exist;
            expect(customerResponse.c_active_promotions.length).to.not.be.equal(0);
        });
    });
});
