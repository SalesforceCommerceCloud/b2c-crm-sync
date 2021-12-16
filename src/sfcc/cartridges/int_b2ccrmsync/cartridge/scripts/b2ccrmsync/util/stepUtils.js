'use strict';

// Initialize platform classes
var Calendar = require('dw/util/Calendar');
var StringUtils = require('dw/util/StringUtils');

// Initialize constants
var DATETIME_FORMAT = "yyyy-MM-dd'T'hh:mm:ss";
var NOW_MINUS_MINUTES_REGEX = /_now_\s?-([0-9]+)/g; // Example: https://regex101.com/r/jYa91l/1
var TODAY_MINUS_DAYS_REGEX = /_today_\s?-([0-9]+)/g; // Example: https://regex101.com/r/H3ZGU4/1

/**
 * @description Returns true if the given {parameters} object contains a isDisabled
 * property as true. This will allow us to disable a step without removing it from
 * the configuration of the job
 *
 * @param {Object} parameters The parameters from the job configuration.
 * @param {Boolean} parameters.IsDisabled Describes if the jobStep should be disabled
 * @returns {Boolean} Returns true if the jobStep is enabled; false if disabled
 */
module.exports.isDisabled = function (parameters) {
    if (!parameters) {
        return false;
    }
    return ['true', true].indexOf(parameters.IsDisabled) > -1;
};

/**
 * @description Replace some placeholders found in the given {str} by dynamic values to
 * generate the jobStep details based on the configuration provided.
 *
 * -------------------------------------------
 * Available Placeholders
 * -------------------------------------------
 * _today_ -[0-9]+ : Will be the current date time minus xx days, formatted with the date time format.
 * This regexp allows you to apply dynamic time within the past, for example:
 * "_today_ -1" will return the current date minus 1 day
 * "_today_ -30" will return the current date minus 30 days
 * -------------------------------------------
 * _now_ -[0-9]+ : Will be the current date time minus xx minutes, formatted with the date time format.
 * This regexp allows you to apply dynamic time within the past, for example:
 * "_now_ -15" will return the current time minus 15 minutes
 * "_now_ -60" will return the current time minus 1 hour
 * "_now_ -1440" will return the current time minus 24 hours
 * -------------------------------------------
 * _today_ : Will be the current date, formatted with the date format
 * -------------------------------------------
 * _now_ : Will be the current date time, formatted with the date time format
 * -------------------------------------------
 * _siteid_ : Will be the current site ID
 * -------------------------------------------
 * @param {String} str Represents the string containing the placeholders to replace
 * @returns {String} Returns the string with the replaced placeholders
 */
module.exports.replacePlaceholders = function (str) {
    if (empty(str)) {
        return str;
    }

    /** @type {dw.util.Calendar} */
    var calendar = new Calendar();

    // This check has to be executed before the "_today_" pattern, else the "_today_"
    // pattern will take precedence on this one
    if (str.match(TODAY_MINUS_DAYS_REGEX)) {
        str = applyRegexOnString(
            str,
            TODAY_MINUS_DAYS_REGEX,
            Calendar.DATE,
            DATETIME_FORMAT
        );
    }

    // This check has to be executed before the "_now_" pattern, else the "_now_"
    // pattern will take precedence on this one
    if (str.match(NOW_MINUS_MINUTES_REGEX)) {
        str = applyRegexOnString(
            str,
            NOW_MINUS_MINUTES_REGEX,
            Calendar.MINUTE,
            DATETIME_FORMAT
        );
    }

    if (str.indexOf('_today_') > -1) {
        calendar.set(Calendar.HOUR, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        str = str.replace(
            /_today_/,
            StringUtils.formatCalendar(
                calendar,
                DATETIME_FORMAT
            )
        );
    }

    if (str.indexOf('_now_') > -1) {
        str = str.replace(
            /_now_/,
            StringUtils.formatCalendar(
                calendar,
                DATETIME_FORMAT
            )
        );
    }

    return str;
};

/**
 * @description Replace the matching of the given {regex} on the given {str} by the calculated values.
 *
 * @param {String} str The string on which to apply the regex to
 * @param {RegExp} regex The regex to apply
 * @param {Number} unit The calendar unit to use
 * @param {String} format The format to use to format the calendar value
 * @returns {String} Returns the updated stringValue
 */
function applyRegexOnString(str, regex, unit, format) {
    if (empty(str)) {
        return str;
    }

    var match;
    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (match.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        var value = parseInt(match[1], 10);
        if (!isNaN(value)) {
            var calendar = new Calendar();
            if (unit === Calendar.DATE) {
                calendar.set(Calendar.HOUR, 0);
                calendar.set(Calendar.MINUTE, 0);
                calendar.set(Calendar.SECOND, 0);
            }
            calendar.add(unit, -value);
            str = str.replace(match[0], StringUtils.formatCalendar(calendar, format));
        }
    }

    return str;
}
