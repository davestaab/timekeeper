/* */ 
(function(process) {
  class NestedError extends Error {
    constructor(message, parent) {
      message += ' due to next parent error';
      super(message);
      this.stack += '\n\nParent ' + (parent.stack || parent.message || parent).toString();
    }
  }
  const syntaxFailures = {};
  module.exports.requirePackage = function requirePackage(cwd, _require, customEntry) {
    const debug = process && process.env && process.env.DEBUG_BEVRY_EDITIONS;
    const pathUtil = require('path');
    const packagePath = pathUtil.join(cwd, 'package.json');
    const {name,
      editions} = require(packagePath);
    if (!editions || editions.length === 0) {
      throw new Error(`No editions have been specified for the package [${name}]`);
    }
    let lastEditionFailure;
    for (let i = 0; i < editions.length; ++i) {
      const {syntaxes,
        entry,
        directory} = editions[i];
      if (customEntry && !directory) {
        throw new Error(`The package [${name}] has no directory property on its editions which is required when using custom entry point: ${customEntry}`);
      } else if (!entry) {
        throw new Error(`The package [${name}] has no entry property on its editions which is required when using default entry`);
      }
      const entryPath = customEntry ? pathUtil.resolve(cwd, directory, customEntry) : pathUtil.resolve(cwd, entry);
      const s = syntaxes && syntaxes.map((i) => i.toLowerCase()).sort().join(', ');
      if (s && syntaxFailures[s]) {
        const syntaxFailure = syntaxFailures[s];
        lastEditionFailure = new NestedError(`Skipped package [${name}] edition at [${entryPath}] with blacklisted syntax [${s}]`, syntaxFailure);
        if (debug)
          console.error(`DEBUG: ${lastEditionFailure.stack}`);
        continue;
      }
      try {
        return _require(entryPath);
      } catch (error) {
        lastEditionFailure = new NestedError(`Unable to load package [${name}] edition at [${entryPath}] with syntax [${s || 'no syntaxes specified'}]`, error);
        if (debug)
          console.error(`DEBUG: ${lastEditionFailure.stack}`);
        if (s)
          syntaxFailures[s] = lastEditionFailure;
      }
    }
    if (!lastEditionFailure)
      lastEditionFailure = new Error(`The package [${name}] failed without any actual errors...`);
    throw new NestedError(`The package [${name}] has no suitable edition for this environment`, lastEditionFailure);
  };
})(require('process'));
