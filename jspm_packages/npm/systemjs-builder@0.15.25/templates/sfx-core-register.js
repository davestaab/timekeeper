/* */ 
(function(process) {
  (function(global) {
    var defined = {};
    var indexOf = Array.prototype.indexOf || function(item) {
      for (var i = 0,
          l = this.length; i < l; i++)
        if (this[i] === item)
          return i;
      return -1;
    };
    var getOwnPropertyDescriptor = true;
    try {
      Object.getOwnPropertyDescriptor({a: 0}, 'a');
    } catch (e) {
      getOwnPropertyDescriptor = false;
    }
    var defineProperty;
    (function() {
      try {
        if (!!Object.defineProperty({}, 'a', {}))
          defineProperty = Object.defineProperty;
      } catch (e) {
        defineProperty = function(obj, prop, opt) {
          try {
            obj[prop] = opt.value || opt.get.call(obj);
          } catch (e) {}
        };
      }
    })();
    function register(name, deps, declare) {
      if (!(name in defined))
        defined[name] = {
          name: name,
          declarative: true,
          deps: deps,
          declare: declare,
          normalizedDeps: deps
        };
    }
    var moduleRecords = {};
    function getOrCreateModuleRecord(name) {
      return moduleRecords[name] || (moduleRecords[name] = {
        name: name,
        dependencies: [],
        exports: {},
        importers: []
      });
    }
    function linkDeclarativeModule(entry) {
      if (entry.module)
        return;
      var module = entry.module = getOrCreateModuleRecord(entry.name);
      var exports = entry.module.exports;
      var declaration = entry.declare.call(global, function(name, value) {
        module.locked = true;
        if (typeof name == 'object') {
          for (var p in name)
            exports[p] = name[p];
        } else {
          exports[name] = value;
        }
        for (var i = 0,
            l = module.importers.length; i < l; i++) {
          var importerModule = module.importers[i];
          if (!importerModule.locked) {
            for (var j = 0; j < importerModule.dependencies.length; ++j) {
              if (importerModule.dependencies[j] === module) {
                importerModule.setters[j](exports);
              }
            }
          }
        }
        module.locked = false;
        return value;
      }, entry.name);
      module.setters = declaration.setters;
      module.execute = declaration.execute;
      for (var i = 0,
          l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = defined[depName];
        var depModule = moduleRecords[depName];
        var depExports;
        if (depModule) {
          depExports = depModule.exports;
        } else if (depEntry && !depEntry.declarative) {
          depExports = depEntry.esModule;
        } else if (!depEntry) {
          depExports = load(depName);
        } else {
          linkDeclarativeModule(depEntry);
          depModule = depEntry.module;
          depExports = depModule.exports;
        }
        if (depModule && depModule.importers) {
          depModule.importers.push(module);
          module.dependencies.push(depModule);
        } else
          module.dependencies.push(null);
        if (module.setters[i])
          module.setters[i](depExports);
      }
    }
    function getESModule(exports) {
      var esModule = {};
      if ((typeof exports == 'object' || typeof exports == 'function') && exports !== global) {
        if (getOwnPropertyDescriptor) {
          for (var p in exports) {
            if (p === 'default')
              continue;
            defineOrCopyProperty(esModule, exports, p);
          }
        } else {
          var hasOwnProperty = exports && exports.hasOwnProperty;
          for (var p in exports) {
            if (p === 'default' || (hasOwnProperty && !exports.hasOwnProperty(p)))
              continue;
            esModule[p] = exports[p];
          }
        }
      }
      esModule['default'] = exports;
      defineProperty(esModule, '__useDefault', {value: true});
      return esModule;
    }
    function defineOrCopyProperty(targetObj, sourceObj, propName) {
      try {
        var d;
        if (d = Object.getOwnPropertyDescriptor(sourceObj, propName))
          defineProperty(targetObj, propName, d);
      } catch (ex) {
        targetObj[propName] = sourceObj[propName];
        return false;
      }
    }
    function ensureEvaluated(moduleName, seen) {
      var entry = defined[moduleName];
      if (!entry || entry.evaluated || !entry.declarative)
        return;
      seen.push(moduleName);
      for (var i = 0,
          l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        if (indexOf.call(seen, depName) == -1) {
          if (!defined[depName])
            load(depName);
          else
            ensureEvaluated(depName, seen);
        }
      }
      if (entry.evaluated)
        return;
      entry.evaluated = true;
      entry.module.execute.call(global);
    }
    var nodeRequire = typeof System != 'undefined' && System._nodeRequire || typeof require != 'undefined' && require.resolve && typeof process != 'undefined' && require;
    var modules = {'@empty': {}};
    function load(name) {
      if (modules[name])
        return modules[name];
      if (name.substr(0, 6) == '@node/')
        return nodeRequire(name.substr(6));
      var entry = defined[name];
      if (!entry)
        throw "Module " + name + " not present.";
      linkDeclarativeModule(defined[name]);
      ensureEvaluated(name, []);
      defined[name] = undefined;
      if (entry.declarative)
        defineProperty(entry.module.exports, '__esModule', {value: true});
      return modules[name] = entry.declarative ? entry.module.exports : entry.esModule;
    }
    ;
    return function(mains, depNames, exportDefault, declare) {
      return function(formatDetect) {
        formatDetect(function(deps) {
          for (var i = 0; i < depNames.length; i++)
            (function(depName, dep) {
              if (dep && dep.__esModule)
                modules[depName] = dep;
              else
                modules[depName] = getESModule(dep);
            })(depNames[i], arguments[i]);
          declare({register: register});
          var firstLoad = load(mains[0]);
          if (mains.length > 1)
            for (var i = 1; i < mains.length; i++)
              load(mains[i]);
          if (exportDefault)
            return firstLoad['default'];
          else
            return firstLoad;
        });
      };
    };
  })(typeof self != 'undefined' ? self : global);
})(require('process'));
