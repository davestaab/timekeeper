/* */ 
(function(process) {
  exports.HOME = process.env.LOCALAPPDATA || process.env.HOME || process.env.HOMEPATH;
  exports.newLine = require('os').EOL;
  exports.tab = '  ';
  var ui = require('./ui');
  var fs = require('graceful-fs');
  var path = require('path');
  var PackageConfig = require('./config/package');
  var LoaderConfig = require('./config/loader');
  var mkdirp = require('mkdirp');
  var extend = require('./common').extend;
  var config = module.exports;
  var asp = require('rsvp').denodeify;
  var readJSON = require('./common').readJSON;
  var PackageName = require('./config/package-name');
  exports.derivePackageConfig = function(pjson, override) {
    var dpjson = extend({}, pjson);
    if (override || pjson.jspm)
      dpjson.jspm = extend({}, pjson.jspm || {});
    if (override)
      extend(dpjson.jspm, override);
    if (override || pjson.jspm)
      extend(dpjson, dpjson.jspm);
    return dpjson;
  };
  exports.pjson = null;
  exports.loader = null;
  var loadPromise;
  exports.loaded = false;
  exports.load = function(prompts) {
    if (loadPromise)
      return loadPromise;
    return (loadPromise = Promise.resolve().then(function() {
      if (process.env.globalJspm === 'true')
        ui.log('warn', 'Running jspm globally, it is advisable to locally install jspm via %npm install jspm --save-dev%.');
      if (!process.env.jspmConfigPath)
        return ui.confirm('Package.json file does not exist, create it?', true).then(function(create) {
          if (!create)
            throw 'Operation aborted.';
        });
    }).then(function() {
      config.pjsonPath = process.env.jspmConfigPath || path.resolve(process.cwd(), 'package.json');
      config.pjson = new PackageConfig(config.pjsonPath);
      return config.pjson.read(prompts);
    }).then(function(_prompts) {
      prompts = prompts || _prompts;
      if (fs.existsSync(config.pjson.configFile))
        return;
      return ui.confirm('Configuration file %' + path.relative(process.cwd(), config.pjson.configFile) + '% doesn\'t exist, create it?', true).then(function(create) {
        if (!create)
          throw 'Operation aborted.';
        return asp(mkdirp)(path.dirname(config.pjson.configFile));
      });
    }).then(function() {
      config.loader = new LoaderConfig(config.pjson.configFile);
      return config.loader.read(prompts);
    }).then(function() {
      return readJSON(path.resolve(config.pjson.packages, '.dependencies.json'));
    }).then(function(depsJSON) {
      config.deps = setSerializedDeps(depsJSON);
      config.loaded = true;
    }));
  };
  exports.loadSync = function() {
    if (config.loaded)
      return;
    if (loadPromise)
      throw 'Configuration file is already loading.';
    config.pjsonPath = process.env.jspmConfigPath || path.resolve(process.cwd(), 'package.json');
    config.pjson = new PackageConfig(config.pjsonPath);
    config.pjson.read(false, true);
    if (!fs.existsSync(config.pjson.configFile))
      throw 'No project configuration file not found. Looking for: ' + config.pjson.configFile;
    config.loader = new LoaderConfig(config.pjson.configFile);
    config.loader.read(false, true);
    var depsJSON;
    try {
      depsJSON = JSON.parse(fs.readFileSync(path.resolve(config.pjson.packages, '.dependencies.json')));
    } catch (e) {
      if (e.code == 'ENOENT')
        depsJSON = {};
      else
        throw e;
    }
    config.deps = setSerializedDeps(depsJSON);
    config.loaded = true;
    loadPromise = Promise.resolve();
  };
  function getSerializedDeps(deps) {
    var serializedDeps = {};
    Object.keys(deps).forEach(function(dep) {
      var depMap = deps[dep];
      var serializedDepMap = serializedDeps[dep] = {};
      Object.keys(depMap).forEach(function(dep) {
        serializedDepMap[dep] = depMap[dep].exactName;
      });
    });
    return serializedDeps;
  }
  function setSerializedDeps(serializedDeps) {
    var deps = {};
    Object.keys(serializedDeps).forEach(function(dep) {
      var depMap = deps[dep] = {};
      var serializedDepMap = serializedDeps[dep];
      Object.keys(serializedDepMap).forEach(function(dep) {
        if (typeof serializedDepMap[dep] == 'string')
          depMap[dep] = new PackageName(serializedDepMap[dep]);
      });
    });
    return deps;
  }
  var savePromise;
  exports.save = function() {
    if (savePromise)
      return savePromise.then(exports.save);
    return Promise.resolve().then(function() {
      return config.loader.write();
    }).then(function() {
      return config.pjson.write();
    }).then(function() {
      return asp(mkdirp)(config.pjson.packages);
    }).then(function() {
      return asp(fs.writeFile)(path.resolve(config.pjson.packages, '.dependencies.json'), JSON.stringify(getSerializedDeps(config.deps), null, 2));
    }).then(function() {
      savePromise = undefined;
    });
  };
})(require('process'));
