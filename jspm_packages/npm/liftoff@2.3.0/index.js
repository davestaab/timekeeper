/* */ 
(function(process) {
  const fs = require('fs');
  const util = require('util');
  const path = require('path');
  const EE = require('events').EventEmitter;
  const extend = require('extend');
  const resolve = require('resolve');
  const flaggedRespawn = require('flagged-respawn');
  const isPlainObject = require('lodash.isplainobject');
  const mapValues = require('lodash.mapvalues');
  const fined = require('fined');
  const findCwd = require('./lib/find_cwd');
  const findConfig = require('./lib/find_config');
  const fileSearch = require('./lib/file_search');
  const parseOptions = require('./lib/parse_options');
  const silentRequire = require('./lib/silent_require');
  const buildConfigName = require('./lib/build_config_name');
  const registerLoader = require('./lib/register_loader');
  function Liftoff(opts) {
    EE.call(this);
    extend(this, parseOptions(opts));
  }
  util.inherits(Liftoff, EE);
  Liftoff.prototype.requireLocal = function(module, basedir) {
    try {
      var result = require(resolve.sync(module, {basedir: basedir}));
      this.emit('require', module, result);
      return result;
    } catch (e) {
      this.emit('requireFail', module, e);
    }
  };
  Liftoff.prototype.buildEnvironment = function(opts) {
    opts = opts || {};
    var preload = opts.require || [];
    if (!Array.isArray(preload)) {
      preload = [preload];
    }
    var searchPaths = this.searchPaths.slice();
    var cwd = findCwd(opts);
    if (opts.cwd) {
      searchPaths = [cwd];
    } else {
      searchPaths.unshift(cwd);
    }
    var configNameSearch = buildConfigName({
      configName: this.configName,
      extensions: Object.keys(this.extensions)
    });
    var configPath = findConfig({
      configNameSearch: configNameSearch,
      searchPaths: searchPaths,
      configPath: opts.configPath
    });
    var configBase;
    if (configPath) {
      configBase = path.dirname(configPath);
      if (!opts.cwd) {
        cwd = configBase;
      }
      if (fs.lstatSync(configPath).isSymbolicLink()) {
        configPath = fs.realpathSync(configPath);
      }
    }
    var modulePath,
        modulePackage;
    try {
      var delim = (process.platform === 'win32' ? ';' : ':'),
          paths = (process.env.NODE_PATH ? process.env.NODE_PATH.split(delim) : []);
      modulePath = resolve.sync(this.moduleName, {
        basedir: configBase || cwd,
        paths: paths
      });
      modulePackage = silentRequire(fileSearch('package.json', [modulePath]));
    } catch (e) {}
    if (!modulePath && configPath) {
      var modulePackagePath = fileSearch('package.json', [configBase]);
      modulePackage = silentRequire(modulePackagePath);
      if (modulePackage && modulePackage.name === this.moduleName) {
        modulePath = path.join(path.dirname(modulePackagePath), modulePackage.main || 'index.js');
        cwd = configBase;
      } else {
        modulePackage = {};
      }
    }
    if (preload.length) {
      preload.filter(function(value, index, self) {
        return self.indexOf(value) === index;
      }).forEach(function(dep) {
        this.requireLocal(dep, findCwd(opts));
      }, this);
    }
    var exts = this.extensions;
    var eventEmitter = this;
    registerLoader(eventEmitter, exts, configPath, cwd);
    var configFiles = {};
    if (isPlainObject(this.configFiles)) {
      var notfound = {path: null};
      configFiles = mapValues(this.configFiles, function(prop, name) {
        var defaultObj = {
          name: name,
          cwd: cwd,
          extensions: exts
        };
        return mapValues(prop, function(pathObj) {
          var found = fined(pathObj, defaultObj) || notfound;
          if (isPlainObject(found.extension)) {
            registerLoader(eventEmitter, found.extension, found.path, cwd);
          }
          return found.path;
        });
      });
    }
    return {
      cwd: cwd,
      require: preload,
      configNameSearch: configNameSearch,
      configPath: configPath,
      configBase: configBase,
      modulePath: modulePath,
      modulePackage: modulePackage || {},
      configFiles: configFiles
    };
  };
  Liftoff.prototype.handleFlags = function(cb) {
    if (typeof this.v8flags === 'function') {
      this.v8flags(function(err, flags) {
        if (err) {
          cb(err);
        } else {
          cb(null, flags);
        }
      });
    } else {
      process.nextTick(function() {
        cb(null, this.v8flags);
      }.bind(this));
    }
  };
  Liftoff.prototype.launch = function(opts, fn) {
    if (typeof fn !== 'function') {
      throw new Error('You must provide a callback function.');
    }
    process.title = this.processTitle;
    var completion = opts.completion;
    if (completion && this.completions) {
      return this.completions(completion);
    }
    this.handleFlags(function(err, flags) {
      if (err) {
        throw err;
      } else {
        if (flags) {
          flaggedRespawn(flags, process.argv, function(ready, child) {
            if (child !== process) {
              this.emit('respawn', process.argv.filter(function(arg) {
                var flag = arg.split('=')[0];
                return flags.indexOf(flag) !== -1;
              }.bind(this)), child);
            }
            if (ready) {
              fn.call(this, this.buildEnvironment(opts));
            }
          }.bind(this));
        } else {
          fn.call(this, this.buildEnvironment(opts));
        }
      }
    }.bind(this));
  };
  module.exports = Liftoff;
})(require('process'));
