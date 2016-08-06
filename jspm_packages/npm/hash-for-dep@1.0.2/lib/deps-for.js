/* */ 
'use strict';
var pkg = require('./pkg');
module.exports = function depsFor(name, dir) {
  var dependencies = [];
  var visited = Object.create(null);
  (function again(name, dir) {
    var thePackage = pkg(name, dir);
    var key = thePackage.name + thePackage.version + thePackage.baseDir;
    if (visited[key]) {
      return;
    }
    visited[key] = true;
    dependencies.push(thePackage);
    return Object.keys(thePackage.dependencies || {}).forEach(function(dep) {
      again(dep, thePackage.baseDir);
    });
  }(name, dir));
  return dependencies;
};
