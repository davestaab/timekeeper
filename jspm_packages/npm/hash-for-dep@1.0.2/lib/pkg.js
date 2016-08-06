/* */ 
'use strict';
var resolvePkg = require('./resolve-pkg');
var moduleBaseDir = require('./module-base-dir');
module.exports = function pkg(name, dir) {
  if (name !== './') {
    name += '/';
  }
  var modulePath = resolvePkg(name, dir);
  var baseDir = moduleBaseDir(modulePath, name);
  var thePackage = require(baseDir + '/package.json');
  thePackage.path = modulePath;
  thePackage.baseDir = baseDir;
  return thePackage;
};
