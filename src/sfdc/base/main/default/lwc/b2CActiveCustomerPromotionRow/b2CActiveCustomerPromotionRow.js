import { LightningElement, api, track } from 'lwc';

import getCouponCodes from '@salesforce/apex/B2CActiveCustomerPromotions.getCouponCodes';

export default class B2CActiveCustomerPromotionRow extends LightningElement {
    @api fields;
    @api promotion;
    @api allowGetCouponCodes;
    @api maximumCouponCodes;
    @api recordId;
    @api siteId;
    @track buttonLabel = 'Retrieve coupon code(s)';
    @track errorMessage;
    @track couponCodes = [];
    @track isLoading = false;

    handleGetCouponCodes(event) {
        const { target } = event;
        const couponId = target.dataset.couponId;

        this.errorMessage = undefined;
        target.disabled = true;
        this.isLoading = true;

        getCouponCodes({
            recordId: this.recordId,
            couponId: couponId,
            siteId: this.siteId,
            maximumCouponCodes: this.maximumCouponCodes
        }).then(data => {
            this.isLoading = false;
            if (!data) {
                this.errorMessage = 'An error occurred while retrieving coupon codes. Please try again.';
                return;
            }
            this.couponCodes = data.map(coupon => {
                return {
                    type: 'icon',
                    label: coupon,
                    name: 'iconpill',
                    iconName: 'utility:coupon_codes'
                };
            });
        }).catch(() => {
            this.isLoading = false;
            this.errorMessage = 'An error occurred while retrieving coupon codes. Please try again.';
        });
    }

    get promotionsFields() {
        return this.fields.map(field => this.promotion[field.id]);
    }

    get isLoadingCouponCodes() {
        return this.isLoading;
    }

    get hasErrorMessage() {
        return typeof this.errorMessage !== 'undefined';
    }

    get hasCoupons() {
        return this.promotion && this.promotion.coupons && this.promotion.coupons.length > 0;
    }

    get hasCouponCodes() {
        return typeof this.couponCodes !== 'undefined' && this.couponCodes.length > 0;
    }
}
