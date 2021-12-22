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
const serviceMock = require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/mocks/auth'));
const tokenObjectKeys = ['access_token', 'instance_url', 'id', 'token_type', 'issued_at', 'signature'];

describe('int_b2ccrmsync/cartridge/scripts/b2ccrmsync/models/authToken', function () {
    let sandbox;
    let spy;
    let authTokenModel;
    let requireStub;

    before('setup sandbox', function () {
        sandbox = sinon.createSandbox();
    });

    beforeEach('setup sandbox', function () {
        requireStub = {
            'dw/system/CacheMgr': require('dw-api-mock/dw/system/CacheMgr'),
            '*/cartridge/scripts/b2ccrmsync.config': config,
            '*/cartridge/scripts/b2ccrmsync/services/ServiceMgr': proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/ServiceMgr'), {
                '*/cartridge/scripts/b2ccrmsync.config': config,
                '*/cartridge/scripts/b2ccrmsync/util/helpers': require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/util/helpers'))
            })
        };
        authTokenModel = proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/models/authToken'), requireStub);
    });

    afterEach(function () {
        sandbox.restore();
        spy && spy.restore();
    });

    describe('getValidToken', function () {
        it('should return a token object if found in the cache and the token is still valid', function () {
            // Put now as issued date so that the token is not yet expired
            serviceMock.issued_at = Date.now();
            requireStub['dw/system/CacheMgr'].getCache = sandbox.stub().returns({
                get: () => {
                    return serviceMock;
                }
            });

            const token = authTokenModel.getValidToken();

            expect(token).to.not.be.undefined;
            expect(token).to.have.all.keys(tokenObjectKeys);
            tokenObjectKeys.forEach(key => expect(token[key]).to.not.be.null);
        });

        it('should throw an error saying no valid token exist when nothing is found in the cache and the service fails', function () {
            requireStub['dw/system/CacheMgr'].getCache = sandbox.stub().returns({
                get: () => {
                    return undefined;
                }
            });

            expect(authTokenModel.getValidToken).to.throw(Error, 'No auth token available, please verify your configuration!');
        });

        it('should throw an error saying no valid token exist when the token from the cache is expired', function () {
            requireStub['dw/system/CacheMgr'].getCache = sandbox.stub().returns({
                get: () => {
                    return serviceMock;
                }
            });

            const token = authTokenModel.getValidToken();

            expect(token).to.not.be.undefined;
            expect(token).to.have.all.keys(tokenObjectKeys);
            tokenObjectKeys.forEach(key => expect(token[key]).to.not.be.null);
        });

        it('should call the service if the cached value is undefined', function () {
            requireStub['dw/system/CacheMgr'].getCache = sandbox.stub().returns(require('dw-api-mock/dw/system/Cache'));
            spy = sinon.spy(require('dw-api-mock/dw/svc/Service').prototype, 'call');

            expect(authTokenModel.getValidToken).to.throw(Error, 'No auth token available, please verify your configuration!');
            expect(spy).to.have.been.calledOnce;
        });
    });
});
