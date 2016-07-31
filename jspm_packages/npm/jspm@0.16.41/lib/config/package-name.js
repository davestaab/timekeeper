/* */ 
function Package(name, escape) {
  this.exactName = name;
  if (name.indexOf(':') !== -1)
    this.registry = name.split(':')[0];
  var pkg = this.registry ? name.substr(this.registry.length + 1) : name;
  var versionIndex = pkg.lastIndexOf('@');
  var version = '';
  if (versionIndex !== -1 && versionIndex !== 0) {
    version = pkg.substr(versionIndex + 1);
    pkg = pkg.substr(0, versionIndex);
  }
  if (escape && version)
    version = version.replace(/[\/%]/g, function(symbol) {
      return encodeURIComponent(symbol);
    });
  this.package = pkg;
  this.name = (this.registry ? this.registry + ':' : '') + this.package;
  this.setVersion(version);
}
Package.prototype.setVersion = function(version) {
  if (version === '*')
    version = '';
  this.version = version;
  var v = this.version ? '@' + this.version : '';
  this.exactPackage = this.package + v;
  this.exactName = this.name + v;
  return this;
};
Package.prototype.setRegistry = function(registry) {
  if (this.registry)
    throw 'Endpoint already set.';
  this.registry = registry;
  this.exactName = registry + ':' + this.exactName;
  this.name = registry + ':' + this.name;
  return this;
};
Package.prototype.copy = function() {
  return new Package(this.exactName);
};
var path = require('path');
var config = require('../config');
Package.prototype.getPath = function() {
  return path.resolve(config.pjson.packages, this.registry, this.exactPackage);
};
Package.prototype.write = function() {
  return this.exactName;
};
module.exports = Package;
