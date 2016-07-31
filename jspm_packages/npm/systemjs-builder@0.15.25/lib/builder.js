/* */ 
(function(process) {
  var Promise = require('bluebird');
  var System = require('systemjs');
  var asp = require('bluebird').promisify;
  var fs = require('fs');
  var path = require('path');
  var extend = require('./utils').extend;
  var attachCompilers = require('./compile').attachCompilers;
  var compileTree = require('./compile').compileTree;
  var compileLoad = require('./compile').compileLoad;
  var pluginBundleHook = require('./compile').pluginBundleHook;
  var writeOutputs = require('./output').writeOutputs;
  var rollupTree = require('./rollup').rollupTree;
  var traceExpression = require('./arithmetic').traceExpression;
  var Trace = require('./trace');
  var getCanonicalName = require('./utils').getCanonicalName;
  var fromFileURL = require('./utils').fromFileURL;
  var toFileURL = require('./utils').toFileURL;
  var createHash = require('crypto').createHash;
  var getFormatHint = require('./utils').getFormatHint;
  function Builder(baseURL, cfg) {
    if (typeof baseURL == 'object') {
      cfg = baseURL;
      baseURL = null;
    }
    this.loader = null;
    this.resetConfig = function() {};
    this.reset();
    if (baseURL)
      this.config({baseURL: baseURL});
    if (typeof cfg == 'object')
      this.config(cfg, true, !!baseURL);
    else if (typeof cfg == 'string')
      this.loadConfigSync(cfg, true, !!baseURL);
  }
  Builder.prototype.invalidate = function(invalidationModuleName) {
    var loader = this.loader;
    var invalidated = [];
    var self = this;
    invalidationModuleName = loader.decanonicalize(invalidationModuleName);
    var invalidationWildcardIndex = invalidationModuleName.indexOf('*');
    if (invalidationModuleName.lastIndexOf('*') != invalidationWildcardIndex)
      throw new TypeError('Only a single wildcard supported for invalidation.');
    if (invalidationWildcardIndex != -1) {
      var wildcardLHS = invalidationModuleName.substr(0, invalidationWildcardIndex);
      var wildcardRHS = invalidationModuleName.substr(invalidationWildcardIndex + 1);
    }
    function matchesInvalidation(moduleName) {
      if (moduleName == invalidationModuleName)
        return true;
      if (invalidationWildcardIndex == -1)
        return false;
      return moduleName.substr(0, invalidationWildcardIndex) == wildcardLHS && moduleName.substr(moduleName.length - wildcardRHS.length) == wildcardRHS;
    }
    var traceCache = this.cache.trace;
    Object.keys(traceCache).forEach(function(canonical) {
      var moduleName = loader.decanonicalize(canonical);
      if (matchesInvalidation(moduleName)) {
        if (traceCache[canonical])
          invalidated.push(moduleName);
        traceCache[canonical] = undefined;
      }
    });
    var pluginLoader = loader.pluginLoader;
    Object.keys(pluginLoader._loader.modules).forEach(function(moduleName) {
      if (matchesInvalidation(moduleName)) {
        invalidated.push(moduleName);
        pluginLoader.delete(moduleName);
      }
    });
    loader.defined = {};
    return invalidated;
  };
  Builder.prototype.reset = function(baseLoader) {
    baseLoader = baseLoader || this.loader || System;
    var loader = this.loader = new baseLoader.constructor();
    loader.builder = this;
    loader.config({build: true});
    loader.import = function(name) {
      return Promise.reject(new Error('Unable to import "' + name + '".\nThe incorrect instance of System is being used to System.import.'));
    };
    loader._loader.loadedTranspilerRuntime = true;
    var pluginLoader = loader.pluginLoader = new baseLoader.constructor();
    pluginLoader.config({build: true});
    loader.constructor = pluginLoader.constructor = baseLoader.constructor;
    loader.baseURL = pluginLoader.baseURL = baseLoader.baseURL;
    loader.normalize = pluginLoader.normalize = baseLoader.normalize;
    loader.normalizeSync = pluginLoader.normalizeSync = baseLoader.normalizeSync;
    loader.originalHooks = baseLoader.originalHooks || {
      locate: baseLoader.locate,
      fetch: baseLoader.fetch,
      translate: baseLoader.translate,
      instantiate: baseLoader.instantiate
    };
    loader.locate = pluginLoader.locate = loader.originalHooks.locate;
    loader.fetch = pluginLoader.fetch = loader.originalHooks.fetch;
    loader.translate = pluginLoader.translate = loader.originalHooks.translate;
    loader.instantiate = pluginLoader.instantiate = loader.originalHooks.instantiate;
    var loaderConfig = loader.config;
    loader.config = function(cfg) {
      loader.pluginLoader.config(cfg);
      var lCfg = extend({}, cfg);
      loaderConfig.call(this, lCfg);
      loader.configHash = generateConfigHash(loader);
    };
    this.getCanonicalName = getCanonicalName.bind(null, this.loader);
    this.loader.getCanonicalName = this.loader.pluginLoader.getCanonicalName = this.getCanonicalName;
    attachCompilers(loader);
    var builder = this;
    var loaderFetch = loader.fetch;
    var cachedFetch = function(load) {
      return Promise.resolve(loaderFetch.call(this, load)).then(function(source) {
        return asp(fs.stat)(fromFileURL(load.address)).then(function(stats) {
          load.metadata.timestamp = stats.mtime.getTime();
          return source;
        }, function(err) {
          if (err.code == 'ENOENT' && load.metadata.loader)
            return source;
          throw err;
        });
      });
    };
    loader.fetch = function(load) {
      if (builder.fetch)
        return Promise.resolve(builder.fetch.call(this, load, cachedFetch.bind(this)));
      else
        return cachedFetch.call(this, load);
    };
    var loaderNormalize = loader.normalize;
    loader.normalize = function(name, parentName, parentAddress) {
      var pkgConditional;
      var pkgConditionalIndex = name.indexOf('/#:');
      if (pkgConditionalIndex != -1) {
        pkgConditional = name.substr(pkgConditionalIndex);
        name = name.substr(0, pkgConditionalIndex + 1);
      }
      return loaderNormalize.call(this, name, parentName, parentAddress).then(function(normalized) {
        if (pkgConditional)
          normalized = normalized + pkgConditional;
        return normalized;
      });
    };
    var loaderNormalizeSync = loader.normalizeSync;
    loader.normalizeSync = function(name, parentName, parentAddress) {
      var pkgConditional;
      var pkgConditionalIndex = name.indexOf('#:');
      if (pkgConditionalIndex != -1) {
        pkgConditional = name.substr(pkgConditionalIndex);
        name = name.substr(0, pkgConditionalIndex) + '/';
      }
      var normalized = loaderNormalizeSync.call(this, name, parentName, parentAddress);
      if (pkgConditional)
        normalized = normalized.substr(0, normalized.length - 1) + pkgConditional;
      return normalized;
    };
    this.resetConfig();
    this.setCache(this.cache || {});
    var traceCache = this.cache.trace;
    Object.keys(traceCache).forEach(function(canonical) {
      if (traceCache[canonical])
        traceCache[canonical].fresh = false;
    });
  };
  function generateConfigHash(loader) {
    return createHash('md5').update(JSON.stringify({
      paths: loader.paths,
      packages: loader.packages,
      meta: loader.meta,
      map: loader.map
    })).digest('hex');
  }
  Builder.prototype.setCache = function(cacheObj) {
    this.cache = {
      compile: cacheObj.compile || {},
      trace: cacheObj.trace || {}
    };
    this.cache.compile.encodings = this.cache.compile.encodings || {};
    this.cache.compile.loads = this.cache.compile.loads || {};
    this.tracer = new Trace(this.loader, this.cache.trace);
  };
  Builder.prototype.getCache = function() {
    return this.cache;
  };
  Builder.prototype.clearCache = function() {
    this.setCache({});
  };
  function executeConfigFile(saveForReset, ignoreBaseURL, configPath, source) {
    var self = this;
    var configLoader = Object.create(this.loader);
    configLoader.config = function(cfg) {
      self.config(cfg, saveForReset, ignoreBaseURL);
    };
    var context = Object.create(global);
    context.SystemJS = context.System = configLoader;
    context.global = context;
    if (process.versions.node && process.versions.node.split('.')[0] < 6)
      context.GLOBAL = context.root = context;
    var Module = require('module');
    var m = new Module(configPath);
    m.filename = configPath;
    m.paths = Module._nodeModulePaths(path.dirname(configPath));
    context.require = m.require.bind(m);
    require('vm').runInNewContext(source.toString(), context);
  }
  Builder.prototype.loadConfig = function(configFile, saveForReset, ignoreBaseURL) {
    return asp(fs.readFile)(configFile).then(executeConfigFile.bind(this, saveForReset, ignoreBaseURL, configFile));
  };
  Builder.prototype.loadConfigSync = function(configFile, saveForReset, ignoreBaseURL) {
    var source = fs.readFileSync(configFile);
    executeConfigFile.call(this, saveForReset, ignoreBaseURL, configFile, source);
  };
  Builder.prototype.config = function(config, saveForReset, ignoreBaseURL) {
    var cfg = {};
    for (var p in config) {
      if (ignoreBaseURL && p == 'baseURL' || p == 'bundles' || p == 'depCache')
        continue;
      cfg[p] = config[p];
    }
    this.loader.config(cfg);
    if (saveForReset) {
      var curReset = this.resetConfig;
      this.resetConfig = function() {
        curReset.call(this);
        this.loader.config(cfg);
      };
    }
  };
  function processTraceOpts(options, defaults) {
    var opts = {
      outputESM: true,
      sourceMaps: false,
      browser: undefined,
      node: undefined,
      production: undefined,
      dev: undefined,
      traceAllConditionals: true,
      conditions: {
        '@system-env|default': true,
        '@system-env|~default': false
      },
      traceConditionModules: true,
      traceConditionsOnly: false,
      tracePackageConfig: true,
      tracePackageConfig: false,
      excludeURLs: true,
      externals: []
    };
    if (typeof options == 'object') {
      if (typeof options.browser == 'boolean' || typeof options.node == 'boolean') {
        if (typeof options.browser == 'boolean' && typeof options.node != 'boolean')
          options.node = !options.browser;
        else if (typeof options.node == 'boolean' && typeof options.browser != 'boolean')
          options.browser = !options.node;
      }
      if ('development' in options)
        options.dev = options.development;
      if (typeof options.dev == 'boolean' || typeof options.production == 'boolean') {
        if (typeof options.production != 'boolean')
          options.production = !options.dev;
        if (typeof options.dev != 'boolean')
          options.dev = !options.production;
      }
    }
    extend(opts, defaults);
    extend(opts, options);
    if (opts.globalDeps)
      opts.externals = opts.externals.concat(Object.keys(opts.globalDeps));
    if (typeof opts.browser == 'boolean') {
      opts.conditions['@system-env|browser'] = opts.browser;
      opts.conditions['@system-env|~browser'] = opts.browser === true ? opts.node : !opts.browser;
      opts.conditions['@system-env|node'] = opts.node;
      opts.conditions['@system-env|~node'] = opts.node === true ? opts.browser : !opts.node;
    }
    if (typeof opts.production == 'boolean') {
      opts.conditions['@system-env|production'] = opts.production;
      opts.conditions['@system-env|~production'] = opts.dev;
      opts.conditions['@system-env|dev'] = opts.dev;
      opts.conditions['@system-env|~dev'] = opts.production;
    }
    return opts;
  }
  Builder.prototype.trace = function(expression, opts) {
    if (opts && opts.config)
      this.config(opts.config);
    var self = this;
    return setExternals(this, opts && opts.externals).then(function() {
      return traceExpression(self, expression, processTraceOpts(opts));
    });
  };
  function processCompileOpts(options, defaults) {
    options = options || {};
    if ('sfxFormat' in options) {
      console.warn('SystemJS Builder "sfxFormat" is deprecated and has been renamed to "format".');
      options.format = options.sfxFormat;
    }
    if ('sfxEncoding' in options) {
      console.warn('SystemJS Builder "sfxEncoding" is deprecated and has been renamed to "encodeNames".');
      options.encodeNames = sfxEncoding;
    }
    if ('sfxGlobals' in options) {
      console.warn('SystemJS Builder "sfxGlobals" is deprecated and has been renamed to "globalDeps".');
      options.globalDeps = options.sfxGlobals;
    }
    if ('sfxGlobalName' in options) {
      console.warn('SystemJS Builder "sfxGlobalName" is deprecated and has been renamed to "globalName".');
      options.globalName = options.sfxGlobalName;
    }
    var opts = {
      entryPoints: [],
      normalize: false,
      anonymous: false,
      systemGlobal: 'System',
      buildConfig: false,
      inlinePlugins: true,
      static: false,
      encodeNames: undefined,
      inlineConditions: false,
      sourceMaps: false,
      lowResSourceMaps: false,
      runtime: false,
      format: 'umd',
      globalDeps: {},
      globalName: null,
      exportDefault: false,
      formatHint: false,
      production: undefined,
      rollup: false
    };
    extend(opts, defaults);
    extend(opts, options);
    if (options.encodeNames && (!'encodeNames' in defaults))
      throw new Error('encodeNames is only supported for buildStatic.');
    if (typeof opts.production != 'boolean')
      opts.production = !opts.development;
    if (opts.static) {
      if (opts.encodeNames !== false)
        opts.encodeNames = true;
      if (options.runtime !== false)
        opts.runtime = true;
      opts.systemGlobal = '$__System';
      opts.normalize = true;
    }
    return opts;
  }
  Builder.prototype.compile = function(moduleNameOrLoad, outFile, opts) {
    if (outFile && typeof outFile == 'object') {
      opts = outFile;
      outFile = undefined;
    }
    if (opts && opts.config)
      this.config(opts.config);
    var self = this;
    return Promise.resolve().then(function() {
      if (typeof moduleNameOrLoad != 'string')
        return moduleNameOrLoad;
      return self.loader.normalize(moduleNameOrLoad).then(function(moduleName) {
        if (!opts || opts.cache !== true)
          self.invalidate(moduleName);
        return self.tracer.getLoadRecord(getCanonicalName(self.loader, moduleName), processTraceOpts(opts, {
          tracePackageConfig: false,
          browser: true,
          node: false,
          production: true,
          dev: false,
          outputESM: false
        }));
      });
    }).then(function(load) {
      var compileOpts = processCompileOpts(opts, {
        normalize: false,
        anonymous: true
      });
      var outputOpts = processOutputOpts(opts, {outFile: outFile});
      return Promise.resolve().then(function() {
        return compileLoad(self.loader, load, processCompileOpts(opts, {
          normalize: false,
          anonymous: true
        }), self.cache.compile);
      }).then(function(output) {
        if (load.metadata.loader)
          return pluginBundleHook(self.loader, [load], compileOpts, outputOpts).then(function(bundleOutput) {
            return [output].concat(bundleOutput.outputs);
          });
        return [output];
      }).then(function(outputs) {
        return writeOutputs(outputs, self.loader.baseURL, outputOpts);
      });
    });
  };
  function processOutputOpts(options, defaults) {
    var opts = {
      outFile: undefined,
      minify: false,
      uglify: undefined,
      mangle: true,
      sourceMaps: false,
      sourceMapContents: undefined
    };
    extend(opts, defaults);
    extend(opts, options);
    opts.uglify = opts.uglify || {};
    opts.uglify.compress = opts.uglify.compress || {};
    opts.uglify.beautify = opts.uglify.beautify || {};
    if (opts.globalDefs && !('global_defs' in opts.uglify.compress))
      opts.uglify.compress.global_defs = opts.globalDefs;
    if (opts.ascii && !('ascii' in opts.uglify.beautify))
      opts.uglify.beautify.ascii_only = opts.ascii;
    delete opts.globalDefs;
    delete opts.ascii;
    if (!('dead_code' in opts.uglify.compress))
      opts.uglify.compress.dead_code = true;
    if (!('warnings' in opts.uglify.compress))
      opts.uglify.compress.warnings = false;
    if (opts.sourceMapContents === undefined)
      opts.sourceMapContents = opts.sourceMaps == 'inline';
    if (opts.sourceMapContents)
      opts.uglify.sourceMapIncludeSources = true;
    return opts;
  }
  function setExternals(builder, externals) {
    if (!externals)
      return Promise.resolve();
    var externalMeta;
    return Promise.all(externals.map(function(external) {
      externalMeta = externalMeta || {};
      return builder.loader.normalize(external).then(function(normalizedExternal) {
        externalMeta[normalizedExternal] = {build: false};
      });
    })).then(function() {
      if (externalMeta)
        builder.config({meta: externalMeta});
    });
  }
  Builder.prototype.bundle = function(expressionOrTree, outFile, opts) {
    if (outFile && typeof outFile === 'object') {
      opts = outFile;
      outFile = undefined;
    }
    var self = this;
    if (opts && opts.config)
      this.config(opts.config);
    var outputOpts = processOutputOpts(opts, {outFile: outFile});
    var traceOpts = processTraceOpts(opts, {
      tracePackageConfig: true,
      browser: true,
      node: false,
      production: true,
      dev: false
    });
    var compileOpts = processCompileOpts(opts);
    if (compileOpts.inlineConditions)
      traceOpts.traceConditionModules = false;
    if (opts && opts.fetch)
      this.fetch = opts.fetch;
    return Promise.resolve().then(function() {
      if (expressionOrTree instanceof Array)
        expressionOrTree = '[' + expressionOrTree.join('] + [') + ']';
      if (typeof expressionOrTree != 'string')
        return expressionOrTree;
      return setExternals(self, traceOpts.externals).then(function() {
        return traceExpression(self, expressionOrTree, traceOpts);
      });
    }).then(function(tree) {
      return Promise.resolve().then(function() {
        if (compileOpts.inlineConditions)
          return self.tracer.inlineConditions(tree, self.loader, traceOpts.conditions);
        return tree;
      }).then(function(tree) {
        return compileTree(self.loader, tree, traceOpts, compileOpts, outputOpts, self.cache.compile).then(function(compiled) {
          return writeOutputs(compiled.outputs, self.loader.baseURL, outputOpts).then(function(output) {
            output.modules = compiled.modules;
            output.entryPoints = compiled.entryPoints;
            output.tree = tree;
            output.assetList = compiled.assetList;
            if (outputOpts.outFile) {
              try {
                output.bundleName = self.getCanonicalName(toFileURL(path.resolve(outputOpts.outFile)));
              } catch (e) {}
            }
            return output;
          });
        });
      });
    });
  };
  Builder.prototype.buildStatic = function(expressionOrTree, outFile, opts) {
    if (outFile && typeof outFile === 'object') {
      opts = outFile;
      outFile = undefined;
    }
    var self = this;
    if (opts && opts.config)
      this.config(opts.config);
    var entryPoints;
    if (typeof expressionOrTree == 'string')
      entryPoints = [expressionOrTree.split(/ [\+\&\-] /)[0]];
    else if (expressionOrTree instanceof Array)
      entryPoints = expressionOrTree[0];
    else
      entryPoints = [];
    if (entryPoints[0] && entryPoints[0].indexOf('*') != -1)
      entryPoints = [];
    var outputOpts = processOutputOpts(opts, {outFile: outFile});
    var traceOpts = processTraceOpts(opts, {
      tracePackageConfig: false,
      production: true,
      dev: false
    });
    var compileOpts = processCompileOpts(opts, {
      static: true,
      entryPoints: entryPoints,
      encodeNames: true
    });
    var inlineMap;
    if (opts && opts.fetch)
      this.fetch = opts.fetch;
    return Promise.resolve().then(function() {
      if (expressionOrTree instanceof Array)
        expressionOrTree = '[' + expressionOrTree.join('] + [') + ']';
      if (typeof expressionOrTree != 'string')
        return expressionOrTree;
      return setExternals(self, traceOpts.externals).then(function() {
        return traceExpression(self, expressionOrTree, traceOpts);
      });
    }).then(function(tree) {
      return self.tracer.inlineConditions(tree, self.loader, traceOpts.conditions).then(function(inlinedTree) {
        if (!compileOpts.rollup)
          return compileTree(self.loader, inlinedTree, traceOpts, compileOpts, outputOpts, self.cache.compile);
        return rollupTree(self.loader, inlinedTree, [], traceOpts, compileOpts, outputOpts).then(function(rolledUp) {
          inlineMap = rolledUp.inlineMap;
          if (rolledUp.tree)
            return compileTree(self.loader, rolledUp.tree, traceOpts, compileOpts, outputOpts, self.cache.compile);
          else if (rolledUp.outputs)
            return {
              outputs: (compileOpts.formatHint ? [getFormatHint(compileOpts)] : []).concat(rolledUp.outputs),
              assetList: rolledUp.assetList
            };
        }).then(function(compiled) {
          return {
            modules: Object.keys(tree).filter(function(m) {
              return tree[m] && !tree[m].conditional;
            }),
            assetList: compiled.assetList || [],
            outputs: compiled.outputs
          };
        });
      }).then(function(compiled) {
        return writeOutputs(compiled.outputs, self.loader.baseURL, outputOpts).then(function(output) {
          if (inlineMap)
            output.inlineMap = inlineMap;
          output.assetList = compiled.assetList;
          output.modules = compiled.modules;
          output.tree = tree;
          return output;
        });
      });
    });
  };
  Builder.prototype.build = function() {
    console.warn('builder.build is deprecated. Using builder.bundle instead.');
    return this.bundle.apply(this, arguments);
  };
  Builder.prototype.buildSFX = function() {
    console.warn('builder.buildSFX is deprecated. Using builder.buildStatic instead.');
    return this.buildStatic.apply(this, arguments);
  };
  Builder.prototype.buildTree = function() {
    console.warn('builder.buildTree is deprecated. Using builder.bundle instead, which takes both a tree object or expression string.');
    return this.bundle.apply(this, arguments);
  };
  Builder.prototype.getDepCache = function(tree) {
    var depCache = {};
    Object.keys(tree).forEach(function(moduleName) {
      var load = tree[moduleName];
      if (load && load.deps && load.deps.length)
        depCache[moduleName] = load.deps.map(function(dep) {
          return dep;
        });
    });
    return depCache;
  };
  Builder.prototype.getDeferredImports = function(tree) {
    var getDeferredImports = require('./get-deferred-imports');
    return getDeferredImports(this, tree);
  };
  Builder.prototype.intersectTrees = require('./arithmetic').intersectTrees;
  Builder.prototype.addTrees = require('./arithmetic').addTrees;
  Builder.prototype.subtractTrees = require('./arithmetic').subtractTrees;
  module.exports = Builder;
})(require('process'));
