/* */ 
"format cjs";
(function(process) {
  (function(global) {
    function URLPolyfill(url, baseURL) {
      if (typeof url != 'string')
        throw new TypeError('URL must be a string');
      var m = String(url).replace(/^\s+|\s+$/g, "").match(/^([^:\/?#]+:)?(?:\/\/(?:([^:@\/?#]*)(?::([^:@\/?#]*))?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
      if (!m)
        throw new RangeError('Invalid URL format');
      var protocol = m[1] || "";
      var username = m[2] || "";
      var password = m[3] || "";
      var host = m[4] || "";
      var hostname = m[5] || "";
      var port = m[6] || "";
      var pathname = m[7] || "";
      var search = m[8] || "";
      var hash = m[9] || "";
      if (baseURL !== undefined) {
        var base = baseURL instanceof URLPolyfill ? baseURL : new URLPolyfill(baseURL);
        var flag = !protocol && !host && !username;
        if (flag && !pathname && !search)
          search = base.search;
        if (flag && pathname[0] !== "/")
          pathname = (pathname ? (((base.host || base.username) && !base.pathname ? "/" : "") + base.pathname.slice(0, base.pathname.lastIndexOf("/") + 1) + pathname) : base.pathname);
        var output = [];
        pathname.replace(/^(\.\.?(\/|$))+/, "").replace(/\/(\.(\/|$))+/g, "/").replace(/\/\.\.$/, "/../").replace(/\/?[^\/]*/g, function(p) {
          if (p === "/..")
            output.pop();
          else
            output.push(p);
        });
        pathname = output.join("").replace(/^\//, pathname[0] === "/" ? "/" : "");
        if (flag) {
          port = base.port;
          hostname = base.hostname;
          host = base.host;
          password = base.password;
          username = base.username;
        }
        if (!protocol)
          protocol = base.protocol;
      }
      if (protocol == 'file:')
        pathname = pathname.replace(/\\/g, '/');
      this.origin = host ? protocol + (protocol !== "" || host !== "" ? "//" : "") + host : "";
      this.href = protocol + (protocol && host || protocol == "file:" ? "//" : "") + (username !== "" ? username + (password !== "" ? ":" + password : "") + "@" : "") + host + pathname + search + hash;
      this.protocol = protocol;
      this.username = username;
      this.password = password;
      this.host = host;
      this.hostname = hostname;
      this.port = port;
      this.pathname = pathname;
      this.search = search;
      this.hash = hash;
    }
    global.URLPolyfill = URLPolyfill;
  })(typeof self != 'undefined' ? self : global);
  (function(__global) {
    var isWorker = typeof window == 'undefined' && typeof self != 'undefined' && typeof importScripts != 'undefined';
    var isBrowser = typeof window != 'undefined' && typeof document != 'undefined';
    var isWindows = typeof process != 'undefined' && typeof process.platform != 'undefined' && !!process.platform.match(/^win/);
    if (!__global.console)
      __global.console = {assert: function() {}};
    var indexOf = Array.prototype.indexOf || function(item) {
      for (var i = 0,
          thisLen = this.length; i < thisLen; i++) {
        if (this[i] === item) {
          return i;
        }
      }
      return -1;
    };
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
    var errArgs = new Error(0, '_').fileName == '_';
    function addToError(err, msg) {
      if (!err.originalErr) {
        var stack = ((err.message || err) + (err.stack ? '\n' + err.stack : '')).toString().split('\n');
        var newStack = [];
        for (var i = 0; i < stack.length; i++) {
          if (typeof $__curScript == 'undefined' || stack[i].indexOf($__curScript.src) == -1)
            newStack.push(stack[i]);
        }
      }
      var newMsg = '(SystemJS) ' + (newStack ? newStack.join('\n\t') : err.message.substr(11)) + '\n\t' + msg;
      if (!isBrowser)
        newMsg = newMsg.replace(isWindows ? /file:\/\/\//g : /file:\/\//g, '');
      var newErr = errArgs ? new Error(newMsg, err.fileName, err.lineNumber) : new Error(newMsg);
      if (!isBrowser)
        newErr.stack = newMsg;
      else
        newErr.stack = null;
      newErr.originalErr = err.originalErr || err;
      return newErr;
    }
    function __eval(source, debugName, context) {
      try {
        new Function(source).call(context);
      } catch (e) {
        throw addToError(e, 'Evaluating ' + debugName);
      }
    }
    var baseURI;
    if (typeof document != 'undefined' && document.getElementsByTagName) {
      baseURI = document.baseURI;
      if (!baseURI) {
        var bases = document.getElementsByTagName('base');
        baseURI = bases[0] && bases[0].href || window.location.href;
      }
    } else if (typeof location != 'undefined') {
      baseURI = __global.location.href;
    }
    if (baseURI) {
      baseURI = baseURI.split('#')[0].split('?')[0];
      baseURI = baseURI.substr(0, baseURI.lastIndexOf('/') + 1);
    } else if (typeof process != 'undefined' && process.cwd) {
      baseURI = 'file://' + (isWindows ? '/' : '') + process.cwd() + '/';
      if (isWindows)
        baseURI = baseURI.replace(/\\/g, '/');
    } else {
      throw new TypeError('No environment baseURI');
    }
    try {
      var nativeURL = new __global.URL('test:///').protocol == 'test:';
    } catch (e) {}
    var URL = nativeURL ? __global.URL : __global.URLPolyfill;
    function Module() {}
    defineProperty(Module.prototype, 'toString', {value: function() {
        return 'Module';
      }});
    function Loader(options) {
      this._loader = {
        loaderObj: this,
        loads: [],
        modules: {},
        importPromises: {},
        moduleRecords: {}
      };
      defineProperty(this, 'global', {get: function() {
          return __global;
        }});
    }
    (function() {
      function createLoaderLoad(object) {
        return {
          modules: {},
          loads: [],
          loaderObj: object
        };
      }
      var anonCnt = 0;
      function createLoad(name) {
        return {
          status: 'loading',
          name: name || '<Anonymous' + ++anonCnt + '>',
          linkSets: [],
          dependencies: [],
          metadata: {}
        };
      }
      function loadModule(loader, name, options) {
        return new Promise(asyncStartLoadPartwayThrough({
          step: options.address ? 'fetch' : 'locate',
          loader: loader,
          moduleName: name,
          moduleMetadata: options && options.metadata || {},
          moduleSource: options.source,
          moduleAddress: options.address
        }));
      }
      function requestLoad(loader, request, refererName, refererAddress) {
        return new Promise(function(resolve, reject) {
          resolve(loader.loaderObj.normalize(request, refererName, refererAddress));
        }).then(function(name) {
          var load;
          if (loader.modules[name]) {
            load = createLoad(name);
            load.status = 'linked';
            load.module = loader.modules[name];
            return load;
          }
          for (var i = 0,
              l = loader.loads.length; i < l; i++) {
            load = loader.loads[i];
            if (load.name != name)
              continue;
            return load;
          }
          load = createLoad(name);
          loader.loads.push(load);
          proceedToLocate(loader, load);
          return load;
        });
      }
      function proceedToLocate(loader, load) {
        proceedToFetch(loader, load, Promise.resolve().then(function() {
          return loader.loaderObj.locate({
            name: load.name,
            metadata: load.metadata
          });
        }));
      }
      function proceedToFetch(loader, load, p) {
        proceedToTranslate(loader, load, p.then(function(address) {
          if (load.status != 'loading')
            return;
          load.address = address;
          return loader.loaderObj.fetch({
            name: load.name,
            metadata: load.metadata,
            address: address
          });
        }));
      }
      function proceedToTranslate(loader, load, p) {
        p.then(function(source) {
          if (load.status != 'loading')
            return;
          load.address = load.address || load.name;
          return Promise.resolve(loader.loaderObj.translate({
            name: load.name,
            metadata: load.metadata,
            address: load.address,
            source: source
          })).then(function(source) {
            load.source = source;
            return loader.loaderObj.instantiate({
              name: load.name,
              metadata: load.metadata,
              address: load.address,
              source: source
            });
          }).then(function(instantiateResult) {
            if (instantiateResult === undefined)
              throw new TypeError('Declarative modules unsupported in the polyfill.');
            if (typeof instantiateResult != 'object')
              throw new TypeError('Invalid instantiate return value');
            load.depsList = instantiateResult.deps || [];
            load.execute = instantiateResult.execute;
          }).then(function() {
            load.dependencies = [];
            var depsList = load.depsList;
            var loadPromises = [];
            for (var i = 0,
                l = depsList.length; i < l; i++)
              (function(request, index) {
                loadPromises.push(requestLoad(loader, request, load.name, load.address).then(function(depLoad) {
                  load.dependencies[index] = {
                    key: request,
                    value: depLoad.name
                  };
                  if (depLoad.status != 'linked') {
                    var linkSets = load.linkSets.concat([]);
                    for (var i = 0,
                        l = linkSets.length; i < l; i++)
                      addLoadToLinkSet(linkSets[i], depLoad);
                  }
                }));
              })(depsList[i], i);
            return Promise.all(loadPromises);
          }).then(function() {
            console.assert(load.status == 'loading', 'is loading');
            load.status = 'loaded';
            var linkSets = load.linkSets.concat([]);
            for (var i = 0,
                l = linkSets.length; i < l; i++)
              updateLinkSetOnLoad(linkSets[i], load);
          });
        })['catch'](function(exc) {
          load.status = 'failed';
          load.exception = exc;
          var linkSets = load.linkSets.concat([]);
          for (var i = 0,
              l = linkSets.length; i < l; i++) {
            linkSetFailed(linkSets[i], load, exc);
          }
          console.assert(load.linkSets.length == 0, 'linkSets not removed');
        });
      }
      function asyncStartLoadPartwayThrough(stepState) {
        return function(resolve, reject) {
          var loader = stepState.loader;
          var name = stepState.moduleName;
          var step = stepState.step;
          if (loader.modules[name])
            throw new TypeError('"' + name + '" already exists in the module table');
          var existingLoad;
          for (var i = 0,
              l = loader.loads.length; i < l; i++) {
            if (loader.loads[i].name == name) {
              existingLoad = loader.loads[i];
              if (step == 'translate' && !existingLoad.source) {
                existingLoad.address = stepState.moduleAddress;
                proceedToTranslate(loader, existingLoad, Promise.resolve(stepState.moduleSource));
              }
              if (existingLoad.linkSets.length && existingLoad.linkSets[0].loads[0].name == existingLoad.name)
                return existingLoad.linkSets[0].done.then(function() {
                  resolve(existingLoad);
                });
            }
          }
          var load = existingLoad || createLoad(name);
          load.metadata = stepState.moduleMetadata;
          var linkSet = createLinkSet(loader, load);
          loader.loads.push(load);
          resolve(linkSet.done);
          if (step == 'locate')
            proceedToLocate(loader, load);
          else if (step == 'fetch')
            proceedToFetch(loader, load, Promise.resolve(stepState.moduleAddress));
          else {
            console.assert(step == 'translate', 'translate step');
            load.address = stepState.moduleAddress;
            proceedToTranslate(loader, load, Promise.resolve(stepState.moduleSource));
          }
        };
      }
      function createLinkSet(loader, startingLoad) {
        var linkSet = {
          loader: loader,
          loads: [],
          startingLoad: startingLoad,
          loadingCount: 0
        };
        linkSet.done = new Promise(function(resolve, reject) {
          linkSet.resolve = resolve;
          linkSet.reject = reject;
        });
        addLoadToLinkSet(linkSet, startingLoad);
        return linkSet;
      }
      function addLoadToLinkSet(linkSet, load) {
        if (load.status == 'failed')
          return;
        for (var i = 0,
            l = linkSet.loads.length; i < l; i++)
          if (linkSet.loads[i] == load)
            return;
        linkSet.loads.push(load);
        load.linkSets.push(linkSet);
        if (load.status != 'loaded') {
          linkSet.loadingCount++;
        }
        var loader = linkSet.loader;
        for (var i = 0,
            l = load.dependencies.length; i < l; i++) {
          if (!load.dependencies[i])
            continue;
          var name = load.dependencies[i].value;
          if (loader.modules[name])
            continue;
          for (var j = 0,
              d = loader.loads.length; j < d; j++) {
            if (loader.loads[j].name != name)
              continue;
            addLoadToLinkSet(linkSet, loader.loads[j]);
            break;
          }
        }
      }
      function doLink(linkSet) {
        var error = false;
        try {
          link(linkSet, function(load, exc) {
            linkSetFailed(linkSet, load, exc);
            error = true;
          });
        } catch (e) {
          linkSetFailed(linkSet, null, e);
          error = true;
        }
        return error;
      }
      function updateLinkSetOnLoad(linkSet, load) {
        console.assert(load.status == 'loaded' || load.status == 'linked', 'loaded or linked');
        linkSet.loadingCount--;
        if (linkSet.loadingCount > 0)
          return;
        var startingLoad = linkSet.startingLoad;
        if (linkSet.loader.loaderObj.execute === false) {
          var loads = [].concat(linkSet.loads);
          for (var i = 0,
              l = loads.length; i < l; i++) {
            var load = loads[i];
            load.module = {
              name: load.name,
              module: _newModule({}),
              evaluated: true
            };
            load.status = 'linked';
            finishLoad(linkSet.loader, load);
          }
          return linkSet.resolve(startingLoad);
        }
        var abrupt = doLink(linkSet);
        if (abrupt)
          return;
        console.assert(linkSet.loads.length == 0, 'loads cleared');
        linkSet.resolve(startingLoad);
      }
      function linkSetFailed(linkSet, load, exc) {
        var loader = linkSet.loader;
        var requests;
        checkError: if (load) {
          if (linkSet.loads[0].name == load.name) {
            exc = addToError(exc, 'Error loading ' + load.name);
          } else {
            for (var i = 0; i < linkSet.loads.length; i++) {
              var pLoad = linkSet.loads[i];
              for (var j = 0; j < pLoad.dependencies.length; j++) {
                var dep = pLoad.dependencies[j];
                if (dep.value == load.name) {
                  exc = addToError(exc, 'Error loading ' + load.name + ' as "' + dep.key + '" from ' + pLoad.name);
                  break checkError;
                }
              }
            }
            exc = addToError(exc, 'Error loading ' + load.name + ' from ' + linkSet.loads[0].name);
          }
        } else {
          exc = addToError(exc, 'Error linking ' + linkSet.loads[0].name);
        }
        var loads = linkSet.loads.concat([]);
        for (var i = 0,
            l = loads.length; i < l; i++) {
          var load = loads[i];
          loader.loaderObj.failed = loader.loaderObj.failed || [];
          if (indexOf.call(loader.loaderObj.failed, load) == -1)
            loader.loaderObj.failed.push(load);
          var linkIndex = indexOf.call(load.linkSets, linkSet);
          console.assert(linkIndex != -1, 'link not present');
          load.linkSets.splice(linkIndex, 1);
          if (load.linkSets.length == 0) {
            var globalLoadsIndex = indexOf.call(linkSet.loader.loads, load);
            if (globalLoadsIndex != -1)
              linkSet.loader.loads.splice(globalLoadsIndex, 1);
          }
        }
        linkSet.reject(exc);
      }
      function finishLoad(loader, load) {
        if (loader.loaderObj.trace) {
          if (!loader.loaderObj.loads)
            loader.loaderObj.loads = {};
          var depMap = {};
          load.dependencies.forEach(function(dep) {
            depMap[dep.key] = dep.value;
          });
          loader.loaderObj.loads[load.name] = {
            name: load.name,
            deps: load.dependencies.map(function(dep) {
              return dep.key;
            }),
            depMap: depMap,
            address: load.address,
            metadata: load.metadata,
            source: load.source
          };
        }
        if (load.name) {
          console.assert(!loader.modules[load.name] || loader.modules[load.name].module === load.module.module, 'load not in module table');
          loader.modules[load.name] = load.module;
        }
        var loadIndex = indexOf.call(loader.loads, load);
        if (loadIndex != -1)
          loader.loads.splice(loadIndex, 1);
        for (var i = 0,
            l = load.linkSets.length; i < l; i++) {
          loadIndex = indexOf.call(load.linkSets[i].loads, load);
          if (loadIndex != -1)
            load.linkSets[i].loads.splice(loadIndex, 1);
        }
        load.linkSets.splice(0, load.linkSets.length);
      }
      function doDynamicExecute(linkSet, load, linkError) {
        try {
          var module = load.execute();
        } catch (e) {
          linkError(load, e);
          return;
        }
        if (!module || !(module instanceof Module))
          linkError(load, new TypeError('Execution must define a Module instance'));
        else
          return module;
      }
      function createImportPromise(loader, name, promise) {
        var importPromises = loader._loader.importPromises;
        return importPromises[name] = promise.then(function(m) {
          importPromises[name] = undefined;
          return m;
        }, function(e) {
          importPromises[name] = undefined;
          throw e;
        });
      }
      Loader.prototype = {
        constructor: Loader,
        define: function(name, source, options) {
          if (this._loader.importPromises[name])
            throw new TypeError('Module is already loading.');
          return createImportPromise(this, name, new Promise(asyncStartLoadPartwayThrough({
            step: 'translate',
            loader: this._loader,
            moduleName: name,
            moduleMetadata: options && options.metadata || {},
            moduleSource: source,
            moduleAddress: options && options.address
          })));
        },
        'delete': function(name) {
          var loader = this._loader;
          delete loader.importPromises[name];
          delete loader.moduleRecords[name];
          return loader.modules[name] ? delete loader.modules[name] : false;
        },
        get: function(key) {
          if (!this._loader.modules[key])
            return;
          return this._loader.modules[key].module;
        },
        has: function(name) {
          return !!this._loader.modules[name];
        },
        'import': function(name, parentName, parentAddress) {
          if (typeof parentName == 'object')
            parentName = parentName.name;
          var loaderObj = this;
          return Promise.resolve(loaderObj.normalize(name, parentName)).then(function(name) {
            var loader = loaderObj._loader;
            if (loader.modules[name])
              return loader.modules[name].module;
            return loader.importPromises[name] || createImportPromise(loaderObj, name, loadModule(loader, name, {}).then(function(load) {
              delete loader.importPromises[name];
              return load.module.module;
            }));
          });
        },
        load: function(name) {
          var loader = this._loader;
          if (loader.modules[name])
            return Promise.resolve();
          return loader.importPromises[name] || createImportPromise(this, name, new Promise(asyncStartLoadPartwayThrough({
            step: 'locate',
            loader: loader,
            moduleName: name,
            moduleMetadata: {},
            moduleSource: undefined,
            moduleAddress: undefined
          })).then(function() {
            delete loader.importPromises[name];
          }));
        },
        module: function(source, options) {
          var load = createLoad();
          load.address = options && options.address;
          var linkSet = createLinkSet(this._loader, load);
          var sourcePromise = Promise.resolve(source);
          var loader = this._loader;
          var p = linkSet.done.then(function() {
            return load.module.module;
          });
          proceedToTranslate(loader, load, sourcePromise);
          return p;
        },
        newModule: function(obj) {
          if (typeof obj != 'object')
            throw new TypeError('Expected object');
          var m = new Module();
          var pNames = [];
          if (Object.getOwnPropertyNames && obj != null)
            pNames = Object.getOwnPropertyNames(obj);
          else
            for (var key in obj)
              pNames.push(key);
          for (var i = 0; i < pNames.length; i++)
            (function(key) {
              defineProperty(m, key, {
                configurable: false,
                enumerable: true,
                get: function() {
                  return obj[key];
                },
                set: function() {
                  throw new Error('Module exports cannot be changed externally.');
                }
              });
            })(pNames[i]);
          if (Object.freeze)
            Object.freeze(m);
          return m;
        },
        set: function(name, module) {
          if (!(module instanceof Module))
            throw new TypeError('Loader.set(' + name + ', module) must be a module');
          this._loader.modules[name] = {module: module};
        },
        normalize: function(name, referrerName, referrerAddress) {},
        locate: function(load) {
          return load.name;
        },
        fetch: function(load) {},
        translate: function(load) {
          return load.source;
        },
        instantiate: function(load) {}
      };
      var _newModule = Loader.prototype.newModule;
      function link(linkSet, linkError) {
        var loader = linkSet.loader;
        if (!linkSet.loads.length)
          return;
        var loads = linkSet.loads.concat([]);
        for (var i = 0; i < loads.length; i++) {
          var load = loads[i];
          var module = doDynamicExecute(linkSet, load, linkError);
          if (!module)
            return;
          load.module = {
            name: load.name,
            module: module
          };
          load.status = 'linked';
          finishLoad(loader, load);
        }
      }
    })();
    var System;
    function SystemJSLoader() {
      Loader.call(this);
      this.paths = {};
      this._loader.paths = {};
      systemJSConstructor.call(this);
    }
    function SystemProto() {}
    ;
    SystemProto.prototype = Loader.prototype;
    SystemJSLoader.prototype = new SystemProto();
    SystemJSLoader.prototype.constructor = SystemJSLoader;
    var systemJSConstructor;
    function hook(name, hook) {
      SystemJSLoader.prototype[name] = hook(SystemJSLoader.prototype[name] || function() {});
    }
    function hookConstructor(hook) {
      systemJSConstructor = hook(systemJSConstructor || function() {});
    }
    var absURLRegEx = /^[^\/]+:\/\//;
    function isAbsolute(name) {
      return name.match(absURLRegEx);
    }
    function isRel(name) {
      return (name[0] == '.' && (!name[1] || name[1] == '/' || name[1] == '.')) || name[0] == '/';
    }
    function isPlain(name) {
      return !isRel(name) && !isAbsolute(name);
    }
    var baseURIObj = new URL(baseURI);
    function urlResolve(name, parent) {
      if (name[0] == '.') {
        if (name[1] == '/' && name[2] != '.')
          return (parent && parent.substr(0, parent.lastIndexOf('/') + 1) || baseURI) + name.substr(2);
      } else if (name[0] != '/' && name.indexOf(':') == -1) {
        return (parent && parent.substr(0, parent.lastIndexOf('/') + 1) || baseURI) + name;
      }
      return new URL(name, parent && parent.replace(/#/g, '%05') || baseURIObj).href.replace(/%05/g, '#');
    }
    function applyPaths(loader, name) {
      var pathMatch = '',
          wildcard,
          maxWildcardPrefixLen = 0;
      var paths = loader.paths;
      var pathsCache = loader._loader.paths;
      for (var p in paths) {
        if (paths.hasOwnProperty && !paths.hasOwnProperty(p))
          continue;
        var path = paths[p];
        if (path !== pathsCache[p])
          path = paths[p] = pathsCache[p] = urlResolve(paths[p], isRel(paths[p]) ? baseURI : loader.baseURL);
        if (p.indexOf('*') === -1) {
          if (name == p)
            return paths[p];
          else if (name.substr(0, p.length - 1) == p.substr(0, p.length - 1) && (name.length < p.length || name[p.length - 1] == p[p.length - 1]) && (paths[p][paths[p].length - 1] == '/' || paths[p] == '')) {
            return paths[p].substr(0, paths[p].length - 1) + (name.length > p.length ? (paths[p] && '/' || '') + name.substr(p.length) : '');
          }
        } else {
          var pathParts = p.split('*');
          if (pathParts.length > 2)
            throw new TypeError('Only one wildcard in a path is permitted');
          var wildcardPrefixLen = pathParts[0].length;
          if (wildcardPrefixLen >= maxWildcardPrefixLen && name.substr(0, pathParts[0].length) == pathParts[0] && name.substr(name.length - pathParts[1].length) == pathParts[1]) {
            maxWildcardPrefixLen = wildcardPrefixLen;
            pathMatch = p;
            wildcard = name.substr(pathParts[0].length, name.length - pathParts[1].length - pathParts[0].length);
          }
        }
      }
      var outPath = paths[pathMatch];
      if (typeof wildcard == 'string')
        outPath = outPath.replace('*', wildcard);
      return outPath;
    }
    function dedupe(deps) {
      var newDeps = [];
      for (var i = 0,
          l = deps.length; i < l; i++)
        if (indexOf.call(newDeps, deps[i]) == -1)
          newDeps.push(deps[i]);
      return newDeps;
    }
    function group(deps) {
      var names = [];
      var indices = [];
      for (var i = 0,
          l = deps.length; i < l; i++) {
        var index = indexOf.call(names, deps[i]);
        if (index === -1) {
          names.push(deps[i]);
          indices.push([i]);
        } else {
          indices[index].push(i);
        }
      }
      return {
        names: names,
        indices: indices
      };
    }
    var getOwnPropertyDescriptor = true;
    try {
      Object.getOwnPropertyDescriptor({a: 0}, 'a');
    } catch (e) {
      getOwnPropertyDescriptor = false;
    }
    function getESModule(exports) {
      var esModule = {};
      if ((typeof exports == 'object' || typeof exports == 'function') && exports !== __global) {
        if (getOwnPropertyDescriptor) {
          for (var p in exports) {
            if (p === 'default')
              continue;
            defineOrCopyProperty(esModule, exports, p);
          }
        } else {
          extend(esModule, exports);
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
    function extend(a, b, prepend) {
      var hasOwnProperty = b && b.hasOwnProperty;
      for (var p in b) {
        if (hasOwnProperty && !b.hasOwnProperty(p))
          continue;
        if (!prepend || !(p in a))
          a[p] = b[p];
      }
      return a;
    }
    function extendMeta(a, b, prepend) {
      var hasOwnProperty = b && b.hasOwnProperty;
      for (var p in b) {
        if (hasOwnProperty && !b.hasOwnProperty(p))
          continue;
        var val = b[p];
        if (!(p in a))
          a[p] = val;
        else if (val instanceof Array && a[p] instanceof Array)
          a[p] = [].concat(prepend ? val : a[p]).concat(prepend ? a[p] : val);
        else if (typeof val == 'object' && val !== null && typeof a[p] == 'object')
          a[p] = extend(extend({}, a[p]), val, prepend);
        else if (!prepend)
          a[p] = val;
      }
    }
    function extendPkgConfig(pkgCfgA, pkgCfgB, pkgName, loader, warnInvalidProperties) {
      for (var prop in pkgCfgB) {
        if (indexOf.call(['main', 'format', 'defaultExtension', 'basePath'], prop) != -1) {
          pkgCfgA[prop] = pkgCfgB[prop];
        } else if (prop == 'map') {
          extend(pkgCfgA.map = pkgCfgA.map || {}, pkgCfgB.map);
        } else if (prop == 'meta') {
          extend(pkgCfgA.meta = pkgCfgA.meta || {}, pkgCfgB.meta);
        } else if (prop == 'depCache') {
          for (var d in pkgCfgB.depCache) {
            var dNormalized;
            if (d.substr(0, 2) == './')
              dNormalized = pkgName + '/' + d.substr(2);
            else
              dNormalized = coreResolve.call(loader, d);
            loader.depCache[dNormalized] = (loader.depCache[dNormalized] || []).concat(pkgCfgB.depCache[d]);
          }
        } else if (warnInvalidProperties && indexOf.call(['browserConfig', 'nodeConfig', 'devConfig', 'productionConfig'], prop) == -1 && (!pkgCfgB.hasOwnProperty || pkgCfgB.hasOwnProperty(prop))) {
          warn.call(loader, '"' + prop + '" is not a valid package configuration option in package ' + pkgName);
        }
      }
    }
    function setPkgConfig(loader, pkgName, cfg, prependConfig) {
      var pkg;
      if (!loader.packages[pkgName]) {
        pkg = loader.packages[pkgName] = cfg;
      } else {
        var basePkg = loader.packages[pkgName];
        pkg = loader.packages[pkgName] = {};
        extendPkgConfig(pkg, prependConfig ? cfg : basePkg, pkgName, loader, prependConfig);
        extendPkgConfig(pkg, prependConfig ? basePkg : cfg, pkgName, loader, !prependConfig);
      }
      if (typeof pkg.main == 'object') {
        pkg.map = pkg.map || {};
        pkg.map['./@main'] = pkg.main;
        pkg.main['default'] = pkg.main['default'] || './';
        pkg.main = '@main';
      }
      return pkg;
    }
    function warn(msg) {
      if (this.warnings && typeof console != 'undefined' && console.warn)
        console.warn(msg);
    }
    var absURLRegEx = /^([^\/]+:\/\/|\/)/;
    SystemJSLoader.prototype.normalize = function(name, parentName, parentAddress) {
      if (!name.match(absURLRegEx) && name[0] != '.')
        name = new URL(applyPaths(this, name) || name, baseURI).href;
      else
        name = new URL(name, parentName || baseURI).href;
      return name;
    };
    (function() {
      if (typeof document != 'undefined')
        var head = document.getElementsByTagName('head')[0];
      var curSystem;
      var curRequire;
      var workerLoad = null;
      var ieEvents = head && (function() {
        var s = document.createElement('script');
        var isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]';
        return s.attachEvent && !(s.attachEvent.toString && s.attachEvent.toString().indexOf('[native code') < 0) && !isOpera;
      })();
      var interactiveLoadingScripts = [];
      var interactiveScript;
      function getInteractiveScriptLoad() {
        if (interactiveScript && interactiveScript.script.readyState === 'interactive')
          return interactiveScript.load;
        for (var i = 0; i < interactiveLoadingScripts.length; i++)
          if (interactiveLoadingScripts[i].script.readyState == 'interactive') {
            interactiveScript = interactiveLoadingScripts[i];
            return interactiveScript.load;
          }
      }
      var loadingCnt = 0;
      var registerQueue = [];
      hook('pushRegister_', function(pushRegister) {
        return function(register) {
          if (pushRegister.call(this, register))
            return false;
          if (workerLoad)
            this.reduceRegister_(workerLoad, register);
          else if (ieEvents)
            this.reduceRegister_(getInteractiveScriptLoad(), register);
          else if (loadingCnt)
            registerQueue.push(register);
          else
            this.reduceRegister_(null, register);
          return true;
        };
      });
      function webWorkerImport(loader, load) {
        return new Promise(function(resolve, reject) {
          if (load.metadata.integrity)
            reject(new Error('Subresource integrity checking is not supported in web workers.'));
          workerLoad = load;
          try {
            importScripts(load.address);
          } catch (e) {
            workerLoad = null;
            reject(e);
          }
          workerLoad = null;
          if (!load.metadata.entry)
            reject(new Error(load.address + ' did not call System.register or AMD define. If loading a global, ensure the meta format is set to global.'));
          resolve('');
        });
      }
      hook('fetch', function(fetch) {
        return function(load) {
          var loader = this;
          if (load.metadata.format == 'json' || !load.metadata.scriptLoad || (!isBrowser && !isWorker))
            return fetch.call(this, load);
          if (isWorker)
            return webWorkerImport(loader, load);
          return new Promise(function(resolve, reject) {
            var s = document.createElement('script');
            s.async = true;
            if (load.metadata.crossOrigin)
              s.crossOrigin = load.metadata.crossOrigin;
            if (load.metadata.integrity)
              s.setAttribute('integrity', load.metadata.integrity);
            if (ieEvents) {
              s.attachEvent('onreadystatechange', complete);
              interactiveLoadingScripts.push({
                script: s,
                load: load
              });
            } else {
              s.addEventListener('load', complete, false);
              s.addEventListener('error', error, false);
            }
            loadingCnt++;
            curSystem = __global.System;
            curRequire = __global.require;
            s.src = load.address;
            head.appendChild(s);
            function complete(evt) {
              if (s.readyState && s.readyState != 'loaded' && s.readyState != 'complete')
                return;
              loadingCnt--;
              if (!load.metadata.entry && !registerQueue.length) {
                loader.reduceRegister_(load);
              } else if (!ieEvents) {
                for (var i = 0; i < registerQueue.length; i++)
                  loader.reduceRegister_(load, registerQueue[i]);
                registerQueue = [];
              }
              cleanup();
              if (!load.metadata.entry && !load.metadata.bundle)
                reject(new Error(load.name + ' did not call System.register or AMD define. If loading a global module configure the global name via the meta exports property for script injection support.'));
              resolve('');
            }
            function error(evt) {
              cleanup();
              reject(new Error('Unable to load script ' + load.address));
            }
            function cleanup() {
              __global.System = curSystem;
              __global.require = curRequire;
              if (s.detachEvent) {
                s.detachEvent('onreadystatechange', complete);
                for (var i = 0; i < interactiveLoadingScripts.length; i++)
                  if (interactiveLoadingScripts[i].script == s) {
                    if (interactiveScript && interactiveScript.script == s)
                      interactiveScript = null;
                    interactiveLoadingScripts.splice(i, 1);
                  }
              } else {
                s.removeEventListener('load', complete, false);
                s.removeEventListener('error', error, false);
              }
              head.removeChild(s);
            }
          });
        };
      });
    })();
    var leadingCommentAndMetaRegEx = /^(\s*\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)*\s*/;
    function detectRegisterFormat(source) {
      var leadingCommentAndMeta = source.match(leadingCommentAndMetaRegEx);
      return leadingCommentAndMeta && source.substr(leadingCommentAndMeta[0].length, 15) == 'System.register';
    }
    function createEntry() {
      return {
        name: null,
        deps: null,
        originalIndices: null,
        declare: null,
        execute: null,
        executingRequire: false,
        declarative: false,
        normalizedDeps: null,
        groupIndex: null,
        evaluated: false,
        module: null,
        esModule: null,
        esmExports: false
      };
    }
    (function() {
      SystemJSLoader.prototype.register = function(name, deps, declare) {
        if (typeof name != 'string') {
          declare = deps;
          deps = name;
          name = null;
        }
        if (typeof declare == 'boolean')
          return this.registerDynamic.apply(this, arguments);
        var entry = createEntry();
        entry.name = name && (this.decanonicalize || this.normalize).call(this, name);
        entry.declarative = true;
        entry.deps = deps;
        entry.declare = declare;
        this.pushRegister_({
          amd: false,
          entry: entry
        });
      };
      SystemJSLoader.prototype.registerDynamic = function(name, deps, declare, execute) {
        if (typeof name != 'string') {
          execute = declare;
          declare = deps;
          deps = name;
          name = null;
        }
        var entry = createEntry();
        entry.name = name && (this.decanonicalize || this.normalize).call(this, name);
        entry.deps = deps;
        entry.execute = execute;
        entry.executingRequire = declare;
        this.pushRegister_({
          amd: false,
          entry: entry
        });
      };
      hook('reduceRegister_', function() {
        return function(load, register) {
          if (!register)
            return;
          var entry = register.entry;
          var curMeta = load && load.metadata;
          if (entry.name) {
            if (!(entry.name in this.defined))
              this.defined[entry.name] = entry;
            if (curMeta)
              curMeta.bundle = true;
          }
          if (!entry.name || load && !curMeta.entry && entry.name == load.name) {
            if (!curMeta)
              throw new TypeError('Invalid System.register call. Anonymous System.register calls can only be made by modules loaded by SystemJS.import and not via script tags.');
            if (curMeta.entry) {
              if (curMeta.format == 'register')
                throw new Error('Multiple anonymous System.register calls in module ' + load.name + '. If loading a bundle, ensure all the System.register calls are named.');
              else
                throw new Error('Module ' + load.name + ' interpreted as ' + curMeta.format + ' module format, but called System.register.');
            }
            if (!curMeta.format)
              curMeta.format = 'register';
            curMeta.entry = entry;
          }
        };
      });
      hookConstructor(function(constructor) {
        return function() {
          constructor.call(this);
          this.defined = {};
          this._loader.moduleRecords = {};
        };
      });
      function buildGroups(entry, loader, groups) {
        groups[entry.groupIndex] = groups[entry.groupIndex] || [];
        if (indexOf.call(groups[entry.groupIndex], entry) != -1)
          return;
        groups[entry.groupIndex].push(entry);
        for (var i = 0,
            l = entry.normalizedDeps.length; i < l; i++) {
          var depName = entry.normalizedDeps[i];
          var depEntry = loader.defined[depName];
          if (!depEntry || depEntry.evaluated)
            continue;
          var depGroupIndex = entry.groupIndex + (depEntry.declarative != entry.declarative);
          if (depEntry.groupIndex === null || depEntry.groupIndex < depGroupIndex) {
            if (depEntry.groupIndex !== null) {
              groups[depEntry.groupIndex].splice(indexOf.call(groups[depEntry.groupIndex], depEntry), 1);
              if (groups[depEntry.groupIndex].length == 0)
                throw new Error("Mixed dependency cycle detected");
            }
            depEntry.groupIndex = depGroupIndex;
          }
          buildGroups(depEntry, loader, groups);
        }
      }
      function link(name, startEntry, loader) {
        if (startEntry.module)
          return;
        startEntry.groupIndex = 0;
        var groups = [];
        buildGroups(startEntry, loader, groups);
        var curGroupDeclarative = !!startEntry.declarative == groups.length % 2;
        for (var i = groups.length - 1; i >= 0; i--) {
          var group = groups[i];
          for (var j = 0; j < group.length; j++) {
            var entry = group[j];
            if (curGroupDeclarative)
              linkDeclarativeModule(entry, loader);
            else
              linkDynamicModule(entry, loader);
          }
          curGroupDeclarative = !curGroupDeclarative;
        }
      }
      function ModuleRecord() {}
      defineProperty(ModuleRecord, 'toString', {value: function() {
          return 'Module';
        }});
      function getOrCreateModuleRecord(name, moduleRecords) {
        return moduleRecords[name] || (moduleRecords[name] = {
          name: name,
          dependencies: [],
          exports: new ModuleRecord(),
          importers: []
        });
      }
      function linkDeclarativeModule(entry, loader) {
        if (entry.module)
          return;
        var moduleRecords = loader._loader.moduleRecords;
        var module = entry.module = getOrCreateModuleRecord(entry.name, moduleRecords);
        var exports = entry.module.exports;
        var declaration = entry.declare.call(__global, function(name, value) {
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
              var importerIndex = indexOf.call(importerModule.dependencies, module);
              var setter = importerModule.setters[importerIndex];
              if (setter)
                setter(exports);
            }
          }
          module.locked = false;
          return value;
        }, {id: entry.name});
        declaration = declaration || {
          setters: [],
          execute: function() {}
        };
        module.setters = declaration.setters;
        module.execute = declaration.execute;
        if (!module.setters || !module.execute) {
          throw new TypeError('Invalid System.register form for ' + entry.name);
        }
        for (var i = 0,
            l = entry.normalizedDeps.length; i < l; i++) {
          var depName = entry.normalizedDeps[i];
          var depEntry = loader.defined[depName];
          var depModule = moduleRecords[depName];
          var depExports;
          if (depModule) {
            depExports = depModule.exports;
          } else if (depEntry && !depEntry.declarative) {
            depExports = depEntry.esModule;
          } else if (!depEntry) {
            depExports = loader.get(depName);
          } else {
            linkDeclarativeModule(depEntry, loader);
            depModule = depEntry.module;
            depExports = depModule.exports;
          }
          if (depModule && depModule.importers) {
            depModule.importers.push(module);
            module.dependencies.push(depModule);
          } else {
            module.dependencies.push(null);
          }
          var originalIndices = entry.originalIndices[i];
          for (var j = 0,
              len = originalIndices.length; j < len; ++j) {
            var index = originalIndices[j];
            if (module.setters[index]) {
              module.setters[index](depExports);
            }
          }
        }
      }
      function getModule(name, loader) {
        var exports;
        var entry = loader.defined[name];
        if (!entry) {
          exports = loader.get(name);
          if (!exports)
            throw new Error('Unable to load dependency ' + name + '.');
        } else {
          if (entry.declarative)
            ensureEvaluated(name, entry, [], loader);
          else if (!entry.evaluated)
            linkDynamicModule(entry, loader);
          exports = entry.module.exports;
        }
        if ((!entry || entry.declarative) && exports && exports.__useDefault)
          return exports['default'];
        return exports;
      }
      function linkDynamicModule(entry, loader) {
        if (entry.module)
          return;
        var exports = {};
        var module = entry.module = {
          exports: exports,
          id: entry.name
        };
        if (!entry.executingRequire) {
          for (var i = 0,
              l = entry.normalizedDeps.length; i < l; i++) {
            var depName = entry.normalizedDeps[i];
            var depEntry = loader.defined[depName];
            if (depEntry)
              linkDynamicModule(depEntry, loader);
          }
        }
        entry.evaluated = true;
        var output = entry.execute.call(__global, function(name) {
          for (var i = 0,
              l = entry.deps.length; i < l; i++) {
            if (entry.deps[i] != name)
              continue;
            return getModule(entry.normalizedDeps[i], loader);
          }
          var nameNormalized = loader.normalizeSync(name, entry.name);
          if (indexOf.call(entry.normalizedDeps, nameNormalized) != -1)
            return getModule(nameNormalized, loader);
          throw new Error('Module ' + name + ' not declared as a dependency of ' + entry.name);
        }, exports, module);
        if (output)
          module.exports = output;
        exports = module.exports;
        if (exports && (exports.__esModule || exports instanceof Module))
          entry.esModule = loader.newModule(exports);
        else if (entry.esmExports && exports !== __global)
          entry.esModule = loader.newModule(getESModule(exports));
        else
          entry.esModule = loader.newModule({'default': exports});
      }
      function ensureEvaluated(moduleName, entry, seen, loader) {
        if (!entry || entry.evaluated || !entry.declarative)
          return;
        seen.push(moduleName);
        for (var i = 0,
            l = entry.normalizedDeps.length; i < l; i++) {
          var depName = entry.normalizedDeps[i];
          if (indexOf.call(seen, depName) == -1) {
            if (!loader.defined[depName])
              loader.get(depName);
            else
              ensureEvaluated(depName, loader.defined[depName], seen, loader);
          }
        }
        if (entry.evaluated)
          return;
        entry.evaluated = true;
        entry.module.execute.call(__global);
      }
      hook('delete', function(del) {
        return function(name) {
          delete this._loader.moduleRecords[name];
          delete this.defined[name];
          return del.call(this, name);
        };
      });
      hook('fetch', function(fetch) {
        return function(load) {
          if (this.defined[load.name]) {
            load.metadata.format = 'defined';
            return '';
          }
          load.metadata.deps = load.metadata.deps || [];
          return fetch.call(this, load);
        };
      });
      hook('translate', function(translate) {
        return function(load) {
          load.metadata.deps = load.metadata.deps || [];
          return Promise.resolve(translate.apply(this, arguments)).then(function(source) {
            if (load.metadata.format == 'register' || !load.metadata.format && detectRegisterFormat(load.source))
              load.metadata.format = 'register';
            return source;
          });
        };
      });
      hook('load', function(doLoad) {
        return function(normalized) {
          var loader = this;
          var entry = loader.defined[normalized];
          if (!entry || entry.deps.length)
            return doLoad.apply(this, arguments);
          entry.originalIndices = entry.normalizedDeps = [];
          link(normalized, entry, loader);
          ensureEvaluated(normalized, entry, [], loader);
          if (!entry.esModule)
            entry.esModule = loader.newModule(entry.module.exports);
          if (!loader.trace)
            loader.defined[normalized] = undefined;
          loader.set(normalized, entry.esModule);
          return Promise.resolve();
        };
      });
      hook('instantiate', function(instantiate) {
        return function(load) {
          if (load.metadata.format == 'detect')
            load.metadata.format = undefined;
          instantiate.call(this, load);
          var loader = this;
          var entry;
          if (loader.defined[load.name]) {
            entry = loader.defined[load.name];
            if (!entry.declarative)
              entry.deps = entry.deps.concat(load.metadata.deps);
            entry.deps = entry.deps.concat(load.metadata.deps);
          } else if (load.metadata.entry) {
            entry = load.metadata.entry;
            entry.deps = entry.deps.concat(load.metadata.deps);
          } else if (!(loader.builder && load.metadata.bundle) && (load.metadata.format == 'register' || load.metadata.format == 'esm' || load.metadata.format == 'es6')) {
            if (typeof __exec != 'undefined')
              __exec.call(loader, load);
            if (!load.metadata.entry && !load.metadata.bundle)
              throw new Error(load.name + ' detected as ' + load.metadata.format + ' but didn\'t execute.');
            entry = load.metadata.entry;
            if (entry && load.metadata.deps)
              entry.deps = entry.deps.concat(load.metadata.deps);
          }
          if (!entry) {
            entry = createEntry();
            entry.deps = load.metadata.deps;
            entry.execute = function() {};
          }
          loader.defined[load.name] = entry;
          var grouped = group(entry.deps);
          entry.deps = grouped.names;
          entry.originalIndices = grouped.indices;
          entry.name = load.name;
          entry.esmExports = load.metadata.esmExports !== false;
          var normalizePromises = [];
          for (var i = 0,
              l = entry.deps.length; i < l; i++)
            normalizePromises.push(Promise.resolve(loader.normalize(entry.deps[i], load.name)));
          return Promise.all(normalizePromises).then(function(normalizedDeps) {
            entry.normalizedDeps = normalizedDeps;
            return {
              deps: entry.deps,
              execute: function() {
                link(load.name, entry, loader);
                ensureEvaluated(load.name, entry, [], loader);
                if (!entry.esModule)
                  entry.esModule = loader.newModule(entry.module.exports);
                if (!loader.trace)
                  loader.defined[load.name] = undefined;
                return entry.esModule;
              }
            };
          });
        };
      });
    })();
    (function() {
      hookConstructor(function(constructor) {
        return function() {
          constructor.call(this);
          this.bundles = {};
          this._loader.loadedBundles = {};
        };
      });
      hook('locate', function(locate) {
        return function(load) {
          var loader = this;
          var matched = false;
          if (!(load.name in loader.defined))
            for (var b in loader.bundles) {
              for (var i = 0; i < loader.bundles[b].length; i++) {
                var curModule = loader.bundles[b][i];
                if (curModule == load.name) {
                  matched = true;
                  break;
                }
                if (curModule.indexOf('*') != -1) {
                  var parts = curModule.split('*');
                  if (parts.length != 2) {
                    loader.bundles[b].splice(i--, 1);
                    continue;
                  }
                  if (load.name.substring(0, parts[0].length) == parts[0] && load.name.substr(load.name.length - parts[1].length, parts[1].length) == parts[1] && load.name.substr(parts[0].length, load.name.length - parts[1].length - parts[0].length).indexOf('/') == -1) {
                    matched = true;
                    break;
                  }
                }
              }
              if (matched)
                return loader['import'](b).then(function() {
                  return locate.call(loader, load);
                });
            }
          return locate.call(loader, load);
        };
      });
    })();
    hookConstructor(function(constructor) {
      return function() {
        constructor.apply(this, arguments);
        __global.define = this.amdDefine;
      };
    });
    hook('fetch', function(fetch) {
      return function(load) {
        load.metadata.scriptLoad = true;
        return fetch.call(this, load);
      };
    });
    System = new SystemJSLoader();
    __global.SystemJS = System;
    System.version = '0.19.35 Register Only';
    if (typeof module == 'object' && module.exports && typeof exports == 'object')
      module.exports = System;
    __global.System = System;
  })(typeof self != 'undefined' ? self : global);
})(require('process'));
