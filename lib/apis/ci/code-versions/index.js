module.exports = {
    // Include common functions
    activate: require('./_activate'),
    create: require('./_create'),
    list: require('./_getAll'),
    getActive: require('./_getActive'),
    getDetail: require('./_getDetail'),
    getToggle: require('./_getToggle'),

    // Include helper functions
    findActive: require('./_common/_findActive'),
    findToggle: require('./_common/_findToggle')
};
