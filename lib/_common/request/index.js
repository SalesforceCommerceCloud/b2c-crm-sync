module.exports = {
    // Include common functions
    addBearerToken: require('./_addBearerToken'),
    addContentTypeHeader: require('./_addContentTypeHeader'),
    addGenericHeader: require('./_addGenericHeader'),
    buildOCAPIUrl: require('./_buildOCAPIUrl'),
    createAMJWT: require('./_createAMJWT'),
    createAMJWTAuthRequestDef: require('./_createAMJWTAuthRequestDef'),
    createOCAPIAuthRequestDef: require('./_createOCAPIAuthRequestDef'),
    createOCAPIDataRequestDef: require('./_createOCAPIDataRequestDef'),
    createOCAPIShopRequestDef: require('./_createOCAPIShopRequestDef'),
    createRequestInstance: require('./_createRequestInstance')
};
