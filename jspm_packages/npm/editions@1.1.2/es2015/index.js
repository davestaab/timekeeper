/* */ 
(function(process) {
  'use strict';
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }});
    if (superClass)
      Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }
  var NestedError = function(_Error) {
    _inherits(NestedError, _Error);
    function NestedError(message, parent) {
      _classCallCheck(this, NestedError);
      message += ' due to next parent error';
      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(NestedError).call(this, message));
      _this.stack += '\n\nParent ' + (parent.stack || parent.message || parent).toString();
      return _this;
    }
    return NestedError;
  }(Error);
  var syntaxFailures = {};
  module.exports.requirePackage = function requirePackage(cwd, _require, customEntry) {
    var debug = process && process.env && process.env.DEBUG_BEVRY_EDITIONS;
    var pathUtil = require('path');
    var packagePath = pathUtil.join(cwd, 'package.json');
    var _require2 = require(packagePath);
    var name = _require2.name;
    var editions = _require2.editions;
    if (!editions || editions.length === 0) {
      throw new Error('No editions have been specified for the package [' + name + ']');
    }
    var lastEditionFailure = void 0;
    for (var i = 0; i < editions.length; ++i) {
      var _editions$i = editions[i];
      var syntaxes = _editions$i.syntaxes;
      var entry = _editions$i.entry;
      var directory = _editions$i.directory;
      if (customEntry && !directory) {
        throw new Error('The package [' + name + '] has no directory property on its editions which is required when using custom entry point: ' + customEntry);
      } else if (!entry) {
        throw new Error('The package [' + name + '] has no entry property on its editions which is required when using default entry');
      }
      var entryPath = customEntry ? pathUtil.resolve(cwd, directory, customEntry) : pathUtil.resolve(cwd, entry);
      var s = syntaxes && syntaxes.map(function(i) {
        return i.toLowerCase();
      }).sort().join(', ');
      if (s && syntaxFailures[s]) {
        var syntaxFailure = syntaxFailures[s];
        lastEditionFailure = new NestedError('Skipped package [' + name + '] edition at [' + entryPath + '] with blacklisted syntax [' + s + ']', syntaxFailure);
        if (debug)
          console.error('DEBUG: ' + lastEditionFailure.stack);
        continue;
      }
      try {
        return _require(entryPath);
      } catch (error) {
        lastEditionFailure = new NestedError('Unable to load package [' + name + '] edition at [' + entryPath + '] with syntax [' + (s || 'no syntaxes specified') + ']', error);
        if (debug)
          console.error('DEBUG: ' + lastEditionFailure.stack);
        if (s)
          syntaxFailures[s] = lastEditionFailure;
      }
    }
    if (!lastEditionFailure)
      lastEditionFailure = new Error('The package [' + name + '] failed without any actual errors...');
    throw new NestedError('The package [' + name + '] has no suitable edition for this environment', lastEditionFailure);
  };
})(require('process'));
