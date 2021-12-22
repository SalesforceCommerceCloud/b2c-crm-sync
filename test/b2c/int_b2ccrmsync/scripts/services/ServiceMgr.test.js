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
const authMock = require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/mocks/auth'));
const customerRetrieveMock = require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/mocks/customer.retrieve'));
const customerProcessMock = require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/mocks/customer.process'));

describe('int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/ServiceMgr', function () {
    let sandbox;
    let requireStub;
    let restRequireStub;
    let serviceMgr;

    before('setup sandbox', function () {
        sandbox = sinon.createSandbox();
    });

    beforeEach(function () {
        global.request.locale = 'en_US';
        restRequireStub = {
            '*/cartridge/scripts/b2ccrmsync.config': config,
            '*/cartridge/scripts/b2ccrmsync/util/helpers': helpers,
            '*/cartridge/scripts/b2ccrmsync/models/authToken': proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/models/authToken'), {
                '*/cartridge/scripts/b2ccrmsync.config': config,
                '*/cartridge/scripts/b2ccrmsync/services/ServiceMgr': proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/ServiceMgr'), {
                    '*/cartridge/scripts/b2ccrmsync.config': config,
                    '*/cartridge/scripts/b2ccrmsync/util/helpers': helpers
                })
            })
        };
        requireStub = {
            'dw/svc/LocalServiceRegistry': require('dw-api-mock/dw/svc/LocalServiceRegistry'),
            '*/cartridge/scripts/b2ccrmsync/util/helpers': helpers,
            '*/cartridge/scripts/b2ccrmsync/services/mocks/auth': authMock,
            '*/cartridge/scripts/b2ccrmsync/models/authToken': proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/models/authToken'), {
                '*/cartridge/scripts/b2ccrmsync.config': config,
                '*/cartridge/scripts/b2ccrmsync/services/ServiceMgr': proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/ServiceMgr'), {
                    '*/cartridge/scripts/b2ccrmsync.config': config,
                    '*/cartridge/scripts/b2ccrmsync/util/helpers': helpers
                })
            }),
            '*/cartridge/scripts/b2ccrmsync.config': config,
            '*/cartridge/scripts/b2ccrmsync/services/rest': proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/rest'), restRequireStub)
        };
        serviceMgr = proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/ServiceMgr'), requireStub);
    });

    describe('getAuthService', function () {
        it('should return an instance of the LocaleServiceRegistry for the auth service', function () {
            const authService = serviceMgr.getAuthService();
            expect(authService).to.not.be.null;
        });

        it('should execute the service call', function () {
            const authService = serviceMgr.getAuthService();
            const token = authService.call();
            expect(token).to.not.be.null;
        });

        it('should execute the mockFull method of the service, and so return the mock as result', function () {
            const authService = serviceMgr.getAuthService();
            authService.mock = true;
            const token = authService.call();
            expect(token).to.not.be.null;
            expect(token).to.deep.equal(authMock);
        });
    });

    describe('callRestService', function () {
        it('should throw an error if no model is sent within the method', function () {
            expect(serviceMgr.callRestService).to.throw(Error);
        });

        it('should throw an error if no state is sent within the method', function () {
            expect(() => serviceMgr.callRestService('model')).to.throw(Error);
        });

        it('should throw an error if the given model and state sent within the method are not valid (not present within the configuration)', function () {
            expect(() => serviceMgr.callRestService('model', 'state')).to.throw(Error);
        });

        it('should throw an error as their is no auth token retrieved for the retrieve customer call', function () {
            expect(() => serviceMgr.callRestService('customer', 'retrieve')).to.throw(Error, 'No auth token available, please verify your configuration!');
        });

        it('should throw an error as their is no auth token retrieved for the process customer call', function () {
            expect(() => serviceMgr.callRestService('customer', 'process')).to.throw(Error, 'No auth token available, please verify your configuration!');
        });

        it('should execute the service call to retrieve the customer by using a valid Auth token', function () {
            // Apply the mock as response of the access token API call
            restRequireStub['*/cartridge/scripts/b2ccrmsync/models/authToken'].getValidToken = () => authMock;
            const result = serviceMgr.callRestService('customer', 'retrieve');
            expect(result).to.not.be.null;
        });

        it('should execute the service call to process the customer by using a valid Auth token', function () {
            // Apply the mock as response of the access token API call
            restRequireStub['*/cartridge/scripts/b2ccrmsync/models/authToken'].getValidToken = () => authMock;
            const result = serviceMgr.callRestService('customer', 'process');
            expect(result).to.not.be.null;
        });

        it('should execute the mockFull method of the retrieve service, and so return the mock as result', function () {
            const serviceInstance = new (require('dw-api-mock/dw/svc/HTTPService'))(
                proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/rest'), {
                    '*/cartridge/scripts/b2ccrmsync.config': config,
                    '*/cartridge/scripts/b2ccrmsync/services/mocks/customer.retrieve': customerRetrieveMock,
                    '*/cartridge/scripts/b2ccrmsync/models/authToken': requireStub['*/cartridge/scripts/b2ccrmsync/models/authToken']
                }
                ).getServiceCallback('customer', 'retrieve'),
                'POST'
            );
            serviceInstance.mock = true;
            requireStub['dw/svc/LocalServiceRegistry'].createService = sandbox.stub().returns(serviceInstance);
            const result = serviceMgr.callRestService('customer', 'retrieve');
            expect(result).to.not.be.null;
            expect(result).to.deep.equal(customerRetrieveMock);
        });

        it('should execute the mockFull method of the process service, and so return the mock as result', function () {
            const serviceInstance = new (require('dw-api-mock/dw/svc/HTTPService'))(
                proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/services/rest'), {
                    '*/cartridge/scripts/b2ccrmsync.config': config,
                    '*/cartridge/scripts/b2ccrmsync/services/mocks/customer.process': customerProcessMock,
                    '*/cartridge/scripts/b2ccrmsync/models/authToken': requireStub['*/cartridge/scripts/b2ccrmsync/models/authToken']
                }
                ).getServiceCallback('customer', 'process'),
                'POST'
            );
            serviceInstance.mock = true;
            requireStub['dw/svc/LocalServiceRegistry'].createService = sandbox.stub().returns(serviceInstance);
            const result = serviceMgr.callRestService('customer', 'process');
            result.mock = true;
            expect(result).to.not.be.null;
            expect(result).to.deep.equal(customerProcessMock);
        });
    });
});
