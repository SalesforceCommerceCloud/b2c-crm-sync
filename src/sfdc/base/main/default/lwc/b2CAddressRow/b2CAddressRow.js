import { LightningElement, api } from 'lwc';

export default class B2CAddressRow extends LightningElement {
    @api fields;
    @api address;
    @api allowView;
    @api allowEdit;

    handleMenuSelect(event) {
        const selectedItemValue = event.detail.value;
        this.dispatchEvent(new CustomEvent(`${selectedItemValue}address`, {
            detail: {
                addressId: this.address.AddressId
            }
        }));
    }

    get addressFields() {
        return this.fields.map(field => this.address[field.id]);
    }

    get showMenuButtons() {
        return this.allowView || this.allowEdit;
    }
}