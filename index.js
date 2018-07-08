const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const { get } = require('./cli-args');

/**
 * get command line arguments
 * @param {String} header header for command-line-usage
 * @param {String} content content for command-line-usage
 * @param {Array<Object>} optionDefinitions option definitions for command-line-args
 * @param {Object} log logger
 */
module.exports.get = (header, content, optionDefinitions, log) => get(
  header, content, optionDefinitions, log,
  commandLineArgs, commandLineUsage, console,
);
