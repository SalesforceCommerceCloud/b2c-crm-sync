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

describe('int_b2ccrmsync/cartridge/scripts/b2ccrmsync/models/customer', function () {
    let sandbox;
    let spy;
    let profile;
    let requireStub;
    let CustomerModel;

    before('setup sandbox', function () {
        sandbox = sinon.createSandbox();
    });

    beforeEach(function () {
        profile = new Profile('0000001', 'jdoe@salesforce.com', 'Jane', 'Doe', 'aaaaaa', 'bbbbbb', 'cccccc');

        requireStub = {
            '*/cartridge/scripts/b2ccrmsync/util/helpers': require(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/util/helpers'))
        };
        CustomerModel = proxyquire(path.join(process.cwd(), 'src/sfcc/cartridges/int_b2ccrmsync/cartridge/scripts/b2ccrmsync/models/customer'), requireStub);
    });

    afterEach(function () {
        sandbox.restore();
        spy && spy.restore();
    });

    describe('getRequestBody', function () {
        it('should return a stringified body of the given profil details passed in parameters, when the model does no hold a profile', function () {
            const customer = new CustomerModel();
            const profileData = {
                Id: 110011,
                LastName: 'Doe',
                FirstName: 'John'
            };
            const result = customer.getRequestBody(profileData);
            const parsedResult = JSON.parse(result);

            expect(result).to.not.be.null;
            expect(result).to.not.be.empty;
            expect(parsedResult.inputs[0].sourceContact).to.deep.equal(profileData);
        });

        it('should return a stringified body of the given profil details passed in parameters, even if the model holds a profile', function () {
            const customer = new CustomerModel(profile);
            const profileData = {
                Id: 110011,
                LastName: 'Doe',
                FirstName: 'John'
            };
            const result = customer.getRequestBody(profileData);
            const parsedResult = JSON.parse(result);

            expect(result).to.not.be.null;
            expect(result).to.not.be.empty;
            expect(parsedResult.inputs[0].sourceContact).to.deep.equal(profileData);
        });

        it('should return a stringified body of the profile data sent within the model', function () {
            const customer = new CustomerModel(profile);
            const result = customer.getRequestBody();
            const parsedResult = JSON.parse(result);

            expect(result).to.not.be.null;
            expect(result).to.not.be.empty;
            expect(parsedResult.inputs[0].sourceContact).to.deep.equal({
                AccountId: profile.custom.b2ccrm_accountId,
                Id: profile.custom.b2ccrm_contactId,
                B2C_Customer_ID__c: profile.getCustomer().getID(),
                B2C_Customer_No__c: profile.getCustomerNo(),
                FirstName: profile.getFirstName(),
                LastName: profile.getLastName(),
                Email: profile.getEmail(),
                B2C_CustomerList_ID__c: 'ID' // Default ID from the dw-api-mock
            });
        });

        it('should return a stringified body of the profile data sent within the model, but without accountId nor contactId in case of first attempt', function () {
            profile.custom.b2ccrm_accountId = undefined;
            profile.custom.b2ccrm_contactId = undefined;
            const customer = new CustomerModel(profile);
            const result = customer.getRequestBody();
            const parsedResult = JSON.parse(result);

            expect(result).to.not.be.null;
            expect(result).to.not.be.empty;
            expect(parsedResult.inputs[0].sourceContact).to.deep.equal({
                B2C_Customer_ID__c: profile.getCustomer().getID(),
                B2C_Customer_No__c: profile.getCustomerNo(),
                FirstName: profile.getFirstName(),
                LastName: profile.getLastName(),
                Email: profile.getEmail(),
                B2C_CustomerList_ID__c: 'ID' // Default ID from the dw-api-mock
            });
        });

        it('should return an empty input body when no profile is given to the model', function () {
            const customer = new CustomerModel();
            const result = customer.getRequestBody();

            expect(result).to.equal('{"inputs":[{}]}');
        });
    });

    describe('updateStatus', function () {
        it('should save the given data into the profile custom attribute', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const customer = new CustomerModel(profile);
            customer.updateStatus('status');

            expect(spy).to.have.been.calledOnce;
            expect(customer.profile.custom.b2ccrm_syncStatus).to.be.equal('status');
        });

        it('should not do anything in case no profile is sent within the model', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const customer = new CustomerModel();
            customer.updateStatus('status');

            expect(spy).to.have.not.been.called;
        });
    });

    describe('updateExternalId', function () {
        it('should save the given data into the profile custom attributes', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const customer = new CustomerModel(profile);
            customer.updateExternalId('accountId', 'contactId');

            expect(spy).to.have.been.calledOnce;
            expect(customer.profile.custom.b2ccrm_accountId).to.be.equal('accountId');
            expect(customer.profile.custom.b2ccrm_contactId).to.be.equal('contactId');
        });

        it('should only save the account ID into the profile custom attribute', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const customer = new CustomerModel(profile);
            customer.updateExternalId('accountId');

            expect(spy).to.have.been.calledOnce;
            expect(customer.profile.custom.b2ccrm_accountId).to.be.equal('accountId');
            expect(customer.profile.custom.b2ccrm_contactId).to.be.equal(profile.custom.b2ccrm_contactId);
        });

        it('should only save the contact ID into the profile custom attribute', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const customer = new CustomerModel(profile);
            customer.updateExternalId(undefined, 'contactId');

            expect(spy).to.have.been.calledOnce;
            expect(customer.profile.custom.b2ccrm_accountId).to.be.equal(profile.custom.b2ccrm_accountId);
            expect(customer.profile.custom.b2ccrm_contactId).to.be.equal('contactId');
        });

        it('should not do anything in case no profile is sent within the model', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const customer = new CustomerModel();
            customer.updateExternalId('status');

            expect(spy).to.have.not.been.called;
        });
    });

    describe('updateSyncResponseText', function () {
        it('should save response text in the profile custom attribute if this is the first time the response text is saved and so the custom attribute is undefined', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            profile.custom.b2ccrm_syncResponseText = undefined;
            const customer = new CustomerModel(profile);
            customer.updateSyncResponseText('response text');
            const b2ccrm_syncResponseText = JSON.parse(customer.profile.custom.b2ccrm_syncResponseText);

            expect(spy).to.have.been.calledOnce;
            expect(b2ccrm_syncResponseText.length).to.be.equal(1);
            expect(b2ccrm_syncResponseText[0]).to.not.be.undefined;
        });

        it('should save response text in the profile custom attribute if this is the first time the response text is saved', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const customer = new CustomerModel(profile);
            customer.updateSyncResponseText('response text');
            const b2ccrm_syncResponseText = JSON.parse(customer.profile.custom.b2ccrm_syncResponseText);

            expect(spy).to.have.been.calledOnce;
            expect(b2ccrm_syncResponseText.length).to.be.equal(1);
            expect(b2ccrm_syncResponseText[0]).to.not.be.undefined;
        });

        it('should save response text in the profile custom attribute, even if we already saved response texts previously', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            profile.custom.b2ccrm_syncResponseText = JSON.stringify(['previously saved response text']);
            const customer = new CustomerModel(profile);
            customer.updateSyncResponseText('response text');
            const b2ccrm_syncResponseText = JSON.parse(customer.profile.custom.b2ccrm_syncResponseText);

            expect(spy).to.have.been.calledOnce;
            expect(b2ccrm_syncResponseText.length).to.be.equal(2);
            b2ccrm_syncResponseText.forEach(value => expect(value).to.not.be.undefined);
        });

        it('should save response text in the profile custom attribute, and make sure the response does never get bigger than 50,000 characters', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const customer = new CustomerModel(profile);
            for (let i = 0; i < 1001; ++i) {
                customer.updateSyncResponseText(`response text ${i}`);
            }

            expect(spy).to.have.been.called;
            // Ensure the array size is under the limit of 200
            expect(customer.profile.custom.b2ccrm_syncResponseText.length).to.be.below(50000);
        });

        it('should not do anything in case no profile is sent within the model', function () {
            spy = sinon.spy(require('dw-api-mock/dw/system/Transaction'), 'wrap');
            const customer = new CustomerModel();
            customer.updateSyncResponseText('response text');

            expect(spy).to.have.not.been.called;
        });
    });
});
