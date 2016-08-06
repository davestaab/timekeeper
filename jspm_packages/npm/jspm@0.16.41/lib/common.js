/* */ 
"format cjs";
(function(process) {
  require('core-js/es6/string');
  var asp = require('rsvp').denodeify;
  var fs = require('graceful-fs');
  var path = require('path');
  var newLine = require('./config').newLine;
  var tab = require('./config').tab;
  exports.toFileURL = function toFileURL(path) {
    return 'file://' + (process.platform.match(/^win/) ? '/' : '') + path.replace(/\\/g, '/');
  };
  exports.fromFileURL = function fromFileURL(path) {
    return path.substr(process.platform.match(/^win/) ? 8 : 7).replace(path.sep, '/');
  };
  exports.dprepend = function dprepend(a, b) {
    for (var p in b) {
      if (!b.hasOwnProperty(p))
        continue;
      var val = b[p];
      if (typeof val === 'object')
        dprepend(a[p] = typeof a[p] === 'object' ? a[p] : {}, val);
      else if (!(p in a))
        a[p] = val;
    }
    return a;
  };
  exports.extend = function(a, b) {
    for (var p in b) {
      if (b.hasOwnProperty(p)) {
        a[p] = b[p];
      }
    }
    return a;
  };
  function dextend(a, b) {
    for (var p in b) {
      if (!b.hasOwnProperty(p))
        continue;
      var val = b[p];
      if (typeof val === 'object')
        dextend(a[p] = typeof a[p] === 'object' ? a[p] : {}, val);
      else
        a[p] = val;
    }
    return a;
  }
  exports.dextend = dextend;
  exports.hasProperties = function(obj) {
    for (var p in obj) {
      if (obj.hasOwnProperty(p))
        return true;
    }
    return false;
  };
  exports.readJSON = function(file) {
    return asp(fs.readFile)(file).then(function(pjson) {
      pjson = pjson.toString();
      if (pjson.startsWith('\uFEFF'))
        pjson = pjson.substr(1);
      try {
        return JSON.parse(pjson);
      } catch (e) {
        throw 'Error parsing package.json file ' + file;
      }
    }, function(err) {
      if (err.code === 'ENOENT')
        return {};
      throw err;
    });
  };
  exports.readJSONSync = function(file) {
    var pjson;
    try {
      pjson = fs.readFileSync(file).toString();
    } catch (e) {
      if (e.code === 'ENOENT')
        pjson = '{}';
    }
    if (pjson.startsWith('\uFEFF'))
      pjson = pjson.substr(1);
    try {
      return JSON.parse(pjson);
    } catch (e) {
      throw 'Error parsing package.json file ' + file;
    }
    return pjson;
  };
  exports.alphabetize = function(obj) {
    var newObj = {};
    Object.keys(obj).sort().forEach(function(p) {
      newObj[p] = obj[p];
    });
    return newObj;
  };
  exports.getRedirectContents = function(format, main) {
    if (format === 'es6' || format === 'esm')
      return 'export * from "' + main + '";\nexport {default} from "' + main + '";';
    else if (format === 'cjs' || format === 'global')
      return 'module.exports = require("' + main + '");';
    else if (format === 'amd')
      return 'define(["' + main + '"], function(main) {\n  return main;\n});';
    else if (format === 'register')
      return 'System.register(["' + main + '"], ' + 'function($__export) {\n  return {  setters: [function(m) { for (var p in m) $__export(p, m[p]); }],  execute: function() {}  };\n});';
    else
      throw 'Unknown module format ' + format + '.';
  };
  exports.stringify = function(subject) {
    return JSON.stringify(subject, null, tab).replace(/\n/g, newLine);
  };
  function cascadeDelete(dir, stopDir) {
    if (dir && dir !== stopDir) {
      return asp(fs.rmdir)(dir).catch(function(err) {
        if (err.code !== 'ENOENT')
          throw err;
      }).then(function() {
        return cascadeDelete(path.dirname(dir), stopDir);
      }).catch(function(err) {
        if (err.code !== 'ENOTEMPTY')
          throw err;
      });
    }
  }
  exports.cascadeDelete = cascadeDelete;
})(require('process'));
