/* */ 
(function(process) {
  'use strict';
  var util = require('util');
  var isString = function(x) {
    return typeof x === 'string';
  };
  function normalizeArray(parts, allowAboveRoot) {
    var res = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!p || p === '.')
        continue;
      if (p === '..') {
        if (res.length && res[res.length - 1] !== '..') {
          res.pop();
        } else if (allowAboveRoot) {
          res.push('..');
        }
      } else {
        res.push(p);
      }
    }
    return res;
  }
  var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  var posix = {};
  function posixSplitPath(filename) {
    return splitPathRe.exec(filename).slice(1);
  }
  posix.resolve = function() {
    var resolvedPath = '',
        resolvedAbsolute = false;
    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = (i >= 0) ? arguments[i] : process.cwd();
      if (!isString(path)) {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        continue;
      }
      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charAt(0) === '/';
    }
    resolvedPath = normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');
    return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
  };
  posix.normalize = function(path) {
    var isAbsolute = posix.isAbsolute(path),
        trailingSlash = path.substr(-1) === '/';
    path = normalizeArray(path.split('/'), !isAbsolute).join('/');
    if (!path && !isAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }
    return (isAbsolute ? '/' : '') + path;
  };
  posix.isAbsolute = function(path) {
    return path.charAt(0) === '/';
  };
  posix.join = function() {
    var path = '';
    for (var i = 0; i < arguments.length; i++) {
      var segment = arguments[i];
      if (!isString(segment)) {
        throw new TypeError('Arguments to path.join must be strings');
      }
      if (segment) {
        if (!path) {
          path += segment;
        } else {
          path += '/' + segment;
        }
      }
    }
    return posix.normalize(path);
  };
  posix.relative = function(from, to) {
    from = posix.resolve(from).substr(1);
    to = posix.resolve(to).substr(1);
    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== '')
          break;
      }
      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== '')
          break;
      }
      if (start > end)
        return [];
      return arr.slice(start, end + 1);
    }
    var fromParts = trim(from.split('/'));
    var toParts = trim(to.split('/'));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push('..');
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join('/');
  };
  posix._makeLong = function(path) {
    return path;
  };
  posix.dirname = function(path) {
    var result = posixSplitPath(path),
        root = result[0],
        dir = result[1];
    if (!root && !dir) {
      return '.';
    }
    if (dir) {
      dir = dir.substr(0, dir.length - 1);
    }
    return root + dir;
  };
  posix.basename = function(path, ext) {
    var f = posixSplitPath(path)[2];
    if (ext && f.substr(-1 * ext.length) === ext) {
      f = f.substr(0, f.length - ext.length);
    }
    return f;
  };
  posix.extname = function(path) {
    return posixSplitPath(path)[3];
  };
  posix.format = function(pathObject) {
    if (!util.isObject(pathObject)) {
      throw new TypeError("Parameter 'pathObject' must be an object, not " + typeof pathObject);
    }
    var root = pathObject.root || '';
    if (!isString(root)) {
      throw new TypeError("'pathObject.root' must be a string or undefined, not " + typeof pathObject.root);
    }
    var dir = pathObject.dir ? pathObject.dir + posix.sep : '';
    var base = pathObject.base || '';
    return dir + base;
  };
  posix.parse = function(pathString) {
    if (!isString(pathString)) {
      throw new TypeError("Parameter 'pathString' must be a string, not " + typeof pathString);
    }
    var allParts = posixSplitPath(pathString);
    if (!allParts || allParts.length !== 4) {
      throw new TypeError("Invalid path '" + pathString + "'");
    }
    allParts[1] = allParts[1] || '';
    allParts[2] = allParts[2] || '';
    allParts[3] = allParts[3] || '';
    return {
      root: allParts[0],
      dir: allParts[0] + allParts[1].slice(0, allParts[1].length - 1),
      base: allParts[2],
      ext: allParts[3],
      name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
    };
  };
  posix.sep = '/';
  posix.delimiter = ':';
  module.exports = posix;
})(require('process'));
