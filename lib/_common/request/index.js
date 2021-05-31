module.exports = {
    // Include common functions
    addBasicAuthHeader: require('./_addBasicAuthHeader'),
    addBearerToken: require('./_addBearerToken'),
    addContentTypeHeader: require('./_addContentTypeHeader'),
    addGenericHeader: require('./_addGenericHeader'),
    buildOCAPIUrl: require('./_buildOCAPIUrl'),
    createOCAPIAuthRequestDef: require('./_createOCAPIAuthRequestDef'),
    createOCAPIDataRequestDef: require('./_createOCAPIDataRequestDef'),
    createOCAPIShopRequestDef: require('./_createOCAPIShopRequestDef'),
    createRequestInstance: require('./_createRequestInstance')
};
