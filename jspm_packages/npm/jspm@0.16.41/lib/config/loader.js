/* */ 
var registry = require('../registry');
var config = require('../config');
var extend = require('../common').extend;
var hasProperties = require('../common').hasProperties;
var fs = require('graceful-fs');
var asp = require('rsvp').denodeify;
var path = require('path');
var PackageName = require('./package-name');
var alphabetize = require('../common').alphabetize;
var stringify = require('../common').stringify;
var ui = require('../ui');
var extractObj = require('./utils').extractObj;
var globalConfig = require('../global-config');
var registryRegEx = /\:\*$/;
function Config(fileName) {
  this.__fileName = fileName;
}
Config.prototype.read = function(prompts, sync) {
  if (this.__read)
    throw 'Config already read';
  this.__read = true;
  var self = this;
  var source;
  try {
    source = fs.readFileSync(this.__fileName);
  } catch (e) {
    source = '';
  }
  var cfg = {};
  var System = {
    config: function(_cfg) {
      for (var c in _cfg) {
        if (!_cfg.hasOwnProperty(c))
          continue;
        var v = _cfg[c];
        if (typeof v === 'object') {
          cfg[c] = cfg[c] || {};
          for (var p in v) {
            if (!v.hasOwnProperty(p))
              continue;
            cfg[c][p] = v[p];
          }
        } else
          cfg[c] = v;
      }
    },
    paths: {},
    map: {},
    versions: {}
  };
  eval(source.toString());
  var config = System.config;
  delete System.config;
  config(System);
  self.__originalConfig = cfg;
  self.baseURL = cfg.baseURL;
  self.defaultJSExtensions = true;
  if (cfg.transpiler === false)
    cfg.transpiler = 'none';
  self.transpiler = cfg.transpiler || cfg.parser || globalConfig.config.defaultTranspiler;
  if (self.transpiler === '6to5')
    self.transpiler = 'babel';
  self.babelOptions = cfg.babelOptions || {};
  self.traceurOptions = cfg.traceurOptions || {};
  self.typescriptOptions = cfg.typescriptOptions || {};
  self.registries = {};
  self.paths = {};
  for (var p in cfg.paths) {
    if (p.match(registryRegEx)) {
      var registryName = p.substr(0, p.length - 2);
      var registryPath = new RegistryPath(registryName, cfg.paths[p]);
      self.registries[registryName] = registryPath;
      if (self.__local === undefined) {
        if (registryPath.mode === 'local')
          self.__local = true;
        else
          self.__local = false;
      }
    } else if (p === '*' && cfg.paths[p] === '*.js') {
      delete cfg.paths[p];
      continue;
    }
  }
  self.paths = cfg.paths;
  self.shim = cfg.shim;
  self.bundles = cfg.bundles;
  self.depCache = cfg.depCache;
  self.baseMap = {};
  self.depMap = {};
  for (var d in cfg.map) {
    if (typeof cfg.map[d] === 'string')
      self.baseMap[d] = new PackageName(cfg.map[d]);
    else {
      var depMap = cfg.map[d];
      self.depMap[d] = {};
      for (var m in depMap)
        if (depMap.hasOwnProperty(m)) {
          self.depMap[d][m] = new PackageName(depMap[m]);
        }
    }
  }
  var baseMap = self.baseMap,
      exactName;
  for (var n in baseMap) {
    if (baseMap.hasOwnProperty(n)) {
      exactName = baseMap[n].exactName;
      self.depMap[exactName] = self.depMap[exactName] || {};
    }
  }
  self.versions = self.versions || {};
  for (var v in cfg.versions) {
    if (typeof cfg.versions[v] === 'string')
      self.versions[v] = [cfg.versions[v]];
    else
      self.versions[v] = cfg.versions[v];
  }
  if (hasProperties(self.versions))
    upgradeToExactVersionResolution(self);
  if (!prompts)
    return;
  if (sync)
    throw 'Configuration file has not been initialized. Run jspm init first.';
  return ui.input('Enter client baseURL (public folder URL)', self.baseURL || '/').then(function(baseURL) {
    self.baseURL = baseURL;
    return ui.confirm('Do you wish to use a transpiler?', true);
  }).then(function(useTranspiler) {
    if (!useTranspiler) {
      self.transpiler = 'none';
      return 'none';
    }
    return ui.input('Which ES6 transpiler would you like to use, %Babel%, %TypeScript% or %Traceur%?', self.transpiler);
  }).then(function(transpiler) {
    transpiler = transpiler.toLowerCase();
    if (transpiler !== 'babel' && transpiler !== 'traceur' && transpiler !== 'typescript' && transpiler !== 'none')
      transpiler = globalConfig.config.defaultTranspiler;
    self.transpiler = transpiler;
    globalConfig.config.defaultTranspiler = transpiler;
  });
};
Config.prototype.ensureRegistry = function(registryName, remote) {
  var registries = this.registries;
  if (typeof remote === 'undefined') {
    var registryKeys = Object.keys(registries);
    if (registryKeys.length > 0) {
      remote = registries[registryKeys[0]].mode === 'remote';
    } else {
      remote = false;
    }
  }
  if (registries[registryName]) {
    if (remote)
      registries[registryName].setRemote();
    else
      registries[registryName].setLocal();
    return;
  }
  var ep = registries[registryName] = new RegistryPath(registryName);
  if (remote)
    ep.setRemote();
  else
    ep.setLocal();
};
Config.prototype.getConfig = function() {
  var cfg = extend({}, this.__originalConfig);
  cfg.paths = extend({}, cfg.paths);
  var registries = this.registries;
  for (var e in registries) {
    if (registries.hasOwnProperty(e))
      cfg.paths[e + ':*'] = registries[e].local;
  }
  return cfg;
};
var jspmPackages;
function RegistryPath(name, registryPath) {
  jspmPackages = jspmPackages || path.relative(config.pjson.baseURL, config.pjson.packages).replace(/\\/g, '/');
  var registryRemote = registry.load(name).remote;
  this.remote = registryRemote + '/*';
  this.local = jspmPackages + '/' + name + '/*';
  this.mode = 'local';
  if (registryPath === this.remote)
    this.mode = 'remote';
  this.path = registryPath;
}
RegistryPath.prototype.setLocal = function() {
  this.path = this.local;
  this.mode = 'local';
};
RegistryPath.prototype.setRemote = function() {
  this.path = this.remote;
  this.mode = 'remote';
};
RegistryPath.prototype.write = function() {
  return this.path;
};
Config.prototype.write = function() {
  var cfg = extractObj(this, this.__originalConfig),
      cfgRegistries,
      cfgMap,
      cfgVersions;
  cfgRegistries = cfg.registries;
  for (var e in cfgRegistries) {
    if (!cfgRegistries.hasOwnProperty(e))
      continue;
    var val = cfgRegistries[e];
    delete cfgRegistries[e];
    cfgRegistries[e + ':*'] = val;
  }
  extend(cfg.paths, alphabetize(cfg.registries));
  delete cfg.registries;
  cfg.baseMap = alphabetize(cfg.baseMap);
  cfg.map = extend(cfg.baseMap, alphabetize(cfg.depMap));
  delete cfg.baseMap;
  delete cfg.depMap;
  cfgMap = cfg.map;
  for (var p in cfgMap) {
    if (!cfgMap.hasOwnProperty(p))
      continue;
    var subMap = cfgMap[p];
    if (typeof subMap === 'object') {
      if (!hasProperties(subMap))
        delete cfgMap[p];
      else
        cfgMap[p] = alphabetize(cfgMap[p]);
    }
  }
  cfgVersions = cfg.versions;
  for (var v in cfgVersions) {
    if (!cfgVersions.hasOwnProperty(v))
      continue;
    var version = cfgVersions[v];
    if (version.length === 1)
      cfgVersions[v] = version[0];
    if (version.length === 0)
      delete cfgVersions[v];
  }
  var outConfig = {};
  var meta = cfg.meta;
  var depCache = cfg.depCache;
  var map = cfg.map;
  var versions = alphabetize(cfg.versions);
  delete cfg.meta;
  delete cfg.depCache;
  delete cfg.map;
  delete cfg.versions;
  if (!hasProperties(cfg.babelOptions))
    delete cfg.babelOptions;
  if (!hasProperties(cfg.traceurOptions))
    delete cfg.traceurOptions;
  if (!hasProperties(cfg.typescriptOptions))
    delete cfg.typescriptOptions;
  if (cfg.bundles && !hasProperties(cfg.bundles))
    delete cfg.bundles;
  if (hasProperties(cfg))
    extend(outConfig, cfg);
  cfg.meta = meta;
  cfg.depCache = depCache;
  cfg.map = map;
  cfg.versions = versions;
  if (hasProperties(meta))
    extend(outConfig, {meta: meta});
  if (hasProperties(depCache))
    extend(outConfig, {depCache: depCache});
  if (hasProperties(map))
    extend(outConfig, {map: map});
  if (outConfig.transpiler === 'none')
    outConfig.transpiler = false;
  var configContent = stringify(outConfig).replace(new RegExp('^' + config.tab + '"(meta|depCache|map|packages)"', 'mg'), config.newLine + config.tab + '$1').replace(new RegExp('^' + config.tab + '"(\\w+)"', 'mg'), config.tab + '$1');
  return asp(fs.writeFile)(this.__fileName, 'System.config(' + configContent + ');' + config.newLine);
};
module.exports = Config;
var semver = require('../semver');
function upgradeToExactVersionResolution(config) {
  Object.keys(config.baseMap).forEach(function(p) {
    upgradeToExactVersionResolveRange(config.baseMap[p], config);
  });
  Object.keys(config.depMap).forEach(function(p) {
    var curMap = config.depMap[p];
    Object.keys(curMap).forEach(function(p) {
      upgradeToExactVersionResolveRange(curMap[p], config);
    });
  });
  config.versions = {};
}
function upgradeToExactVersionResolveRange(range, config) {
  var versions = config.versions[range.name];
  if (versions)
    versions.sort(semver.compare).reverse().some(function(version) {
      if (semver.match(range.version, version)) {
        range.setVersion(version);
        return true;
      }
    });
}
