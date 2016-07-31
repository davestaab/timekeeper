/* */ 
'use strict';
var fs = require('fs');
var path = require('path');
var exists = require('fs-exists-sync');
module.exports = function detect(filepath, options) {
  if (!filepath || (typeof filepath !== 'string')) {
    return null;
  }
  if (exists(filepath)) {
    return path.resolve(filepath);
  }
  options = options || {};
  if (options.nocase === true) {
    return nocase(filepath);
  }
  return null;
};
function nocase(filepath) {
  filepath = path.resolve(filepath);
  var res = tryReaddir(filepath);
  if (res === null) {
    return null;
  }
  if (res.path === filepath) {
    return res.path;
  }
  var upper = filepath.toUpperCase();
  var len = res.files.length;
  var idx = -1;
  while (++idx < len) {
    var fp = path.resolve(res.path, res.files[idx]);
    if (filepath === fp || upper === fp) {
      return fp;
    }
    var fpUpper = fp.toUpperCase();
    if (filepath === fpUpper || upper === fpUpper) {
      return fp;
    }
  }
  return null;
}
function tryReaddir(filepath) {
  var ctx = {
    path: filepath,
    files: []
  };
  try {
    ctx.files = fs.readdirSync(filepath);
    return ctx;
  } catch (err) {}
  try {
    ctx.path = path.dirname(filepath);
    ctx.files = fs.readdirSync(ctx.path);
    return ctx;
  } catch (err) {}
  return null;
}
