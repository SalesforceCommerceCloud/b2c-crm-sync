'use strict';

const path = require('path');
const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const sinonTest = require('sinon-test');
sinon.test = sinonTest(sinon);
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire').noCallThru();
chai.use(sinonChai);
require('dw-api-mock/demandware-globals');
const config = require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync.config'));
const methodNames = ['createRequest', 'parseResponse', 'mockFull', 'getRequestLogMessage', 'getResponseLogMessage'];

describe('int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/rest', function () {
    let sandbox;
    let requireStub;
    let restService;

    before('setup sandbox', function () {
        sandbox = sinon.createSandbox();
    });

    beforeEach(function () {
        requireStub = {
            '*/cartridge/scripts/b2ccrmsync.config': config
        };
        restService = proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/rest'), requireStub);

    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('getServiceCallback', function () {
        it('should throw an error if no model is sent within the method', function () {
            expect(restService.getServiceCallback).to.throw(Error);
        });

        it('should throw an error if no operation is sent within the method', function () {
            expect(() => restService.getServiceCallback('model')).to.throw(Error);
        });

        it('should throw an error if the given model and operation sent within the method are not valid (not present within the configuration)', function () {
            expect(() => restService.getServiceCallback('model', 'operation')).to.throw(Error);
        });

        it('should return a service callback object when trying to get the customer retrieve service callback', function () {
            const result = restService.getServiceCallback('customer', 'retrieve');

            expect(result).to.not.be.undefined;
            methodNames.forEach(methodName => expect(result).to.respondTo(methodName));
        });

        it('should return a service callback object when trying to get the customer process service callback', function () {
            const result = restService.getServiceCallback('customer', 'process');

            expect(result).to.not.be.undefined;
            methodNames.forEach(methodName => expect(result).to.respondTo(methodName));
        });
    });
});
