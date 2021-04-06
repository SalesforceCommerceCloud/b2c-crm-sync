module.exports = {

    // eslint-disable-next-line no-unused-vars
    before: _config => {

        // Create an anonymous describe function that overrides the mocha test framework
        // This enables quokka to parse test scripts and not fail on unrecognized functions
        global.describe = function () {};

    }

};
