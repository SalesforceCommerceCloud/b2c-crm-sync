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

describe('int_b2ccrmsync/cartridge/scripts/b2ccrmsync/hooks/ocapi/shop.promotion', function () {
    let sandbox;
    let requireStub;
    let promotion;
    let promotionResponse;
    let shopPromotionHook;

    before('setup sandbox', function () {
        sandbox = sinon.createSandbox();
    });

    beforeEach(function () {
        requireStub = {
            'dw/system/Site': require('dw-api-mock/dw/system/Site'),
            '*/cartridge/scripts/b2ccrmsync.config': require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync.config'))
        };
        shopPromotionHook = proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/hooks/ocapi/shop.promotion'), requireStub);

        let Promotion = require('dw-api-mock/dw/campaign/Promotion');
        promotion = new Promotion();
        promotionResponse = {};
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('modifyGETResponse', function () {
        it('should not do anything in case the B2C CRM Sync site preference is disabled', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncEnhanceOCAPIPromotionResponse = false;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            shopPromotionHook.modifyGETResponse(promotion, promotionResponse);

            expect(promotionResponse.c_coupons).to.not.exist;
        });

        it('should not do anything in case the B2C CRM Sync site preference is enabled but the custom expand GET parameter is missing', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncEnhanceOCAPIPromotionResponse = true;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            global.request.getHttpParameters = sandbox.stub().returns({});
            shopPromotionHook.modifyGETResponse(promotion, promotionResponse);

            expect(promotionResponse.c_coupons).to.not.exist;
        });

        it('should try to add coupons if the preference is enabled and the GET param is passed, but return no coupons as the promotion is not based on coupons', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncEnhanceOCAPIPromotionResponse = true;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            global.request.getHttpParameters = sandbox.stub().returns({
                custom_expand: 'coupons'
            });
            shopPromotionHook.modifyGETResponse(promotion, promotionResponse);

            expect(promotionResponse.c_coupons).to.not.exist;
        });


        it('should provide coupon IDs if the customer is eligible to promotions based on coupons', function () {
            const site = require('dw-api-mock/dw/system/Site').getCurrent();
            site.customPreferences.b2ccrm_syncEnhanceOCAPIPromotionResponse = true;
            requireStub['dw/system/Site'].getCurrent = sandbox.stub().returns(site);
            promotion.coupons.add({
                id: 'test',
                getID: () => {
                    return 'test';
                }
            });
            global.request.getHttpParameters = sandbox.stub().returns({
                custom_expand: 'coupons'
            });
            shopPromotionHook.modifyGETResponse(promotion, promotionResponse);

            expect(promotionResponse.c_coupons).to.exist;
            expect(promotionResponse.c_coupons.length).to.not.be.equal(0);
            expect(promotionResponse.c_coupons[0].id).to.be.equal('test');
        });
    });
});
