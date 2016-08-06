/* */ 
(function(process) {
  var install = require('./lib/install');
  var bundle = require('./lib/bundle');
  var core = require('./lib/core');
  var ui = require('./lib/ui');
  var EventEmitter = require('events').EventEmitter;
  var SystemJSLoader = require('systemjs').constructor;
  var config = require('./lib/config');
  var path = require('path');
  var toFileURL = require('./lib/common').toFileURL;
  require('rsvp').on('error', function(reason) {
    ui.log('warn', 'Unhandled promise rejection.\n' + reason && reason.stack || reason || '' + '\n');
  });
  var API = module.exports = new EventEmitter();
  API.setPackagePath = function(packagePath) {
    if (config.loaded && process.env.jspmConfigPath !== path.resolve(packagePath, 'package.json'))
      throw new Error('Configuration has already been loaded. Call setPackagePath before using other APIs.');
    process.env.jspmConfigPath = path.resolve(packagePath, 'package.json');
  };
  API.setPackagePath('.');
  ui.setResolver(API);
  ui.useDefaults();
  API.promptDefaults = function(_useDefaults) {
    ui.useDefaults(_useDefaults);
  };
  API.version = require('./package.json!systemjs-json').version;
  var apiLoader;
  API.normalize = function(name, parentName) {
    apiLoader = apiLoader || new API.Loader();
    return apiLoader.normalize(name, parentName);
  };
  API.import = function(name, parentName) {
    apiLoader = apiLoader || new API.Loader();
    return apiLoader.import(name, parentName);
  };
  API.Loader = function() {
    config.loadSync();
    var cfg = config.loader.getConfig();
    cfg.baseURL = toFileURL(config.pjson.baseURL);
    var loader = new SystemJSLoader();
    loader.config(cfg);
    return loader;
  };
  API.Builder = bundle.Builder;
  API.bundle = function(expression, fileName, options) {
    return bundle.bundle(expression, fileName, options);
  };
  API.unbundle = function() {
    return bundle.unbundle();
  };
  API.bundleSFX = function(expression, fileName, options) {
    return bundle.bundleSFX(expression, fileName, options);
  };
  API.install = function(name, target, options) {
    return install.install(name, target, options);
  };
  API.uninstall = function(names) {
    return install.uninstall(names);
  };
  API.dlLoader = function(transpiler) {
    return core.checkDlLoader(transpiler);
  };
})(require('process'));
