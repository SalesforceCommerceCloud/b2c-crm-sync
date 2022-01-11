import { LightningElement, api, track, wire } from 'lwc';
import {
    FlowNavigationNextEvent,
} from 'lightning/flowSupport';
import getPromotionsLabels from '@salesforce/apex/B2CActiveCustomerPromotions.getPromotionsLabels';

export default class B2CActiveCustomerPromotions extends LightningElement {
    @api promotionsAsJSON;
    @api allowGetCouponCodes;
    @api recordId;
    @api siteId;
    @api maximumCouponCodes;
    @track promotions;
    @track fields;

    /**
     * Retrieve field labels
     */
    @wire(getPromotionsLabels)
    fetchPromotionsFields({ error, data }) {
        if (data && data.length > 0) {
            this.fields = data;
            this.promotions = this.promotionsAsJSON ? JSON.parse(this.promotionsAsJSON) : [];
        } else {
            this.fields = [];
        }
    };

    handleRefresh(e) {
        const navigateNextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(navigateNextEvent);
    }

    get headerTitle() {
        return `B2C Active Customer Promotions (${this.promotions ? this.promotions.length : 0})`;
    }

    get hasPromotions() {
        return this.promotions && this.promotions.length > 0;
    }

    get fieldsCount() {
        return this.fields ? this.fields.length : 0;
    }
}
