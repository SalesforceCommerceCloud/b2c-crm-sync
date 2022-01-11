'use strict';

var Status = require('dw/system/Status');

/**
 * @function modifyGETResponse
 * @description This hook is used to improve the promotion response while fetching the promotion.
 * This allows to provide more data to the Core Platform.
 *
 * @param {dw/campaign/Promotion} promotion Represents the promotion being updated
 * @param {Object} promotionResponse Represents the response from the API
 * @returns {Status} Returns the status for the OCAPI request
 */
// eslint-disable-next-line no-unused-vars
function modifyGETResponse(promotion, promotionResponse) {
    if (!require('dw/system/Site').getCurrent().getCustomPreferenceValue('b2ccrm_syncEnhanceOCAPIPromotionResponse')) {
        return new Status(Status.OK);
    }

    var expand = request.getHttpParameters().custom_expand || [];
    if (expand.indexOf('coupons') > -1 && promotion.isBasedOnCoupons() && promotion.getCoupons().size() > 0) {
        promotionResponse.c_coupons = promotion.getCoupons().toArray().map(function (coupon) {
            return {
                id: coupon.getID()
            };
        });
    }

    return new Status(Status.OK);
}

module.exports.modifyGETResponse = modifyGETResponse;
