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

const requireStub = {};
const helpers = proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/util/helpers'), requireStub);

describe('int_b2ccrmsync/cartridge/scripts/util/helpers', function () {
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
});
