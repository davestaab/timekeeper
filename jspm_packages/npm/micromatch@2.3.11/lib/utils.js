/* */ 
(function(process) {
  'use strict';
  var win32 = process && process.platform === 'win32';
  var path = require('path');
  var fileRe = require('filename-regex');
  var utils = module.exports;
  utils.diff = require('arr-diff');
  utils.unique = require('array-unique');
  utils.braces = require('braces');
  utils.brackets = require('expand-brackets');
  utils.extglob = require('extglob');
  utils.isExtglob = require('is-extglob');
  utils.isGlob = require('is-glob');
  utils.typeOf = require('kind-of');
  utils.normalize = require('normalize-path');
  utils.omit = require('object.omit');
  utils.parseGlob = require('parse-glob');
  utils.cache = require('regex-cache');
  utils.filename = function filename(fp) {
    var seg = fp.match(fileRe());
    return seg && seg[0];
  };
  utils.isPath = function isPath(pattern, opts) {
    opts = opts || {};
    return function(fp) {
      var unixified = utils.unixify(fp, opts);
      if (opts.nocase) {
        return pattern.toLowerCase() === unixified.toLowerCase();
      }
      return pattern === unixified;
    };
  };
  utils.hasPath = function hasPath(pattern, opts) {
    return function(fp) {
      return utils.unixify(pattern, opts).indexOf(fp) !== -1;
    };
  };
  utils.matchPath = function matchPath(pattern, opts) {
    var fn = (opts && opts.contains) ? utils.hasPath(pattern, opts) : utils.isPath(pattern, opts);
    return fn;
  };
  utils.hasFilename = function hasFilename(re) {
    return function(fp) {
      var name = utils.filename(fp);
      return name && re.test(name);
    };
  };
  utils.arrayify = function arrayify(val) {
    return !Array.isArray(val) ? [val] : val;
  };
  utils.unixify = function unixify(fp, opts) {
    if (opts && opts.unixify === false)
      return fp;
    if (opts && opts.unixify === true || win32 || path.sep === '\\') {
      return utils.normalize(fp, false);
    }
    if (opts && opts.unescape === true) {
      return fp ? fp.toString().replace(/\\(\w)/g, '$1') : '';
    }
    return fp;
  };
  utils.escapePath = function escapePath(fp) {
    return fp.replace(/[\\.]/g, '\\$&');
  };
  utils.unescapeGlob = function unescapeGlob(fp) {
    return fp.replace(/[\\"']/g, '');
  };
  utils.escapeRe = function escapeRe(str) {
    return str.replace(/[-[\\$*+?.#^\s{}(|)\]]/g, '\\$&');
  };
  module.exports = utils;
})(require('process'));
