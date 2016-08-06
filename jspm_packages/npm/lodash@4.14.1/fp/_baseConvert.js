/* */ 
var mapping = require('./_mapping'),
    mutateMap = mapping.mutate,
    fallbackHolder = require('./placeholder');
function baseArity(func, n) {
  return n == 2 ? function(a, b) {
    return func.apply(undefined, arguments);
  } : function(a) {
    return func.apply(undefined, arguments);
  };
}
function baseAry(func, n) {
  return n == 2 ? function(a, b) {
    return func(a, b);
  } : function(a) {
    return func(a);
  };
}
function cloneArray(array) {
  var length = array ? array.length : 0,
      result = Array(length);
  while (length--) {
    result[length] = array[length];
  }
  return result;
}
function createCloner(func) {
  return function(object) {
    return func({}, object);
  };
}
function wrapImmutable(func, cloner) {
  return function() {
    var length = arguments.length;
    if (!length) {
      return;
    }
    var args = Array(length);
    while (length--) {
      args[length] = arguments[length];
    }
    var result = args[0] = cloner.apply(undefined, args);
    func.apply(undefined, args);
    return result;
  };
}
function baseConvert(util, name, func, options) {
  var setPlaceholder,
      isLib = typeof name == 'function',
      isObj = name === Object(name);
  if (isObj) {
    options = func;
    func = name;
    name = undefined;
  }
  if (func == null) {
    throw new TypeError;
  }
  options || (options = {});
  var config = {
    'cap': 'cap' in options ? options.cap : true,
    'curry': 'curry' in options ? options.curry : true,
    'fixed': 'fixed' in options ? options.fixed : true,
    'immutable': 'immutable' in options ? options.immutable : true,
    'rearg': 'rearg' in options ? options.rearg : true
  };
  var forceCurry = ('curry' in options) && options.curry,
      forceFixed = ('fixed' in options) && options.fixed,
      forceRearg = ('rearg' in options) && options.rearg,
      placeholder = isLib ? func : fallbackHolder,
      pristine = isLib ? func.runInContext() : undefined;
  var helpers = isLib ? func : {
    'ary': util.ary,
    'assign': util.assign,
    'clone': util.clone,
    'curry': util.curry,
    'forEach': util.forEach,
    'isArray': util.isArray,
    'isFunction': util.isFunction,
    'iteratee': util.iteratee,
    'keys': util.keys,
    'rearg': util.rearg,
    'spread': util.spread,
    'toPath': util.toPath
  };
  var ary = helpers.ary,
      assign = helpers.assign,
      clone = helpers.clone,
      curry = helpers.curry,
      each = helpers.forEach,
      isArray = helpers.isArray,
      isFunction = helpers.isFunction,
      keys = helpers.keys,
      rearg = helpers.rearg,
      spread = helpers.spread,
      toPath = helpers.toPath;
  var aryMethodKeys = keys(mapping.aryMethod);
  var wrappers = {
    'castArray': function(castArray) {
      return function() {
        var value = arguments[0];
        return isArray(value) ? castArray(cloneArray(value)) : castArray.apply(undefined, arguments);
      };
    },
    'iteratee': function(iteratee) {
      return function() {
        var func = arguments[0],
            arity = arguments[1],
            result = iteratee(func, arity),
            length = result.length;
        if (config.cap && typeof arity == 'number') {
          arity = arity > 2 ? (arity - 2) : 1;
          return (length && length <= arity) ? result : baseAry(result, arity);
        }
        return result;
      };
    },
    'mixin': function(mixin) {
      return function(source) {
        var func = this;
        if (!isFunction(func)) {
          return mixin(func, Object(source));
        }
        var pairs = [];
        each(keys(source), function(key) {
          if (isFunction(source[key])) {
            pairs.push([key, func.prototype[key]]);
          }
        });
        mixin(func, Object(source));
        each(pairs, function(pair) {
          var value = pair[1];
          if (isFunction(value)) {
            func.prototype[pair[0]] = value;
          } else {
            delete func.prototype[pair[0]];
          }
        });
        return func;
      };
    },
    'rearg': function(rearg) {
      return function(func, indexes) {
        var n = indexes ? indexes.length : 0;
        return curry(rearg(func, indexes), n);
      };
    },
    'runInContext': function(runInContext) {
      return function(context) {
        return baseConvert(util, runInContext(context), options);
      };
    }
  };
  function castCap(name, func) {
    if (config.cap) {
      var indexes = mapping.iterateeRearg[name];
      if (indexes) {
        return iterateeRearg(func, indexes);
      }
      var n = !isLib && mapping.iterateeAry[name];
      if (n) {
        return iterateeAry(func, n);
      }
    }
    return func;
  }
  function castCurry(name, func, n) {
    return (forceCurry || (config.curry && n > 1)) ? curry(func, n) : func;
  }
  function castFixed(name, func, n) {
    if (config.fixed && (forceFixed || !mapping.skipFixed[name])) {
      var data = mapping.methodSpread[name],
          start = data && data.start;
      return start === undefined ? ary(func, n) : spread(func, start);
    }
    return func;
  }
  function castRearg(name, func, n) {
    return (config.rearg && n > 1 && (forceRearg || !mapping.skipRearg[name])) ? rearg(func, mapping.methodRearg[name] || mapping.aryRearg[n]) : func;
  }
  function cloneByPath(object, path) {
    path = toPath(path);
    var index = -1,
        length = path.length,
        lastIndex = length - 1,
        result = clone(Object(object)),
        nested = result;
    while (nested != null && ++index < length) {
      var key = path[index],
          value = nested[key];
      if (value != null) {
        nested[path[index]] = clone(index == lastIndex ? value : Object(value));
      }
      nested = nested[key];
    }
    return result;
  }
  function convertLib(options) {
    return _.runInContext.convert(options)(undefined);
  }
  function createConverter(name, func) {
    var oldOptions = options;
    return function(options) {
      var newUtil = isLib ? pristine : helpers,
          newFunc = isLib ? pristine[name] : func,
          newOptions = assign(assign({}, oldOptions), options);
      return baseConvert(newUtil, name, newFunc, newOptions);
    };
  }
  function iterateeAry(func, n) {
    return overArg(func, function(func) {
      return typeof func == 'function' ? baseAry(func, n) : func;
    });
  }
  function iterateeRearg(func, indexes) {
    return overArg(func, function(func) {
      var n = indexes.length;
      return baseArity(rearg(baseAry(func, n), indexes), n);
    });
  }
  function overArg(func, transform) {
    return function() {
      var length = arguments.length;
      if (!length) {
        return func();
      }
      var args = Array(length);
      while (length--) {
        args[length] = arguments[length];
      }
      var index = config.rearg ? 0 : (length - 1);
      args[index] = transform(args[index]);
      return func.apply(undefined, args);
    };
  }
  function wrap(name, func) {
    name = mapping.aliasToReal[name] || name;
    var result,
        wrapped = func,
        wrapper = wrappers[name];
    if (wrapper) {
      wrapped = wrapper(func);
    } else if (config.immutable) {
      if (mutateMap.array[name]) {
        wrapped = wrapImmutable(func, cloneArray);
      } else if (mutateMap.object[name]) {
        wrapped = wrapImmutable(func, createCloner(func));
      } else if (mutateMap.set[name]) {
        wrapped = wrapImmutable(func, cloneByPath);
      }
    }
    each(aryMethodKeys, function(aryKey) {
      each(mapping.aryMethod[aryKey], function(otherName) {
        if (name == otherName) {
          var spreadData = mapping.methodSpread[name],
              afterRearg = spreadData && spreadData.afterRearg;
          result = afterRearg ? castFixed(name, castRearg(name, wrapped, aryKey), aryKey) : castRearg(name, castFixed(name, wrapped, aryKey), aryKey);
          result = castCap(name, result);
          result = castCurry(name, result, aryKey);
          return false;
        }
      });
      return !result;
    });
    result || (result = wrapped);
    if (result == func) {
      result = forceCurry ? curry(result, 1) : function() {
        return func.apply(this, arguments);
      };
    }
    result.convert = createConverter(name, func);
    if (mapping.placeholder[name]) {
      setPlaceholder = true;
      result.placeholder = func.placeholder = placeholder;
    }
    return result;
  }
  if (!isObj) {
    return wrap(name, func);
  }
  var _ = func;
  var pairs = [];
  each(aryMethodKeys, function(aryKey) {
    each(mapping.aryMethod[aryKey], function(key) {
      var func = _[mapping.remap[key] || key];
      if (func) {
        pairs.push([key, wrap(key, func)]);
      }
    });
  });
  each(keys(_), function(key) {
    var func = _[key];
    if (typeof func == 'function') {
      var length = pairs.length;
      while (length--) {
        if (pairs[length][0] == key) {
          return;
        }
      }
      func.convert = createConverter(key, func);
      pairs.push([key, func]);
    }
  });
  each(pairs, function(pair) {
    _[pair[0]] = pair[1];
  });
  _.convert = convertLib;
  if (setPlaceholder) {
    _.placeholder = placeholder;
  }
  each(keys(_), function(key) {
    each(mapping.realToAlias[key] || [], function(alias) {
      _[alias] = _[key];
    });
  });
  return _;
}
module.exports = baseConvert;
