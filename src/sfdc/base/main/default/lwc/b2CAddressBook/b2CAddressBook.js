import { LightningElement, api, track, wire } from 'lwc';
import {
    FlowAttributeChangeEvent,
    FlowNavigationNextEvent,
} from 'lightning/flowSupport';
import getCustomerAddressLabels from '@salesforce/apex/B2CCustomerAddressBook.getCustomerAddressLabels';
import getCustomerAddresses from '@salesforce/apex/B2CCustomerAddressBook.getCustomerAddresses';

export default class B2CAddressBook extends LightningElement {
    @api recordId;
    @api allowViewAddressDetails;
    @api allowEditAddressDetails;
    @api viewAddressId;
    @api editAddressId;
    @track fields
    @track addresses;
    isInitialized = false;
    cache = {};
    selectors = {
        spinner: '[data-spinner]',
        flowModal: 'c-flow-modal'
    };
    classes = {
        hide: 'slds-hide'
    };
    isLoading = true;

    renderedCallback() {
        this.cache.spinner = this.template.querySelector(this.selectors.spinner);
        this.cache.flowModal = this.template.querySelector(this.selectors.flowModal);
        this.viewAddressId = '';
        this.editAddressId = '';

        if (!this.isInitialized) {
            this.isInitialized = true;
            this.handleRefresh();
        }
    }

    /**
     * Retrieve field labels
     */
    @wire(getCustomerAddressLabels)
    fetchAddressesFields({ error, data }) {
        this.fields = data && data.length > 0 ? data : [];
    };

    viewAddressHandler(event) {
        this.viewAddressId = event.detail.addressId;
        this.editAddressId = '';
        const attributeChangeEvent = new FlowAttributeChangeEvent(
            'viewAddressId',
            event.detail.addressId
        );
        this.dispatchEvent(attributeChangeEvent);

        // navigate to the next screen
        const navigateNextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(navigateNextEvent);
    }

    editAddressHandler(event) {
        this.editAddressId = event.detail.addressId;
        this.viewAddressId = '';
        const attributeChangeEvent = new FlowAttributeChangeEvent(
            'editAddressId',
            event.detail.addressId
        );
        this.dispatchEvent(attributeChangeEvent);

        // navigate to the next screen
        const navigateNextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(navigateNextEvent);
    }

    handleRefresh(event) {
        this.isLoading = true;
        this.cache.spinner.classList.remove(this.classes.hide);

        getCustomerAddresses({
            recordId: this.recordId
        }).then(data => {
            this.addresses = data && data.length > 0 ? data : [];
            this.isLoading = false;
            this.cache.spinner.classList.add(this.classes.hide);
        });
    }

    get headerTitle() {
        return `B2C Customer Address Book (${this.addresses ? this.addresses.length : 0})`;
    }

    get hasAddresses() {
        return this.addresses && this.addresses.length > 0;
    }

    get fieldsCount() {
        return this.fields ? this.fields.length : 0;
    }
}