/* */ 
(function(process) {
  var getCanonicalName = require('./utils').getCanonicalName;
  var glob = require('glob');
  var toFileURL = require('./utils').toFileURL;
  var fromFileURL = require('./utils').fromFileURL;
  var asp = require('bluebird').promisify;
  var fs = require('fs');
  var path = require('path');
  var extend = require('./utils').extend;
  var Promise = require('bluebird');
  var getPackage = require('./utils').getPackage;
  var getPackageConfigPath = require('./utils').getPackageConfigPath;
  var isPackageConfig = require('./utils').isPackageConfig;
  var parseCondition = require('./utils').parseCondition;
  var serializeCondition = require('./utils').serializeCondition;
  var dataUriToBuffer = require('data-uri-to-buffer');
  module.exports = Trace;
  function Trace(loader, traceCache) {
    Object.keys(traceCache).forEach(function(canonical) {
      var load = traceCache[canonical];
      if (load && !load.conditional)
        load.fresh = false;
    });
    this.loader = loader;
    this.loads = traceCache || {};
    this.tracing = {};
  }
  var namedRegisterRegEx = /(System\.register(Dynamic)?|define)\(('[^']+'|"[^"]+")/g;
  Trace.prototype.traceModule = function(moduleName, traceOpts) {
    var loader = this.loader;
    return Promise.resolve(loader.normalize(moduleName)).then(function(normalized) {
      return traceCanonical(getCanonicalName(loader, normalized), traceOpts);
    });
  };
  Trace.prototype.traceCanonical = function(canonical, traceOpts) {
    var self = this;
    return toCanonicalConditionalEnv.call(self, traceOpts.conditions).then(function(canonicalConditionalEnv) {
      if (!traceOpts.traceConditionsOnly)
        return self.getAllLoadRecords(canonical, traceOpts, canonicalConditionalEnv, {}, []);
      else
        return self.getConditionLoadRecords(canonical, traceOpts, canonicalConditionalEnv, false, {}, []);
    }).then(function(loads) {
      var thisLoad = loads[canonical];
      if (thisLoad && !thisLoad.conditional && thisLoad.metadata.bundle) {
        namedRegisterRegEx.lastIndex = 0;
        var curMatch;
        while ((curMatch = namedRegisterRegEx.exec(thisLoad.source)))
          loads[curMatch[3].substr(1, curMatch[3].length - 2)] = true;
      }
      return {
        moduleName: canonical,
        tree: loads
      };
    });
  };
  function isLoadFresh(load, loader, loads) {
    if (load === undefined)
      return false;
    if (load === false)
      return true;
    if (load.configHash != loader.configHash)
      return false;
    if (load.fresh)
      return true;
    if (load.conditional)
      return false;
    if (load.plugin) {
      var plugin = loads[load.plugin];
      if (!isLoadFresh(plugin, loader, loads))
        return false;
    }
    try {
      var timestamp = fs.statSync(path.resolve(fromFileURL(loader.baseURL), load.path)).mtime.getTime();
    } catch (e) {}
    return load.fresh = timestamp == load.timestamp;
  }
  Trace.prototype.getLoadRecord = function(canonical, traceOpts, parentStack) {
    var loader = this.loader;
    var loads = this.loads;
    if (isLoadFresh(loads[canonical], loader, loads))
      return Promise.resolve(loads[canonical]);
    if (this.tracing[canonical])
      return this.tracing[canonical];
    var self = this;
    var isPackageConditional = canonical.indexOf('/#:') != -1;
    var curMap = loader.map;
    loader.map = {};
    var normalized = loader.decanonicalize(canonical);
    loader.map = curMap;
    return this.tracing[canonical] = Promise.resolve(normalized).then(function(normalized) {
      if (loader.has(normalized))
        return false;
      if (!isPackageConditional)
        normalized = normalized.replace('/#:', '/');
      var booleanIndex = canonical.lastIndexOf('#?');
      if (booleanIndex != -1) {
        var condition = canonical.substr(booleanIndex + 2);
        if (condition.indexOf('|') == -1)
          condition += '|default';
        return {
          name: canonical,
          fresh: true,
          conditional: {
            condition: condition,
            branch: canonical.substr(0, booleanIndex)
          }
        };
      }
      var pkgEnvIndex = canonical.indexOf('/#:');
      if (pkgEnvIndex != -1) {
        if (canonical.indexOf('!') != -1)
          throw new Error('Unable to trace ' + canonical + ' - building package environment mappings of plugins is not currently supported.');
        var pkgName = canonical.substr(0, pkgEnvIndex);
        var subPath = canonical.substr(pkgEnvIndex + 3);
        var normalizedPkgName = loader.decanonicalize(pkgName);
        var loadPackageConfig;
        var packageConfigPath = getPackageConfigPath(loader.packageConfigPaths, normalizedPkgName);
        if (packageConfigPath) {
          loadPackageConfig = getCanonicalName(loader, packageConfigPath);
          (loader.meta[packageConfigPath] = loader.meta[packageConfigPath] || {}).format = 'json';
        }
        var absURLRegEx = /^[^\/]+:\/\//;
        function isPlain(name) {
          return name[0] != '.' && name[0] != '/' && !name.match(absURLRegEx);
        }
        function getMapMatch(map, name) {
          var bestMatch,
              bestMatchLength = 0;
          for (var p in map) {
            if (name.substr(0, p.length) == p && (name.length == p.length || name[p.length] == '/')) {
              var curMatchLength = p.split('/').length;
              if (curMatchLength <= bestMatchLength)
                continue;
              bestMatch = p;
              bestMatchLength = curMatchLength;
            }
          }
          return bestMatch;
        }
        function toPackagePath(subPath, isFallback) {
          if (isPlain(subPath)) {
            if (!isFallback)
              return loader.normalize(subPath, normalizedPkgName + '/');
            else
              return loader.normalize(subPath);
          } else if (subPath == '.') {
            return Promise.resolve(normalizedPkgName);
          } else if (subPath.substr(0, 2) == './') {
            var pkgMap = pkg.map;
            pkg.map = {};
            var normalized = loader.normalizeSync(pkgName + '/' + subPath.substr(2));
            pkg.map = pkgMap;
            return Promise.resolve(normalized);
          } else {
            return Promise.resolve(normalized);
          }
        }
        var pkg;
        var envMap;
        var metadata = {};
        return loader.normalize(normalizedPkgName).then(function() {
          pkg = loader.packages[normalizedPkgName];
          var mapMatch = getMapMatch(pkg.map, subPath);
          envMap = pkg.map[mapMatch];
          if (!envMap)
            throw new Error('Package conditional ' + canonical + ' has no package conditional map present.');
          return toPackagePath(subPath, true);
        }).then(function(resolvedPath) {
          if (resolvedPath.match(/\#[\:\?\{]/))
            return getCanonicalName(loader, resolvedPath);
          if (isPlain(resolvedPath))
            return resolvedPath;
          return loader.locate({
            name: resolvedPath,
            metadata: metadata
          }).then(function(address) {
            if (metadata.build === false)
              return false;
            return new Promise(function(resolve) {
              fs.exists(fromFileURL(address), resolve);
            }).then(function(fallbackExists) {
              if (fallbackExists)
                return getCanonicalName(loader, resolvedPath);
            });
          });
        }).then(function(fallback) {
          return Promise.all(Object.keys(envMap).map(function(envCondition) {
            var mapping = envMap[envCondition];
            var conditionObj = parseCondition(envCondition);
            return loader.normalize(conditionObj.module, normalizedPkgName).then(function(conditionModule) {
              conditionObj.module = getCanonicalName(loader, conditionModule);
              return toPackagePath(mapping, false);
            }).then(function(normalizedMapping) {
              return {
                condition: serializeCondition(conditionObj),
                branch: getCanonicalName(loader, normalizedMapping)
              };
            });
          })).then(function(envs) {
            return {
              name: canonical,
              fresh: true,
              packageConfig: loadPackageConfig,
              conditional: {
                envs: envs,
                fallback: fallback
              }
            };
          });
        });
      }
      var interpolationRegEx = /#\{[^\}]+\}/;
      var interpolationMatch = canonical.match(interpolationRegEx);
      if (interpolationMatch) {
        var condition = interpolationMatch[0].substr(2, interpolationMatch[0].length - 3);
        if (condition.indexOf('|') == -1)
          condition += '|default';
        var metadata = {};
        return Promise.resolve(loader.locate({
          name: normalized.replace(interpolationRegEx, '*'),
          metadata: metadata
        })).then(function(address) {
          if (address.substr(0, 8) != 'file:///' && !load.metadata.loader)
            metadata.build = false;
          if (metadata.build === false)
            return false;
          var globIndex = address.indexOf('*');
          return asp(glob)(fromFileURL(address), {
            dot: true,
            nobrace: true,
            noglobstar: true,
            noext: true,
            nodir: true
          }).then(function(paths) {
            var branches = {};
            paths.forEach(function(path) {
              path = toFileURL(path);
              var pathCanonical = getCanonicalName(loader, path);
              var interpolate = pathCanonical.substr(interpolationMatch.index, path.length - address.length + 1);
              if (normalized.indexOf('!') != -1) {
                if (loader.pluginFirst)
                  pathCanonical = getCanonicalName(loader, metadata.loader) + '!' + pathCanonical;
                else
                  pathCanonical = pathCanonical + '!' + getCanonicalName(loader, metadata.loader);
              }
              branches[interpolate] = pathCanonical;
            });
            return {
              name: canonical,
              fresh: false,
              conditional: {
                condition: condition,
                branches: branches
              }
            };
          });
        });
      }
      var load = {
        name: canonical,
        path: null,
        metadata: {},
        deps: [],
        depMap: {},
        source: null,
        fresh: true,
        timestamp: null,
        configHash: loader.configHash,
        plugin: null,
        runtimePlugin: false,
        pluginConfig: null,
        packageConfig: null,
        isPackageConfig: isPackageConfig(loader, canonical),
        deferredImports: null,
        compactedLoads: null
      };
      var curHook = 'locate';
      var originalSource;
      return Promise.resolve(loader.locate({
        name: normalized,
        metadata: load.metadata
      })).then(function(address) {
        curHook = '';
        if (address.substr(0, 8) != 'file:///' && !load.metadata.loader)
          load.metadata.build = false;
        if (load.metadata.build === false)
          return false;
        if (address.substr(0, 8) == 'file:///')
          load.path = path.relative(fromFileURL(loader.baseURL), fromFileURL(address));
        return Promise.resolve().then(function() {
          if (load.metadata.loaderModule)
            return Promise.resolve(loader.pluginLoader.normalize(load.metadata.loader, normalized)).then(function(pluginNormalized) {
              load.plugin = getCanonicalName(loader, pluginNormalized);
              if (load.metadata.loaderModule && (load.metadata.loaderModule.build === false || Object.keys(load.metadata.loaderModule).length == 0))
                load.runtimePlugin = true;
              if (pluginNormalized.indexOf('!') == -1 && !load.runtimePlugin && getPackage(loader.packages, pluginNormalized)) {
                var packageConfigPath = getPackageConfigPath(loader.packageConfigPaths, pluginNormalized);
                if (packageConfigPath) {
                  load.pluginConfig = getCanonicalName(loader, packageConfigPath);
                  (loader.meta[packageConfigPath] = loader.meta[packageConfigPath] || {}).format = 'json';
                }
              }
            });
        }).then(function() {
          if (load.runtimePlugin)
            return load;
          curHook = 'fetch';
          return loader.fetch({
            name: normalized,
            metadata: load.metadata,
            address: address
          }).then(function(source) {
            if (!traceOpts.sourceMaps || load.metadata.sourceMap)
              return source;
            var sourceMap = source.match(/^\s*\/\/\s*[#@] sourceMappingURL=([^\s'"]*)/m);
            if (!sourceMap)
              return source;
            if (sourceMap[1].startsWith('data:')) {
              load.metadata.sourceMap = JSON.parse(dataUriToBuffer(sourceMap[1]).toString('utf8'));
              return source;
            } else {
              var sourceMapPath = path.join(path.dirname(fromFileURL(address)), sourceMap[1]);
              return asp(fs.readFile)(sourceMapPath, 'utf8').then(function(sourceMap) {
                load.metadata.sourceMap = JSON.parse(sourceMap);
                return source;
              }).catch(function() {
                return source;
              });
            }
          }).then(function(source) {
            if (typeof source != 'string')
              throw new TypeError('Loader fetch hook did not return a source string');
            originalSource = source;
            curHook = 'translate';
            if (load.metadata.timestamp) {
              load.timestamp = load.metadata.timestamp;
              load.metadata.timestamp = undefined;
            }
            return loader.translate({
              name: normalized,
              metadata: load.metadata,
              address: address,
              source: source
            }, traceOpts);
          }).then(function(source) {
            load.source = source;
            curHook = 'dependency parsing';
            return loader.instantiate({
              name: normalized,
              metadata: load.metadata,
              address: address,
              source: source
            });
          }).then(function(result) {
            if (load.metadata.build === false)
              return;
            curHook = '';
            if (!result)
              throw new TypeError('Native ES Module builds not supported. Ensure transpilation is included in the loader pipeline.');
            load.deps = result.deps;
            if (load.metadata.format == 'esm' && load.metadata.originalSource)
              load.source = originalSource;
            if (getPackage(loader.packages, normalized) && !load.isPackageConfig) {
              var packageConfigPath = getPackageConfigPath(loader.packageConfigPaths, normalized);
              if (packageConfigPath) {
                load.packageConfig = getCanonicalName(loader, packageConfigPath);
                (loader.meta[packageConfigPath] = loader.meta[packageConfigPath] || {}).format = 'json';
              }
            }
            return Promise.all(result.deps.map(function(dep) {
              return loader.normalize(dep, normalized, address).then(function(normalized) {
                try {
                  load.depMap[dep] = getCanonicalName(loader, normalized);
                } catch (e) {
                  if (!traceOpts.excludeURLs || normalized.substr(0, 7) == 'file://')
                    throw e;
                  load.depMap[dep] = normalized;
                }
              });
            }));
          });
        }).catch(function(err) {
          var msg = (curHook ? ('Error on ' + curHook + ' for ') : 'Error tracing ') + canonical + ' at ' + normalized;
          if (parentStack)
            parentStack.reverse().forEach(function(parent) {
              msg += '\n\tLoading ' + parent;
            });
          var newMsg = msg + '\n\t' + (err.message || err);
          var newErr = new Error(newMsg, err.fileName, err.lineNumber);
          newErr.originalErr = err.originalErr || err;
          newErr.stack = msg + '\n\t' + (err.stack || err);
          throw newErr;
        }).then(function() {
          load.metadata.entry = undefined;
          load.metadata.builderExecute = undefined;
          load.metadata.parseTree = undefined;
          load.metadata.ast = undefined;
          if (load.metadata.build === false)
            return false;
          return load;
        });
      });
    }).then(function(load) {
      self.tracing[canonical] = undefined;
      return loads[canonical] = load;
    }).catch(function(err) {
      self.tracing[canonical] = undefined;
      throw err;
    });
  };
  var systemModules = ['@empty', '@system-env', '@@amd-helpers', '@@global-helpers'];
  Trace.prototype.getAllLoadRecords = function(canonical, traceOpts, canonicalConditionalEnv, curLoads, parentStack) {
    var loader = this.loader;
    curLoads = curLoads || {};
    if (canonical in curLoads)
      return curLoads;
    var self = this;
    return this.getLoadRecord(canonical, traceOpts, parentStack).then(function(load) {
      if (systemModules.indexOf(canonical) == -1)
        curLoads[canonical] = load;
      if (load) {
        parentStack = parentStack.concat([canonical]);
        return Promise.all(Trace.getLoadDependencies(load, traceOpts.tracePackageConfig, true, traceOpts.traceAllConditionals, traceOpts.traceConditionModules, canonicalConditionalEnv).map(function(dep) {
          return self.getAllLoadRecords(dep, traceOpts, canonicalConditionalEnv, curLoads, parentStack);
        }));
      }
    }).then(function() {
      return curLoads;
    });
  };
  Trace.prototype.getConditionLoadRecords = function(canonical, traceOpts, canonicalConditionalEnv, inConditionTree, curLoads, parentStack) {
    var loader = this.loader;
    if (canonical in curLoads)
      return curLoads;
    var self = this;
    return this.getLoadRecord(canonical, traceOpts, parentStack).then(function(load) {
      if (inConditionTree && systemModules.indexOf(canonical) == -1)
        curLoads[canonical] = load;
      if (load) {
        parentStack = parentStack.concat([canonical]);
        return Promise.all(Trace.getLoadDependencies(load, traceOpts.tracePackageConfig, true, true, traceOpts.traceConditionModules, canonicalConditionalEnv, true).map(function(dep) {
          return self.getConditionLoadRecords(dep, traceOpts, canonicalConditionalEnv, true, curLoads, parentStack);
        })).then(function() {
          return Promise.all(Trace.getLoadDependencies(load, traceOpts.tracePackageConfig, true, true, traceOpts.traceConditionModules, canonicalConditionalEnv).map(function(dep) {
            return self.getConditionLoadRecords(dep, traceOpts, canonicalConditionalEnv, inConditionTree, curLoads, parentStack);
          }));
        });
      }
    }).then(function() {
      return curLoads;
    });
  };
  function conditionalComplement(condition) {
    var conditionObj = parseCondition(condition);
    conditionObj.negate = !conditionObj.negate;
    return serializeCondition(conditionObj);
  }
  function toCanonicalConditionalEnv(conditionalEnv) {
    var loader = this.loader;
    var canonicalConditionalEnv = {};
    return Promise.all(Object.keys(conditionalEnv).map(function(m) {
      var conditionObj = parseCondition(m);
      return loader.normalize(conditionObj.module).then(function(normalized) {
        conditionObj.module = getCanonicalName(loader, normalized);
        var canonicalCondition = serializeCondition(conditionObj);
        canonicalConditionalEnv[canonicalCondition] = conditionalEnv[m];
      });
    })).then(function() {
      return canonicalConditionalEnv;
    });
  }
  Trace.prototype.inlineConditions = function(tree, loader, conditionalEnv) {
    var self = this;
    return toCanonicalConditionalEnv.call(this, conditionalEnv).then(function(canonicalConditionalEnv) {
      var inconsistencyErrorMsg = 'For static condition inlining only an exact environment resolution can be built, pending https://github.com/systemjs/builder/issues/311.';
      for (var c in conditionalEnv) {
        var val = conditionalEnv[c];
        if (typeof val == 'string')
          continue;
        var complement = conditionalComplement(c);
        if (val instanceof Array || complement in conditionalEnv && conditionalEnv[complement] != !conditionalEnv[c])
          throw new TypeError('Error building condition ' + c + '. ' + inconsistencyErrorMsg);
      }
      var conditionalResolutions = {};
      var importsSystemEnv = false;
      Object.keys(tree).filter(function(m) {
        return tree[m] && tree[m].conditional;
      }).forEach(function(c) {
        var branches = Trace.getConditionalResolutions(tree[c].conditional, false, canonicalConditionalEnv).branches;
        if (branches.length > 1)
          throw new TypeError('Error building condition ' + c + '. ' + inconsistencyErrorMsg);
        if (branches.length == 0)
          throw new TypeError('No exact resolution found at all for condition ' + c + '.');
        conditionalResolutions[c] = branches[0];
      });
      Object.keys(conditionalResolutions).forEach(function(c) {
        var resolution = conditionalResolutions[c];
        var seen = [];
        while (conditionalResolutions[resolution] && seen.indexOf(resolution) == -1) {
          seen.push(resolution);
          resolution = conditionalResolutions[resolution];
          conditionalResolutions[c] = resolution;
        }
        if (seen.indexOf(resolution) != -1)
          throw new Error('Circular conditional resolution ' + seen.join(' -> ') + ' -> ' + resolution);
      });
      var inlinedTree = {};
      Object.keys(tree).forEach(function(m) {
        var load = tree[m];
        if (typeof load == 'boolean') {
          inlinedTree[m] = load;
          return;
        }
        if (load.conditional)
          return;
        var clonedLoad = extend({}, load);
        clonedLoad.depMap = {};
        Object.keys(load.depMap).forEach(function(d) {
          var normalizedDep = load.depMap[d];
          normalizedDep = conditionalResolutions[normalizedDep] || normalizedDep;
          if (normalizedDep == '@system-env')
            importsSystemEnv = true;
          if (normalizedDep.indexOf(/#[\:\?\{]/) != -1)
            throw new Error('Unable to inline conditional dependency ' + normalizedDep + '. Try including the ' + d + ' dependency of ' + load.name + ' in the build.');
          clonedLoad.depMap[d] = normalizedDep;
        });
        inlinedTree[m] = clonedLoad;
      });
      if (importsSystemEnv) {
        inlinedTree['@system-env'] = {
          name: '@system-env',
          path: null,
          metadata: {format: 'json'},
          deps: [],
          depMap: {},
          source: JSON.stringify({
            production: conditionalEnv['@system-env|production'],
            browser: conditionalEnv['@system-env|browser'],
            node: conditionalEnv['@system-env|node'],
            dev: conditionalEnv['@system-env|dev'],
            default: true
          }),
          fresh: true,
          timestamp: null,
          configHash: loader.configHash
        };
      }
      return inlinedTree;
    });
  };
  Trace.getConditionalResolutions = function(conditional, traceAllConditionals, conditionalEnv) {
    if (traceAllConditionals !== false)
      traceAllConditionals = true;
    conditionalEnv = conditionalEnv || {};
    var branches = [];
    var conditionModules = [];
    function envTrace(condition) {
      var conditionModule = parseCondition(condition).module;
      if (conditionModules.indexOf(conditionModule) == -1)
        conditionModules.push(conditionModule);
      return condition in conditionalEnv ? conditionalEnv[condition] : traceAllConditionals;
    }
    if (conditional.branch) {
      branches.push(envTrace(conditional.condition) ? conditional.branch : '@empty');
      conditionModules.push(parseCondition(conditional.condition).module);
    } else if (conditional.envs) {
      var doFallback = true;
      conditional.envs.forEach(function(env) {
        if (envTrace(env.condition))
          branches.push(env.branch);
        if (!envTrace(conditionalComplement(env.condition)))
          doFallback = false;
      });
      if (doFallback && conditional.fallback)
        branches.push(conditional.fallback);
    } else if (conditional.branches) {
      var et = envTrace(conditional.condition);
      if (et !== undefined && et !== false) {
        Object.keys(conditional.branches).forEach(function(branch) {
          if (et === true || et !== true && et.indexOf(branch) != -1) {
            envTrace(conditional.condition);
            branches.push(conditional.branches[branch]);
          }
        });
      }
    }
    return {
      branches: branches,
      conditionModules: conditionModules
    };
  };
  Trace.getLoadDependencies = function(load, tracePackageConfig, traceRuntimePlugin, traceAllConditionals, traceConditionModules, canonicalConditionalEnv, conditionsOnly) {
    if (traceAllConditionals !== false)
      traceAllConditionals = true;
    canonicalConditionalEnv = canonicalConditionalEnv || {};
    var deps = [];
    if (!load.conditional && conditionsOnly)
      return deps;
    if (load.conditional) {
      var resolutions = Trace.getConditionalResolutions(load.conditional, traceAllConditionals, canonicalConditionalEnv);
      if (tracePackageConfig && load.packageConfig)
        deps.push(load.packageConfig);
      if (traceConditionModules)
        resolutions.conditionModules.forEach(function(conditionModule) {
          if (deps.indexOf(conditionModule) == -1)
            deps.push(conditionModule);
        });
      if (conditionsOnly)
        return deps;
      else
        return deps.concat(resolutions.branches);
    }
    if (traceRuntimePlugin && load.runtimePlugin)
      deps.push(load.plugin);
    if (tracePackageConfig && load.pluginConfig)
      deps.push(load.pluginConfig);
    load.deps.forEach(function(dep) {
      deps.push(load.depMap[dep]);
    });
    if (tracePackageConfig && load.packageConfig)
      deps.push(load.packageConfig);
    return deps;
  };
})(require('process'));
