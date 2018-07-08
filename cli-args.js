/* eslint-disable no-underscore-dangle */
const { isNil, nth, path } = require('ramda');

/**
 * adds a help option to the argument specifications
 * @param {Array<Object>} ss argument specifications
 */
const addHelp = ss => ([
  {
    name: 'help', alias: '?', type: Boolean, defaultValue: false, description: 'Display this help',
  },
  ...ss,
]);

/**
 * adds an indication of default value to the description
 * @param {Array<Object>} ss argument specifications
 */
const applyDefaultValueHelp = ss => ss.map(s => ({
  ...s,
  description:
    s.description + (!isNil(s.defaultValue) ? ` (default ${s.defaultValue.toString()})` : ''),
}));

/**
 * returns list of missing arguments
 * @param {Array<String>} as command line arguments
 * @param {Array<Object>} ss argument specifications
 */
const missingArgs = (as, ss) => ss.filter(s => isNil(as[s.name])).filter(s => s.name !== 'help');

/**
 * returns list of missing argument errors
 * @param {Array<Object>} ss argument specifications
 */
const missingErrors = ss => ss.map(s => new Error(`${s.name} is required`));

/**
 * returns a boolean to indicate whether the value is numeric
 * @param {Any} x the value
 */
const isNumeric = x => !Number.isNaN(Number.parseInt(x, 10));

/**
 * return list of numeric arguments that have non-numeric values
 * @param {Array<String>} as command line arguments
 * @param {Array<Object>} ss argument specifications
 */
const nonNumericArgs = (as, ss) => ss.filter(s => s.type === Number && !isNumeric(as[s.name]));

/**
 * returns a list of non-numeric errors
 * @param {Array<Object>} ss argument specifications
 */
const notNumericErrors = ss => ss.map(s => new Error(`${s.name} must be a number`));

/**
 * returns a list of regular expression arguments that do not match
 * @param {Array<String>} as command line arguments
 * @param {Array<Object>} ss argument specifications
 */
const nonRegExMatchingArgs = (as, ss) => ss.filter(
  s => s.validationRegularExpression && !s.validationRegularExpression.test(as[s.name]),
);

/**
 * returns a list of regular expression arguments that do not match errors
 * @param {Array<Object>} ss argument specifications
 */
const notRegExMatchingErrors = ss => ss.map(
  s => new Error(s.validationMessage || `${s.name} must satisfy regular expression`),
);

/**
 * returns the args and errors
 * @param {Function} commandLineArgs command line args parser
 * @param {Array<Object>} ss argument specifications
 */
const getArgs = (commandLineArgs, ss) => {
  const r = {};
  try {
    r.args = commandLineArgs(ss);
  } catch (e) {
    r.err = e;
  }
  return r;
};

/**
 * converts an array of arrays into an array of first elements
 * @param {Array<Array<Any> || Any>} xs array of values
 */
const mapFirstElement = xs => xs.map(x => (x.length > 0 && !isNil(x[0]) ? x[0] : undefined));

/**
 * filters out the nils
 * @param {Array<Any>} xs array of values
 */
const nonNils = xs => xs.filter(x => !isNil(x));

/**
 * gets the first error
 * @param {Any} e error returned from commandLineArgs
 * @param {Array<String>} as command line arguments
 * @param {Array<Object>} ss argument specifications
 */
const getError = (e, as, ss) => nth(
  0,
  nonNils(mapFirstElement([
    [e],
    notNumericErrors(nonNumericArgs(as, ss)),
    notRegExMatchingErrors(nonRegExMatchingArgs(as, ss)),
    missingErrors(missingArgs(as, ss)),
  ])),
);

/**
 * shows errors and/or help
 * @param {Error} e error
 * @param {Object} l logger
 * @param {String} h header for command line usage
 * @param {String} c content for command line usage
 * @param {Array<Object>} ss argument specifications
 * @param {Function} commandLineUsage command line usage
 * @param {Object} console console
 */
const showErrorAndOrHelp = (e, l, h, c, ss, commandLineUsage, console) => {
  if (e) {
    l.error(e.message);
  }

  console.log(commandLineUsage([
    { header: h, content: c },
    { header: 'Options', optionList: ss },
  ])); /* eslint-disable-line no-console */
};

/**
 * get command line arguments
 * @param {String} h header for command line usage
 * @param {String} c content for command line usage
 * @param {Array<Object>} ss argument specifications
 * @param {Object} l logger
 * @param {Function} commandLineArgs command line args
 * @param {Function} commandLineUsage command line usage
 * @param {Object} console console
 */
const get = (h, c, ss, l, commandLineArgs, commandLineUsage, console) => {
  const _ss = applyDefaultValueHelp(addHelp(ss));

  const { err, args } = getArgs(commandLineArgs, _ss);

  const error = getError(err, args, _ss);

  const helpRequested = path('help', args);

  if (error || helpRequested) {
    showErrorAndOrHelp(error, l, h, c, _ss, commandLineUsage, console);
    return false;
  }

  return args;
};

module.exports.get = get;

module.exports.test = {
  addHelp,
  applyDefaultValueHelp,
  missingArgs,
  missingErrors,
  isNumeric,
  nonNumericArgs,
  notNumericErrors,
  nonRegExMatchingArgs,
  notRegExMatchingErrors,
  getArgs,
  mapFirstElement,
  nonNils,
  getError,
  showErrorAndOrHelp,
};
