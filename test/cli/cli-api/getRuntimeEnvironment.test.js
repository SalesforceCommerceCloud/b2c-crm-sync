'use strict';

// Initialize constants
const config = require('config');

// Initialize any unit-test libraries
const seedProcessEnv = require('../../../lib/qa/util/_seedProcessEnv');

// Seed the process.env scope with the defined environment defaults
seedProcessEnv('unitTests.dotEnvironments.default');

// Initialize the assertion library
const assert = require('chai').assert;

/**
 * @private
 * @function _propertyValidator
 * @description Helper function used to assert that environmentProperties are found in
 * runtime environment definition
 *
 * @param {Object} runtimeEnvironmentDef Represents the rendered runtimeEnvironment definition
 * @param {Array} environmentProperties Represents the collection of properties to validate
 */
function _propertyValidator(runtimeEnvironmentDef, environmentProperties) {

    // Initialize local variables
    let thisProperty;

    // Loop over the collection of expected properties
    for (let propIndex = 0; propIndex < environmentProperties.length; propIndex++) {

        // Create a reference to the current property
        thisProperty = environmentProperties[propIndex];

        // Validate that each of the expected properties are found in the environmentDefinition
        assert.isTrue(runtimeEnvironmentDef.hasOwnProperty(thisProperty), `-- expected ${thisProperty} and could not find it in ${JSON.stringify(runtimeEnvironmentDef)}`);

    }

}

// Initialize local test dependencies
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');
const CommandObjMock = require('../../../lib/qa/util/_commandObjMock');

// Exercise the retrieval of the operation mode
describe('Get Runtime Environment via the API', function () {

    // Create an instance of the mock command object
    let commandObj,
        runtimeEnvironmentDef,
        environmentProperties;

    // Initialize the command object
    commandObj = new CommandObjMock();

    // Retrieve the collection of environment properties for QA testing
    // eslint-disable-next-line mocha/no-setup-in-describe
    environmentProperties = config.get('unitTests.cliOutputValidationAttributes.getEnvironment');

    it('returns a valid runtimeEnvironment object definition via the CLI', function () {

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Validate that the runtime environment returned a valid object
        assert.isTrue(typeof runtimeEnvironmentDef === 'object' && runtimeEnvironmentDef !== null, `-- expected a not-null object and encountered a ${typeof runtimeEnvironmentDef}`);

    });

    it('contains the expected collection of environment properties via the CLI', function () {

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Loop over the collection of expected properties and validate they exist
        assert.hasAnyKeys(runtimeEnvironmentDef, environmentProperties);

    });

    it('returns a valid runtimeEnvironment object definition via the API', function () {

        // Retrieve the runtime environment mimicking the API
        runtimeEnvironmentDef = getRuntimeEnvironment();

        // Validate that the runtime environment returned a valid object
        assert.isTrue(typeof runtimeEnvironmentDef === 'object' && runtimeEnvironmentDef !== null, `-- expected a not-null object and encountered a ${typeof runtimeEnvironmentDef}`);

    });

    it('contains the expected collection of environment properties via the API', function () {

        // Retrieve the runtime environment mimicking the API
        runtimeEnvironmentDef = getRuntimeEnvironment();

        // Loop over the collection of expected properties and validate they exist
        _propertyValidator(runtimeEnvironmentDef, environmentProperties);

    });

});
