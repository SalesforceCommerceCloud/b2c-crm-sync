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
        return this.firstName;
    }

    getCustomer() {
        return this.customer;
    }

    getCustomerNo() {
        return this.customerNo;
    }
}

class Order {
    constructor(profile, customerEmail, lastName, firstName, sfContactId, sfAccountId) {
        this.profile = profile;
        this.customerEmail = customerEmail;
        this.billingAddress = {
            firstName: firstName,
            lastName: lastName,
            getFirstName: () => firstName,
            getLastName: () => lastName
        };
        this.customer = {
            getProfile: () => this.profile
        };
        this.custom = {
            b2ccrm_contactId: sfContactId,
            b2ccrm_accountId: sfAccountId,
            b2ccrm_syncResponseText: [],
            b2ccrm_syncStatus: undefined
        };
        this.orderNo = 'orderNo';
    }

    getOrderNo() {
        return this.orderNo;
    }

    getCustomer() {
        return this.customer;
    }

    getCustomerEmail() {
        return this.customerEmail;
    }

    getBillingAddress() {
        return this.billingAddress;
    }
}

describe('int_b2ccrmsync/cartridge/scripts/b2ccrmsync/models/order', function () {
    let sandbox;
    let spy;
    let profile;
    let orderObj;
    let requireStub;
    let OrderModel;

    before('setup sandbox', function () {
        sandbox = sinon.createSandbox();
    });

    beforeEach(function () {
        profile = new Profile('0000001', 'jdoe@salesforce.com', 'Jane', 'Doe', 'aaaaaa', 'bbbbbb', 'cccccc');
        orderObj = new Order(profile, 'jdoe@salesforce.com', 'Jane', 'Doe', 'bbbbbb', 'cccccc');

        requireStub = {
            '*/cartridge/scripts/b2ccrmsync/util/helpers': require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/util/helpers'))
        };
        OrderModel = proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/models/order'), requireStub);
    });

    afterEach(function () {
        sandbox.restore();
        spy && spy.restore();
    });

    describe('getRequestBody', function () {
        it('should return a stringified body of the order data sent within the model', function () {
            const order = new OrderModel(orderObj);
            const result = order.getRequestBody();
            const parsedResult = JSON.parse(result);

            expect(result).to.not.be.null;
            expect(result).to.not.be.empty;
            expect(parsedResult.inputs[0].sourceContact).to.deep.equal({
                FirstName: orderObj.getBillingAddress().getFirstName(),
                LastName: orderObj.getBillingAddress().getLastName(),
                Email: orderObj.getCustomerEmail(),
                B2C_CustomerList_ID__c: 'ID' // Default ID from the dw-api-mock
            });
        });

        it('should return a stringified body of the order data sent within the model, but without accountId nor contactId in case of first attempt', function () {
            orderObj.custom.b2ccrm_accountId = undefined;
            orderObj.custom.b2ccrm_contactId = undefined;
            const order = new OrderModel(orderObj);
            const result = order.getRequestBody();
            const parsedResult = JSON.parse(result);

            expect(result).to.not.be.null;
            expect(result).to.not.be.empty;
            expect(parsedResult.inputs[0].sourceContact).to.deep.equal({
                FirstName: orderObj.getBillingAddress().getFirstName(),
                LastName: orderObj.getBillingAddress().getLastName(),
                Email: orderObj.getCustomerEmail(),
                B2C_CustomerList_ID__c: 'ID' // Default ID from the dw-api-mock
            });
        });

        it('should return undefined when no order is given to the model', function () {
            const order = new OrderModel();
            const result = order.getRequestBody();

            expect(result).to.be.undefined;
        });
    });

    describe('updateStatus', function () {
        it('should save the given data into the order custom attribute', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const order = new OrderModel(orderObj);
            order.updateStatus('status');

            expect(spy).to.have.been.calledOnce;
            expect(orderObj.custom.b2ccrm_syncStatus).to.be.equal('status');
        });

        it('should not do anything in case no order is sent within the model', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const order = new OrderModel();
            order.updateStatus('status');

            expect(spy).to.have.not.been.called;
        });
    });

    describe('updateExternalId', function () {
        it('should save the given data into the order custom attributes', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const order = new OrderModel(orderObj);
            order.updateExternalId('accountId', 'contactId');

            expect(spy).to.have.been.calledOnce;
            expect(orderObj.custom.b2ccrm_accountId).to.be.equal('accountId');
            expect(orderObj.custom.b2ccrm_contactId).to.be.equal('contactId');
        });

        it('should only save the account ID into the order custom attribute', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const order = new OrderModel(orderObj);
            order.updateExternalId('accountId');

            expect(spy).to.have.been.calledOnce;
            expect(orderObj.custom.b2ccrm_accountId).to.be.equal('accountId');
            expect(orderObj.custom.b2ccrm_contactId).to.be.equal(profile.custom.b2ccrm_contactId);
        });

        it('should only save the contact ID into the order custom attribute', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const order = new OrderModel(orderObj);
            order.updateExternalId(undefined, 'contactId');

            expect(spy).to.have.been.calledOnce;
            expect(orderObj.custom.b2ccrm_accountId).to.be.equal(profile.custom.b2ccrm_accountId);
            expect(orderObj.custom.b2ccrm_contactId).to.be.equal('contactId');
        });

        it('should not do anything in case no order is sent within the model', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const order = new OrderModel();
            order.updateExternalId('status');

            expect(spy).to.have.not.been.called;
        });
    });

    describe('updateSyncResponseText', function () {
        it('should save response text in the order custom attribute if this is the first time the response text is saved and so the custom attribute is undefined', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            orderObj.custom.b2ccrm_syncResponseText = undefined;
            const order = new OrderModel(orderObj);
            order.updateSyncResponseText('response text');

            expect(spy).to.have.been.calledOnce;
            expect(orderObj.custom.b2ccrm_syncResponseText.length).to.be.equal(1);
            expect(orderObj.custom.b2ccrm_syncResponseText[0]).to.not.be.undefined;
        });

        it('should save response text in the order custom attribute if this is the first time the response text is saved', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const order = new OrderModel(orderObj);
            order.updateSyncResponseText('response text');

            expect(spy).to.have.been.calledOnce;
            expect(orderObj.custom.b2ccrm_syncResponseText.length).to.be.equal(1);
            expect(orderObj.custom.b2ccrm_syncResponseText[0]).to.not.be.undefined;
        });

        it('should save response text in the order custom attribute, even if we already saved response texts previously', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            orderObj.custom.b2ccrm_syncResponseText = ['previously saved response text'];
            const order = new OrderModel(orderObj);
            order.updateSyncResponseText('response text');

            expect(spy).to.have.been.calledOnce;
            expect(orderObj.custom.b2ccrm_syncResponseText.length).to.be.equal(2);
            orderObj.custom.b2ccrm_syncResponseText.forEach(value => expect(value).to.not.be.undefined);
        });

        it('should save response text in the order custom attribute, and remove the first element of the array as the limit is reached', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const order = new OrderModel(orderObj);
            for (let i = 0; i < 201; ++i) {
                order.updateSyncResponseText(`response text ${i}`);
            }

            expect(spy).to.have.been.called;
            // Ensure the array size is under the limit of 200
            expect(orderObj.custom.b2ccrm_syncResponseText.length).to.be.equal(199);
            orderObj.custom.b2ccrm_syncResponseText.forEach(value => expect(value).to.not.be.undefined);
        });

        it('should not do anything in case no order is sent within the model', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const order = new OrderModel();
            order.updateSyncResponseText('response text');

            expect(spy).to.have.not.been.called;
        });
    });
});
