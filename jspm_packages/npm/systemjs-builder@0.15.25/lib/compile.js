/* */ 
var Promise = require('bluebird');
var asp = require('bluebird').promisify;
var fs = require('fs');
var path = require('path');
var url = require('url');
var createHash = require('crypto').createHash;
var template = require('es6-template-strings');
var getAlias = require('./utils').getAlias;
var extend = require('./utils').extend;
var traverseTree = require('./arithmetic').traverseTree;
var verifyTree = require('./utils').verifyTree;
var getFormatHint = require('./utils').getFormatHint;
var compilerMap = {
  'amd': '../compilers/amd',
  'cjs': '../compilers/cjs',
  'esm': '../compilers/esm',
  'global': '../compilers/global',
  'register': '../compilers/register',
  'json': '../compilers/json'
};
function getCompileHash(load, compileOpts) {
  return createHash('md5').update(JSON.stringify({
    source: load.source,
    metadata: load.metadata,
    path: compileOpts.sourceMaps && load.path,
    normalize: compileOpts.normalize,
    anonymous: compileOpts.anonymous,
    systemGlobal: compileOpts.systemGlobal,
    static: compileOpts.static,
    encodeNames: compileOpts.encodeNames,
    sourceMaps: compileOpts.sourceMaps,
    lowResSourceMaps: compileOpts.lowResSourceMaps
  })).digest('hex');
}
function getEncoding(canonical, encodings, loader) {
  if (canonical[0] == '@' && canonical != '@dummy-entry-point' && loader.has(canonical))
    return canonical;
  if (encodings[canonical])
    return encodings[canonical];
  var highestEncoding = 0;
  Object.keys(encodings).forEach(function(canonical) {
    var encoding = encodings[canonical];
    highestEncoding = Math.max(parseInt(encoding, '16'), highestEncoding);
  });
  highestEncoding++;
  return encodings[canonical] = highestEncoding.toString(16);
}
function getName(encoding, encodings) {
  var match;
  Object.keys(encodings).some(function(e) {
    if (encodings[e] == encoding) {
      match = e;
      return true;
    }
  });
  return match;
}
var hashBangRegEx = /^\#\!.*/;
exports.compileLoad = compileLoad;
function compileLoad(loader, load, compileOpts, cache) {
  var cached = cache.loads[load.name];
  if (cached && cached.hash == getCompileHash(load, compileOpts))
    return Promise.resolve(cached.output);
  function remapLoadRecord(load, mapFunction) {
    load = extend({}, load);
    load.name = mapFunction(load.name, load.name);
    var depMap = {};
    Object.keys(load.depMap).forEach(function(dep) {
      depMap[dep] = mapFunction(load.depMap[dep], dep);
    });
    load.depMap = depMap;
    return load;
  }
  var mappedLoad = remapLoadRecord(load, function(name, original) {
    if (compileOpts.encodeNames)
      return getEncoding(name, cache.encodings, loader);
    if (compileOpts.normalize && name.indexOf('#:') != -1)
      throw new Error('Unable to build dependency ' + name + '. normalize must be disabled for bundles containing conditionals.');
    return name;
  });
  var format = load.metadata.format;
  if (format == 'defined')
    return Promise.resolve({source: compileOpts.systemGlobal + '.register("' + mappedLoad.name + '", [], function() { return { setters: [], execute: function() {} } });\n'});
  if (format in compilerMap) {
    if (format == 'cjs')
      mappedLoad.source = mappedLoad.source.replace(hashBangRegEx, '');
    return Promise.resolve().then(function() {
      return require(compilerMap[format]).compile(mappedLoad, compileOpts, loader);
    }).then(function(output) {
      cache.loads[load.name] = {
        hash: getCompileHash(load, compileOpts),
        output: output
      };
      return output;
    }).catch(function(err) {
      if (err instanceof Array)
        err = err[0];
      err.message = 'Error compiling ' + format + ' module "' + load.name + '" at ' + load.path + '\n\t' + err.message;
      throw err;
    });
  }
  return Promise.reject(new TypeError('Unknown module format ' + format));
}
exports.getTreeModulesPostOrder = getTreeModulesPostOrder;
function getTreeModulesPostOrder(tree, traceOpts) {
  var entryPoints = [];
  var entryMap = {};
  var moduleList = Object.keys(tree).filter(function(module) {
    return tree[module] !== false;
  }).sort();
  moduleList.forEach(function(entryPoint) {
    traverseTree(tree, entryPoint, function(depName, parentName) {
      if (entryMap[depName])
        return false;
      if (parentName)
        entryMap[depName] = entryPoint;
    }, traceOpts);
  });
  moduleList.forEach(function(entryPoint) {
    if (!entryMap[entryPoint])
      entryPoints.push(entryPoint);
  });
  entryPoints = entryPoints.sort();
  var modules = [];
  entryPoints.reverse().forEach(function(moduleName) {
    traverseTree(tree, moduleName, function(depName, parentName) {
      if (modules.indexOf(depName) == -1)
        modules.push(depName);
    }, traceOpts, true);
  });
  return {
    entryPoints: entryPoints,
    modules: modules.reverse()
  };
}
exports.pluginBundleHook = pluginBundleHook;
function pluginBundleHook(loader, loads, compileOpts, outputOpts) {
  var outputs = [];
  var assetList = [];
  var pluginLoads = {};
  loads.forEach(function(load) {
    if (load.metadata.loader) {
      var pluginLoad = extend({}, load);
      pluginLoad.address = loader.baseURL + load.path;
      (pluginLoads[load.metadata.loader] = pluginLoads[load.metadata.loader] || []).push(pluginLoad);
    }
  });
  return Promise.all(Object.keys(pluginLoads).map(function(pluginName) {
    var loads = pluginLoads[pluginName];
    var loaderModule = loads[0].metadata.loaderModule;
    if (loaderModule.listAssets)
      return Promise.resolve(loaderModule.listAssets.call(loader.pluginLoader, loads, compileOpts, outputOpts)).then(function(_assetList) {
        assetList = assetList.concat(_assetList.map(function(asset) {
          return {
            url: asset.url,
            type: asset.type,
            source: asset.source,
            sourceMap: asset.sourceMap
          };
        }));
      });
  })).then(function() {
    return Promise.all(Object.keys(pluginLoads).map(function(pluginName) {
      var loads = pluginLoads[pluginName];
      var loaderModule = loads[0].metadata.loaderModule;
      if (compileOpts.inlinePlugins) {
        if (loaderModule.inline) {
          return Promise.resolve(loaderModule.inline.call(loader.pluginLoader, loads, compileOpts, outputOpts));
        } else if (loaderModule.bundle) {
          if (loaderModule.bundle.length < 3)
            return Promise.resolve(loaderModule.bundle.call(loader.pluginLoader, loads, extend(extend({}, compileOpts), outputOpts)));
          else
            return Promise.resolve(loaderModule.bundle.call(loader.pluginLoader, loads, compileOpts, outputOpts));
        }
      }
    }));
  }).then(function(compiled) {
    var outputs = [];
    compiled = compiled || [];
    compiled.forEach(function(output) {
      if (output instanceof Array)
        outputs = outputs.concat(output);
      else if (output)
        outputs.push(output);
    });
    return {
      outputs: outputs,
      assetList: assetList
    };
  });
}
exports.compileTree = compileTree;
function compileTree(loader, tree, traceOpts, compileOpts, outputOpts, cache) {
  verifyTree(tree);
  var ordered = getTreeModulesPostOrder(tree, traceOpts);
  var inputEntryPoints;
  var entryPoints;
  var modules;
  var outputs = [];
  var compilers = {};
  return Promise.resolve().then(function() {
    if (!compileOpts.entryPoints)
      return [];
    return Promise.all(compileOpts.entryPoints.map(function(entryPoint) {
      return loader.normalize(entryPoint).then(function(normalized) {
        return loader.getCanonicalName(normalized);
      });
    })).filter(function(inputEntryPoint) {
      return !inputEntryPoint.match(/\#\:|\#\?|\#{/) && tree[inputEntryPoint];
    });
  }).then(function(inputEntryPoints) {
    entryPoints = inputEntryPoints || [];
    ordered.entryPoints.forEach(function(entryPoint) {
      if (entryPoints.indexOf(entryPoint) == -1)
        entryPoints.push(entryPoint);
    });
    modules = ordered.modules.filter(function(moduleName) {
      var load = tree[moduleName];
      if (load.runtimePlugin && compileOpts.static)
        throw new TypeError('Plugin ' + load.plugin + ' does not support static builds, compiling ' + load.name + '.');
      return load && !load.conditional && !load.runtimePlugin;
    });
    if (compileOpts.encodeNames)
      entryPoints = entryPoints.map(function(name) {
        return getEncoding(name, cache.encodings, loader);
      });
  }).then(function() {
    return Promise.all(modules.map(function(name) {
      return Promise.resolve().then(function() {
        var load = tree[name];
        if (load === true)
          throw new TypeError(name + ' was defined via a bundle, so can only be used for subtraction or union operations.');
        return compileLoad(loader, tree[name], compileOpts, cache);
      });
    }));
  }).then(function(compiled) {
    outputs = outputs.concat(compiled);
  }).then(function() {
    var pluginLoads = [];
    modules.forEach(function(name) {
      var load = tree[name];
      pluginLoads.push(load);
      if (load.compactedLoads)
        load.compactedLoads.forEach(function(load) {
          pluginLoads.push(load);
        });
    });
    return pluginBundleHook(loader, pluginLoads, compileOpts, outputOpts);
  }).then(function(pluginResults) {
    outputs = outputs.concat(pluginResults.outputs);
    var assetList = pluginResults.assetList;
    return Promise.resolve().then(function() {
      if (modules.some(function(name) {
        return tree[name].metadata.format == 'amd';
      }) && !compileOpts.static)
        outputs.unshift('"bundle";');
      if (compileOpts.static)
        return wrapSFXOutputs(loader, tree, modules, outputs, entryPoints, compileOpts, cache);
      return outputs;
    }).then(function(outputs) {
      return {
        outputs: outputs,
        entryPoints: entryPoints,
        assetList: assetList,
        modules: modules.reverse()
      };
    });
  });
}
exports.wrapSFXOutputs = wrapSFXOutputs;
function wrapSFXOutputs(loader, tree, modules, outputs, entryPoints, compileOpts, cache) {
  var compilers = {};
  if (compileOpts.format == 'es6')
    compileOpts.format = 'esm';
  var externalDeps = [];
  var allRegister = true;
  Object.keys(tree).forEach(function(module) {
    if (tree[module] === false && !loader.has(module))
      externalDeps.push(module);
  });
  externalDeps.sort();
  var legacyTranspiler = false;
  modules.forEach(function(name) {
    if (!legacyTranspiler && tree[name].metadata.originalSource)
      legacyTranspiler = true;
    if (tree[name].metadata.format != 'esm' && tree[name].metadata.format != 'register')
      allRegister = false;
    compilers[tree[name].metadata.format] = true;
  });
  Object.keys(compilerMap).forEach(function(format) {
    if (!compilers[format])
      return;
    var compiler = require(compilerMap[format]);
    if (compiler.sfx)
      outputs.unshift(compiler.sfx(loader));
  });
  var globalDeps = [];
  modules.forEach(function(name) {
    var load = tree[name];
    load.deps.forEach(function(dep) {
      var key = load.depMap[dep];
      if (!(key in tree) && !loader.has(key)) {
        if (compileOpts.format == 'esm')
          throw new TypeError('ESM static builds with externals only work when all modules in the build are ESM.');
        if (externalDeps.indexOf(key) == -1)
          externalDeps.push(key);
      }
    });
  });
  var externalDepIds = externalDeps.map(function(dep) {
    if (compileOpts.format == 'global' || compileOpts.format == 'umd' && (compileOpts.globalName || Object.keys(compileOpts.globalDeps).length > 0)) {
      var alias = getAlias(loader, dep);
      var globalDep = compileOpts.globalDeps[dep] || compileOpts.globalDeps[alias];
      if (!globalDep)
        throw new TypeError('Global SFX bundle dependency "' + alias + '" must be configured to an environment global via the globalDeps option.');
      globalDeps.push(globalDep);
    }
    var entryPointIndex = entryPoints.indexOf(dep);
    if (entryPointIndex != -1)
      entryPoints.splice(entryPointIndex, 1);
    if (compileOpts.encodeNames)
      return getEncoding(dep, cache.encodings, loader);
    else
      return dep;
  });
  return asp(fs.readFile)(path.resolve(__dirname, (allRegister ? '../templates/sfx-core-register.min.js' : '../templates/sfx-core.min.js'))).then(function(sfxcore) {
    outputs.unshift("var require = this.require, exports = this.exports, module = this.module;");
    var exportDefault = compileOpts.exportDefault;
    var exportedLoad = tree[compileOpts.encodeNames && getName(entryPoints[0], cache.encodings) || entryPoints[0]];
    if (exportedLoad && exportedLoad.metadata.format != 'register' && exportedLoad.metadata.format != 'esm')
      exportDefault = true;
    outputs.unshift(sfxcore.toString(), "(" + JSON.stringify(entryPoints) + ", " + JSON.stringify(externalDepIds) + ", " + (exportDefault ? "true" : "false") + ", function(" + compileOpts.systemGlobal + ") {");
    outputs.push("})");
    return asp(fs.readFile)(path.resolve(__dirname, '../templates/sfx-' + compileOpts.format + '.js'));
  }).then(function(formatWrapper) {
    outputs.push(template(formatWrapper.toString(), {
      deps: externalDeps.map(function(dep) {
        if (dep.indexOf('#:') != -1)
          dep = dep.replace('#:/', '/');
        var name = getAlias(loader, dep);
        return name;
      }),
      globalDeps: globalDeps,
      globalName: compileOpts.globalName
    }));
  }).then(function() {
    if (!legacyTranspiler)
      return;
    var usesBabelHelpersGlobal = modules.some(function(name) {
      return tree[name].metadata.usesBabelHelpersGlobal;
    });
    if (!usesBabelHelpersGlobal)
      usesBabelHelpersGlobal = modules.some(function(name) {
        return tree[name].metadata.format == 'esm' && cache.loads[name].output.source.match(/regeneratorRuntime/);
      });
    if (compileOpts.runtime && usesBabelHelpersGlobal)
      return getModuleSource(loader, 'babel/external-helpers').then(function(source) {
        outputs.unshift(source);
      });
  }).then(function() {
    if (!legacyTranspiler)
      return;
    var usesTraceurRuntimeGlobal = modules.some(function(name) {
      return tree[name].metadata.usesTraceurRuntimeGlobal;
    });
    if (compileOpts.runtime && usesTraceurRuntimeGlobal)
      return getModuleSource(loader, 'traceur-runtime').then(function(source) {
        outputs.unshift("(function(){ var curSystem = typeof System != 'undefined' ? System : undefined;\n" + source + "\nSystem = curSystem; })();");
      });
  }).then(function() {
    if (compileOpts.formatHint)
      outputs.unshift(getFormatHint(compileOpts));
  }).then(function() {
    return outputs;
  });
}
exports.attachCompilers = function(loader) {
  Object.keys(compilerMap).forEach(function(compiler) {
    var attach = require(compilerMap[compiler]).attach;
    if (attach)
      attach(loader);
  });
};
function getModuleSource(loader, module) {
  return loader.normalize(module).then(function(normalized) {
    return loader.locate({
      name: normalized,
      metadata: {}
    });
  }).then(function(address) {
    return loader.fetch({
      address: address,
      metadata: {}
    });
  }).then(function(fetched) {
    var redirection = fetched.toString().match(/^\s*module\.exports = require\(\"([^\"]+)\"\);\s*$/);
    if (redirection)
      return getModuleSource(loader, redirection[1]);
    return fetched;
  }).catch(function(err) {
    console.log('Unable to find helper module "' + module + '". Make sure it is configured in the builder.');
    throw err;
  });
}
