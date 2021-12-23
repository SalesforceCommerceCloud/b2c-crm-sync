import { LightningElement, api, track, wire } from 'lwc';
import {
    FlowNavigationNextEvent,
} from 'lightning/flowSupport';
import getCustomerAddressFormFields from '@salesforce/apex/B2CCustomerAddressBook.getCustomerAddressFormFields';
import getCustomerAddressById from '@salesforce/apex/B2CCustomerAddressBook.getCustomerAddressById';
import patchCustomerAddressById from '@salesforce/apex/B2CCustomerAddressBook.patchCustomerAddress';

export default class B2CAddressForm extends LightningElement {
    @api fields;
    @api customerId;
    @api addressId;
    @api viewMode;
    @track address;
    VIEW_MODE = 'view';
    MAXIMUM_FIELD_PER_COLUMN = 5;
    cache = {};
    selectors = {
        spinner: '[data-spinner]',
        formFields: '.slds-form lightning-input'
    };
    classes = {
        hide: 'slds-hide'
    };
    isLoading = true;
    error;

    renderedCallback() {
        this.cache.spinner = this.template.querySelector(this.selectors.spinner);
        this.cache.formFields = this.template.querySelectorAll(this.selectors.formFields);

        getCustomerAddressById({
            customerId: this.customerId,
            addressId: this.addressId
        }).then(data => {
            this.address = data;
            this.isLoading = false;
            this.cache.spinner.classList.add(this.classes.hide);
        });
    }

    /**
     * Retrieve field labels
     */
    @wire(getCustomerAddressFormFields)
    fetchAddressesFields({ error, data }) {
        this.fields = data && data.length > 0 ? data : [];
    };

    handleSave(event) {
        if (this.viewMode === this.VIEW_MODE) {
            return;
        }

        const updatedAddress = {};
        Array.from(this.cache.formFields).forEach(field => {
            updatedAddress[field.name] = field.value;
        });

        patchCustomerAddressById({
            customerId: this.customerId,
            addressId: this.addressId,
            address: updatedAddress
        })
        .catch(error => {
            this.error = error;
        });

        const navigateEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(navigateEvent);
    }

    handleClose(event) {
        const navigateEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(navigateEvent);
    }

    formFields(columnNb) {
        const fields = (this.fields || []);
        const columnFields = [];
        const start = columnNb * this.MAXIMUM_FIELD_PER_COLUMN;
        const end = Math.min(((columnNb + 1) * this.MAXIMUM_FIELD_PER_COLUMN), fields.length);

        for (let i = start; i < end ; ++i) {
            const field = fields[i];
            columnFields.push({
                id: field.id,
                label: field.label,
                value: this.address ? this.address[field.id] : '',
                disabled: this.viewMode === this.VIEW_MODE || field.id === 'AddressId'
            });
        }

        return columnFields;
    }

    get columns() {
        const cols = [];
        for (let i = 0 ; i < Math.round((this.fields || []).length / this.MAXIMUM_FIELD_PER_COLUMN) ; ++i) {
            cols.push({
                idx: i,
                fields: this.formFields(i)
            });
        }

        return cols;
    }

    get isViewMode() {
        return this.viewMode === this.VIEW_MODE;
    }
}