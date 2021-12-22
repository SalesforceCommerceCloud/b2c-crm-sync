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

describe('int_b2ccrmsync/cartridge/scripts/b2ccrmsync/hooks/ocapi/shop.order', function () {
    let sandbox;
    let spy;
    let requireStub;
    let order;
    let shopHook;

    before('setup sandbox', function () {
        sandbox = sinon.createSandbox();
    });

    beforeEach(function () {
        requireStub = {
            'dw/system/Site': require('dw-api-mock/dw/system/Site'),
            'dw/system/HookMgr': require('dw-api-mock/dw/system/HookMgr'),
            '*/cartridge/scripts/b2ccrmsync.config': require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync.config'))
        };
        shopHook = proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/hooks/ocapi/shop.order'), requireStub);

        let Order = require('dw-api-mock/dw/order/Order');
        order = new Order();
        spy = sinon.spy(require('dw-api-mock/dw/system/HookMgr'), 'callHook');
    });

    afterEach(function () {
        sandbox.restore();
        spy && spy.restore();
    });

    describe('afterPOST', function () {
        it('should not do anything in case the B2C CRM Sync site preference is disabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncCustomersFromOrdersViaOCAPI = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            shopHook.afterPOST(order);

            expect(spy).to.have.not.been.called;
        });

        it('should not do anything in case the B2C CRM Sync site hook is not present in the codebase', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncCustomersFromOrdersViaOCAPI = true;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['dw/system/HookMgr'].hasHook = sandbox.stub().returns(false);
            shopHook.afterPOST(order);

            expect(spy).to.have.not.been.called;
        });

        it('should call the HookMgr if the preference is enabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncCustomersFromOrdersViaOCAPI = true;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            requireStub['dw/system/HookMgr'].hasHook = sandbox.stub().returns(true);
            shopHook.afterPOST(order);

            expect(spy).to.have.been.calledWith('app.order.created', 'created', order);
        });
    });
});
