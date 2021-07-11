'use strict';

// Initialize constants
const fs = require('fs');
const sfdx = require('sfdx-node');
const parse = require('xml-parser');

/**
 * @private
 * @function getSortOrder
 * @description Helper function to pull the sortOrder for a given duplicateRule from
 * the parsed meta-data .xml content -- so that we can apply it to our updated template
 *
 * @param {String} parsedXML Represents SFDX meta-data .xml for the duplicate rule
 * @returns {Object} Returns the duplicateRule that was found
 */
function getSortOrder(parsedXML) {

    // Initialize local variables
    let output = {},
        thisChildElement;

    // Get the children in the document first
    /** @type {Array} **/
    output.parsedChildren = parsedXML.root.children;

    // Iterate over the collection of parsed children
    for (let elementIndex in output.parsedChildren) {

        // Create a reference to the current child
        thisChildElement = output.parsedChildren[elementIndex];

        // Find the sortOrder node and retrieve the content element
        if (thisChildElement.name === 'sortOrder') {

            // Seed the sortOrder details
            output.sortOrderElement = thisChildElement;
            output.value = thisChildElement.content;

        }

    }

    // Return the sortOrder
    return output;

}

/**
 * @private
 * @function getDuplicateRule
 * @description Helper function to locate a specific duplicateRule from the collection
 * of rules that were retrieved from the Salesforce org
 *
 * @param {Array} duplicateRules Represents the collection of rules for the Salesforce org
 * @param {String} sObjectType Represents the sObjectType being rendered
 * @param {String} ruleName Describes the rule templateName to render
 * @returns {Object} Returns the duplicateRule that was found
 */
function getDuplicateRule(duplicateRules, sObjectType, ruleName) {

    // Initialize local variables
    let output;

    // Iterate over the collection of duplicateRules
    for (let thisRule of duplicateRules) {

        // Is the current duplicateRule equal to the ruleName specified?
        if (thisRule.DeveloperName === ruleName && thisRule.SobjectType === sObjectType) {

            // Flag that we have a match
            output = thisRule;

            // And exist
            break;

        }

    }

    // Return the output value
    return output;

}


/**
 * @function _duplicateRuleCreate
 * @description Attempts to create a duplicateRule associated to a given sObject and copy the
 * duplicate rule to the scratchOrg-specific duplicateRule folder
 *
 * @param {String} templatePath Represents the path of the source template to render
 * @param {String} deployPath Represent the path to copy the rendered duplicateRule to
 * @param {String} tmpPath Represent the temporary working path for deployments
 * @param {Array} duplicateRules Describes the duplicateRules configured in the Salesforce org
 * @param {String} sObjectType Describes the sObjectType to review and render against
 * @param {String} ruleName Describes the rule templateName to render
 * @param {Number} offsetValue Describes the offset value to append to the sequence
 * @returns {Promise} Returns the result of the duplicateRule creation request
 */
module.exports = (templatePath, deployPath, tmpPath, duplicateRules,
    sObjectType, ruleName, offsetValue = 0) =>
    new Promise(async (resolve, reject) => {

        // Initialize local variables
        let output = {};

        try {

            // Create the fileName for this duplicateRule
            output.fileName = `${sObjectType}.${ruleName}.duplicateRule-meta.xml`;

            // Calculate the full template and deploy paths for the template to be read and rendered
            output.templatePath = `${templatePath}${output.fileName}`;
            output.deployPath = `${deployPath}${output.fileName}`;
            output.tmpPath = `${tmpPath}${output.fileName}`;

            // Read-in the template path contents and record the ruleName we're implementing
            output.ruleTemplate = fs.readFileSync(output.templatePath, 'utf8');
            output.duplicateRuleName = ruleName;

            output.ruleSObjectType = sObjectType;
            if (sObjectType === 'PersonAccount') { output.ruleSObjectType = 'Account'; }

            // Attempt to retrieve / identify the duplicateRule
            output.thisRule = getDuplicateRule(
                duplicateRules.records,
                output.ruleSObjectType,
                ruleName);

            // Was a duplicateRule found?
            if (output.thisRule === undefined) {

                // If not, then let's calculate the sequenceNo for this rule
                output.sequenceNo = duplicateRules.records.length + offsetValue;

            } else {

                // Instead, write the empty template file in our working directory
                fs.writeFileSync(output.tmpPath, '');

                // Now, retrieve the duplicateRule meta-data from the source Salesforce org
                output.retrieveResults = await sfdx.force.source.retrieve({
                    sourcepath: output.tmpPath
                });

                // Read in the sourceTemplate contents and parse it
                output.sourceRule = fs.readFileSync(output.tmpPath, 'utf8');
                output.sourceRuleParsed = parse(output.sourceRule);
                output.sequenceNo = getSortOrder(output.sourceRuleParsed).value;

            }

            // Generate the rendered template (incorporating the sequenceNumber)
            output.renderedTemplate = output.ruleTemplate.replace('{{SEQUENCE}}', output.sequenceNo);

            // Now, write the file back to the deployment directory
            fs.writeFileSync(output.deployPath, output.renderedTemplate);

            // Capture that this was successful
            output.success = true;
            resolve(output);

        } catch (e) {

            // Otherwise, capture the exception
            output.success = false;
            output.error = e;
            output.stack = e.stack;
            reject(output);

        }

    });
