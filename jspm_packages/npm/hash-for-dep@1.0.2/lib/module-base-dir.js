/* */ 
'use strict';
var path = require('path');
module.exports = function moduleBaseDir(modulePath, moduleName) {
  var joinedModulePath = path.join(modulePath, moduleName);
  if (joinedModulePath.length < modulePath.length) {
    return joinedModulePath;
  }
  var segment = path.join('node_modules', moduleName);
  var regexSegment = segment.replace(/\\/g, '\\\\');
  modulePath = modulePath.replace(new RegExp(regexSegment + '.*$'), segment);
  modulePath = modulePath.replace(/index\.js\/?$/, '');
  return modulePath;
};
