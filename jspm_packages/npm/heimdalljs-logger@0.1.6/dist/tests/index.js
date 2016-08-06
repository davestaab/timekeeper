/* */ 
(function(Buffer, process) {
  var require$$0 = require('buffer');
  var require$$4 = require('tty');
  var require$$3 = require('util');
  var require$$1 = require('fs');
  var require$$0$1 = require('net');
  function interopDefault(ex) {
    return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
  }
  function createCommonjsModule(fn, module) {
    return module = {exports: {}}, fn(module, module.exports), module.exports;
  }
  var index$1 = createCommonjsModule(function(module) {
    function exclude() {
      var excludes = [].slice.call(arguments);
      function excludeProps(res, obj) {
        Object.keys(obj).forEach(function(key) {
          if (!~excludes.indexOf(key))
            res[key] = obj[key];
        });
      }
      return function extendExclude() {
        var args = [].slice.call(arguments),
            i = 0,
            res = {};
        for (; i < args.length; i++) {
          excludeProps(res, args[i]);
        }
        return res;
      };
    }
    ;
    module.exports = AssertionError;
    function AssertionError(message, _props, ssf) {
      var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON'),
          props = extend(_props || {});
      this.message = message || 'Unspecified AssertionError';
      this.showDiff = false;
      for (var key in props) {
        this[key] = props[key];
      }
      ssf = ssf || arguments.callee;
      if (ssf && Error.captureStackTrace) {
        Error.captureStackTrace(this, ssf);
      } else {
        try {
          throw new Error();
        } catch (e) {
          this.stack = e.stack;
        }
      }
    }
    AssertionError.prototype = Object.create(Error.prototype);
    AssertionError.prototype.name = 'AssertionError';
    AssertionError.prototype.constructor = AssertionError;
    AssertionError.prototype.toJSON = function(stack) {
      var extend = exclude('constructor', 'toJSON', 'stack'),
          props = extend({name: this.name}, this);
      if (false !== stack && this.stack) {
        props.stack = this.stack;
      }
      return props;
    };
  });
  var index$2 = interopDefault(index$1);
  var require$$2 = Object.freeze({default: index$2});
  var flag = createCommonjsModule(function(module) {
    module.exports = function(obj, key, value) {
      var flags = obj.__flags || (obj.__flags = Object.create(null));
      if (arguments.length === 3) {
        flags[key] = value;
      } else {
        return flags[key];
      }
    };
  });
  var flag$1 = interopDefault(flag);
  var require$$1$1 = Object.freeze({default: flag$1});
  var test = createCommonjsModule(function(module) {
    var flag = interopDefault(require$$1$1);
    module.exports = function(obj, args) {
      var negate = flag(obj, 'negate'),
          expr = args[0];
      return negate ? !expr : expr;
    };
  });
  var test$1 = interopDefault(test);
  var require$$19 = Object.freeze({default: test$1});
  var type = createCommonjsModule(function(module) {
    var exports = module.exports = getType;
    var objectTypeRegexp = /^\[object (.*)\]$/;
    function getType(obj) {
      var type = Object.prototype.toString.call(obj).match(objectTypeRegexp)[1].toLowerCase();
      if (typeof Promise === 'function' && obj instanceof Promise)
        return 'promise';
      if (obj === null)
        return 'null';
      if (obj === undefined)
        return 'undefined';
      return type;
    }
    exports.Library = Library;
    function Library() {
      if (!(this instanceof Library))
        return new Library();
      this.tests = {};
    }
    Library.prototype.of = getType;
    Library.prototype.define = function(type, test) {
      if (arguments.length === 1)
        return this.tests[type];
      this.tests[type] = test;
      return this;
    };
    Library.prototype.test = function(obj, type) {
      if (type === getType(obj))
        return true;
      var test = this.tests[type];
      if (test && 'regexp' === getType(test)) {
        return test.test(obj);
      } else if (test && 'function' === getType(test)) {
        return test(obj);
      } else {
        throw new ReferenceError('Type test "' + type + '" not defined or invalid.');
      }
    };
  });
  var type$1 = interopDefault(type);
  var require$$0$4 = Object.freeze({default: type$1});
  var index$5 = createCommonjsModule(function(module) {
    module.exports = interopDefault(require$$0$4);
  });
  var index$6 = interopDefault(index$5);
  var require$$0$3 = Object.freeze({default: index$6});
  var expectTypes = createCommonjsModule(function(module) {
    var AssertionError = interopDefault(require$$2);
    var flag = interopDefault(require$$1$1);
    var type = interopDefault(require$$0$3);
    module.exports = function(obj, types) {
      var obj = flag(obj, 'object');
      types = types.map(function(t) {
        return t.toLowerCase();
      });
      types.sort();
      var str = types.map(function(t, index) {
        var art = ~['a', 'e', 'i', 'o', 'u'].indexOf(t.charAt(0)) ? 'an' : 'a';
        var or = types.length > 1 && index === types.length - 1 ? 'or ' : '';
        return or + art + ' ' + t;
      }).join(', ');
      if (!types.some(function(expected) {
        return type(obj) === expected;
      })) {
        throw new AssertionError('object tested must be ' + str + ', but ' + type(obj) + ' given');
      }
    };
  });
  var expectTypes$1 = interopDefault(expectTypes);
  var require$$17 = Object.freeze({default: expectTypes$1});
  var getActual = createCommonjsModule(function(module) {
    module.exports = function(obj, args) {
      return args.length > 4 ? args[4] : obj._obj;
    };
  });
  var getActual$1 = interopDefault(getActual);
  var require$$2$1 = Object.freeze({default: getActual$1});
  var getName = createCommonjsModule(function(module) {
    module.exports = function(func) {
      if (func.name)
        return func.name;
      var match = /^\s?function ([^(]*)\(/.exec(func);
      return match && match[1] ? match[1] : "";
    };
  });
  var getName$1 = interopDefault(getName);
  var require$$2$2 = Object.freeze({default: getName$1});
  var getProperties = createCommonjsModule(function(module) {
    module.exports = function getProperties(object) {
      var result = Object.getOwnPropertyNames(object);
      function addProperty(property) {
        if (result.indexOf(property) === -1) {
          result.push(property);
        }
      }
      var proto = Object.getPrototypeOf(object);
      while (proto !== null) {
        Object.getOwnPropertyNames(proto).forEach(addProperty);
        proto = Object.getPrototypeOf(proto);
      }
      return result;
    };
  });
  var getProperties$1 = interopDefault(getProperties);
  var require$$1$3 = Object.freeze({default: getProperties$1});
  var getEnumerableProperties = createCommonjsModule(function(module) {
    module.exports = function getEnumerableProperties(object) {
      var result = [];
      for (var name in object) {
        result.push(name);
      }
      return result;
    };
  });
  var getEnumerableProperties$1 = interopDefault(getEnumerableProperties);
  var require$$0$5 = Object.freeze({default: getEnumerableProperties$1});
  var inspect = createCommonjsModule(function(module, exports) {
    var getName = interopDefault(require$$2$2);
    var getProperties = interopDefault(require$$1$3);
    var getEnumerableProperties = interopDefault(require$$0$5);
    module.exports = inspect;
    function inspect(obj, showHidden, depth, colors) {
      var ctx = {
        showHidden: showHidden,
        seen: [],
        stylize: function(str) {
          return str;
        }
      };
      return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));
    }
    var isDOMElement = function(object) {
      if (typeof HTMLElement === 'object') {
        return object instanceof HTMLElement;
      } else {
        return object && typeof object === 'object' && object.nodeType === 1 && typeof object.nodeName === 'string';
      }
    };
    function formatValue(ctx, value, recurseTimes) {
      if (value && typeof value.inspect === 'function' && value.inspect !== exports.inspect && !(value.constructor && value.constructor.prototype === value)) {
        var ret = value.inspect(recurseTimes);
        if (typeof ret !== 'string') {
          ret = formatValue(ctx, ret, recurseTimes);
        }
        return ret;
      }
      var primitive = formatPrimitive(ctx, value);
      if (primitive) {
        return primitive;
      }
      if (isDOMElement(value)) {
        if ('outerHTML' in value) {
          return value.outerHTML;
        } else {
          try {
            if (document.xmlVersion) {
              var xmlSerializer = new XMLSerializer();
              return xmlSerializer.serializeToString(value);
            } else {
              var ns = "http://www.w3.org/1999/xhtml";
              var container = document.createElementNS(ns, '_');
              container.appendChild(value.cloneNode(false));
              html = container.innerHTML.replace('><', '>' + value.innerHTML + '<');
              container.innerHTML = '';
              return html;
            }
          } catch (err) {}
        }
      }
      var visibleKeys = getEnumerableProperties(value);
      var keys = ctx.showHidden ? getProperties(value) : visibleKeys;
      if (keys.length === 0 || (isError(value) && ((keys.length === 1 && keys[0] === 'stack') || (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')))) {
        if (typeof value === 'function') {
          var name = getName(value);
          var nameSuffix = name ? ': ' + name : '';
          return ctx.stylize('[Function' + nameSuffix + ']', 'special');
        }
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
        }
        if (isDate(value)) {
          return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');
        }
        if (isError(value)) {
          return formatError(value);
        }
      }
      var base = '',
          array = false,
          braces = ['{', '}'];
      if (isArray(value)) {
        array = true;
        braces = ['[', ']'];
      }
      if (typeof value === 'function') {
        var name = getName(value);
        var nameSuffix = name ? ': ' + name : '';
        base = ' [Function' + nameSuffix + ']';
      }
      if (isRegExp(value)) {
        base = ' ' + RegExp.prototype.toString.call(value);
      }
      if (isDate(value)) {
        base = ' ' + Date.prototype.toUTCString.call(value);
      }
      if (isError(value)) {
        return formatError(value);
      }
      if (keys.length === 0 && (!array || value.length == 0)) {
        return braces[0] + base + braces[1];
      }
      if (recurseTimes < 0) {
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
        } else {
          return ctx.stylize('[Object]', 'special');
        }
      }
      ctx.seen.push(value);
      var output;
      if (array) {
        output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
      } else {
        output = keys.map(function(key) {
          return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
        });
      }
      ctx.seen.pop();
      return reduceToSingleString(output, base, braces);
    }
    function formatPrimitive(ctx, value) {
      switch (typeof value) {
        case 'undefined':
          return ctx.stylize('undefined', 'undefined');
        case 'string':
          var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') + '\'';
          return ctx.stylize(simple, 'string');
        case 'number':
          if (value === 0 && (1 / value) === -Infinity) {
            return ctx.stylize('-0', 'number');
          }
          return ctx.stylize('' + value, 'number');
        case 'boolean':
          return ctx.stylize('' + value, 'boolean');
      }
      if (value === null) {
        return ctx.stylize('null', 'null');
      }
    }
    function formatError(value) {
      return '[' + Error.prototype.toString.call(value) + ']';
    }
    function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
      var output = [];
      for (var i = 0,
          l = value.length; i < l; ++i) {
        if (Object.prototype.hasOwnProperty.call(value, String(i))) {
          output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
        } else {
          output.push('');
        }
      }
      keys.forEach(function(key) {
        if (!key.match(/^\d+$/)) {
          output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
        }
      });
      return output;
    }
    function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
      var name,
          str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = ctx.stylize('[Getter/Setter]', 'special');
          } else {
            str = ctx.stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = ctx.stylize('[Setter]', 'special');
          }
        }
      }
      if (visibleKeys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (ctx.seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = formatValue(ctx, value[key], null);
          } else {
            str = formatValue(ctx, value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (array) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = ctx.stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (array && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = ctx.stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
          name = ctx.stylize(name, 'string');
        }
      }
      return name + ': ' + str;
    }
    function reduceToSingleString(output, base, braces) {
      var numLinesEst = 0;
      var length = output.reduce(function(prev, cur) {
        numLinesEst++;
        if (cur.indexOf('\n') >= 0)
          numLinesEst++;
        return prev + cur.length + 1;
      }, 0);
      if (length > 60) {
        return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
      }
      return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }
    function isArray(ar) {
      return Array.isArray(ar) || (typeof ar === 'object' && objectToString(ar) === '[object Array]');
    }
    function isRegExp(re) {
      return typeof re === 'object' && objectToString(re) === '[object RegExp]';
    }
    function isDate(d) {
      return typeof d === 'object' && objectToString(d) === '[object Date]';
    }
    function isError(e) {
      return typeof e === 'object' && objectToString(e) === '[object Error]';
    }
    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }
  });
  var inspect$1 = interopDefault(inspect);
  var require$$1$2 = Object.freeze({default: inspect$1});
  var config = createCommonjsModule(function(module) {
    module.exports = {
      includeStack: false,
      showDiff: true,
      truncateThreshold: 40
    };
  });
  var config$1 = interopDefault(config);
  var includeStack = config.includeStack;
  var showDiff = config.showDiff;
  var truncateThreshold = config.truncateThreshold;
  var require$$0$7 = Object.freeze({
    default: config$1,
    includeStack: includeStack,
    showDiff: showDiff,
    truncateThreshold: truncateThreshold
  });
  var objDisplay = createCommonjsModule(function(module) {
    var inspect = interopDefault(require$$1$2);
    var config = interopDefault(require$$0$7);
    module.exports = function(obj) {
      var str = inspect(obj),
          type = Object.prototype.toString.call(obj);
      if (config.truncateThreshold && str.length >= config.truncateThreshold) {
        if (type === '[object Function]') {
          return !obj.name || obj.name === '' ? '[Function]' : '[Function: ' + obj.name + ']';
        } else if (type === '[object Array]') {
          return '[ Array(' + obj.length + ') ]';
        } else if (type === '[object Object]') {
          var keys = Object.keys(obj),
              kstr = keys.length > 2 ? keys.splice(0, 2).join(', ') + ', ...' : keys.join(', ');
          return '{ Object (' + kstr + ') }';
        } else {
          return str;
        }
      } else {
        return str;
      }
    };
  });
  var objDisplay$1 = interopDefault(objDisplay);
  var require$$0$6 = Object.freeze({default: objDisplay$1});
  var getMessage = createCommonjsModule(function(module) {
    var flag = interopDefault(require$$1$1),
        getActual = interopDefault(require$$2$1),
        inspect = interopDefault(require$$1$2),
        objDisplay = interopDefault(require$$0$6);
    module.exports = function(obj, args) {
      var negate = flag(obj, 'negate'),
          val = flag(obj, 'object'),
          expected = args[3],
          actual = getActual(obj, args),
          msg = negate ? args[2] : args[1],
          flagMsg = flag(obj, 'message');
      if (typeof msg === "function")
        msg = msg();
      msg = msg || '';
      msg = msg.replace(/#\{this\}/g, function() {
        return objDisplay(val);
      }).replace(/#\{act\}/g, function() {
        return objDisplay(actual);
      }).replace(/#\{exp\}/g, function() {
        return objDisplay(expected);
      });
      return flagMsg ? flagMsg + ': ' + msg : msg;
    };
  });
  var getMessage$1 = interopDefault(getMessage);
  var require$$16 = Object.freeze({default: getMessage$1});
  var transferFlags = createCommonjsModule(function(module) {
    module.exports = function(assertion, object, includeAll) {
      var flags = assertion.__flags || (assertion.__flags = Object.create(null));
      if (!object.__flags) {
        object.__flags = Object.create(null);
      }
      includeAll = arguments.length === 3 ? includeAll : true;
      for (var flag in flags) {
        if (includeAll || (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {
          object.__flags[flag] = flags[flag];
        }
      }
    };
  });
  var transferFlags$1 = interopDefault(transferFlags);
  var require$$2$3 = Object.freeze({default: transferFlags$1});
  var type$2 = createCommonjsModule(function(module) {
    var exports = module.exports = getType;
    var natives = {
      '[object Array]': 'array',
      '[object RegExp]': 'regexp',
      '[object Function]': 'function',
      '[object Arguments]': 'arguments',
      '[object Date]': 'date'
    };
    function getType(obj) {
      var str = Object.prototype.toString.call(obj);
      if (natives[str])
        return natives[str];
      if (obj === null)
        return 'null';
      if (obj === undefined)
        return 'undefined';
      if (obj === Object(obj))
        return 'object';
      return typeof obj;
    }
    exports.Library = Library;
    function Library() {
      this.tests = {};
    }
    Library.prototype.of = getType;
    Library.prototype.define = function(type, test) {
      if (arguments.length === 1)
        return this.tests[type];
      this.tests[type] = test;
      return this;
    };
    Library.prototype.test = function(obj, type) {
      if (type === getType(obj))
        return true;
      var test = this.tests[type];
      if (test && 'regexp' === getType(test)) {
        return test.test(obj);
      } else if (test && 'function' === getType(test)) {
        return test(obj);
      } else {
        throw new ReferenceError('Type test "' + type + '" not defined or invalid.');
      }
    };
  });
  var type$3 = interopDefault(type$2);
  var require$$0$9 = Object.freeze({default: type$3});
  var index$9 = createCommonjsModule(function(module) {
    module.exports = interopDefault(require$$0$9);
  });
  var index$10 = interopDefault(index$9);
  var require$$1$4 = Object.freeze({default: index$10});
  var eql = createCommonjsModule(function(module) {
    var type = interopDefault(require$$1$4);
    var Buffer;
    try {
      Buffer = interopDefault(require$$0).Buffer;
    } catch (ex) {
      Buffer = {};
      Buffer.isBuffer = function() {
        return false;
      };
    }
    module.exports = deepEqual;
    function deepEqual(a, b, m) {
      if (sameValue(a, b)) {
        return true;
      } else if ('date' === type(a)) {
        return dateEqual(a, b);
      } else if ('regexp' === type(a)) {
        return regexpEqual(a, b);
      } else if (Buffer.isBuffer(a)) {
        return bufferEqual(a, b);
      } else if ('arguments' === type(a)) {
        return argumentsEqual(a, b, m);
      } else if (!typeEqual(a, b)) {
        return false;
      } else if (('object' !== type(a) && 'object' !== type(b)) && ('array' !== type(a) && 'array' !== type(b))) {
        return sameValue(a, b);
      } else {
        return objectEqual(a, b, m);
      }
    }
    function sameValue(a, b) {
      if (a === b)
        return a !== 0 || 1 / a === 1 / b;
      return a !== a && b !== b;
    }
    function typeEqual(a, b) {
      return type(a) === type(b);
    }
    function dateEqual(a, b) {
      if ('date' !== type(b))
        return false;
      return sameValue(a.getTime(), b.getTime());
    }
    function regexpEqual(a, b) {
      if ('regexp' !== type(b))
        return false;
      return sameValue(a.toString(), b.toString());
    }
    function argumentsEqual(a, b, m) {
      if ('arguments' !== type(b))
        return false;
      a = [].slice.call(a);
      b = [].slice.call(b);
      return deepEqual(a, b, m);
    }
    function enumerable(a) {
      var res = [];
      for (var key in a)
        res.push(key);
      return res;
    }
    function iterableEqual(a, b) {
      if (a.length !== b.length)
        return false;
      var i = 0;
      var match = true;
      for (; i < a.length; i++) {
        if (a[i] !== b[i]) {
          match = false;
          break;
        }
      }
      return match;
    }
    function bufferEqual(a, b) {
      if (!Buffer.isBuffer(b))
        return false;
      return iterableEqual(a, b);
    }
    function isValue(a) {
      return a !== null && a !== undefined;
    }
    function objectEqual(a, b, m) {
      if (!isValue(a) || !isValue(b)) {
        return false;
      }
      if (a.prototype !== b.prototype) {
        return false;
      }
      var i;
      if (m) {
        for (i = 0; i < m.length; i++) {
          if ((m[i][0] === a && m[i][1] === b) || (m[i][0] === b && m[i][1] === a)) {
            return true;
          }
        }
      } else {
        m = [];
      }
      try {
        var ka = enumerable(a);
        var kb = enumerable(b);
      } catch (ex) {
        return false;
      }
      ka.sort();
      kb.sort();
      if (!iterableEqual(ka, kb)) {
        return false;
      }
      m.push([a, b]);
      var key;
      for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!deepEqual(a[key], b[key], m)) {
          return false;
        }
      }
      return true;
    }
  });
  var eql$1 = interopDefault(eql);
  var require$$0$8 = Object.freeze({default: eql$1});
  var index$7 = createCommonjsModule(function(module) {
    module.exports = interopDefault(require$$0$8);
  });
  var index$8 = interopDefault(index$7);
  var require$$10 = Object.freeze({default: index$8});
  var hasProperty = createCommonjsModule(function(module) {
    var type = interopDefault(require$$0$3);
    var literals = {
      'number': Number,
      'string': String
    };
    module.exports = function hasProperty(name, obj) {
      var ot = type(obj);
      if (ot === 'null' || ot === 'undefined')
        return false;
      if (literals[ot] && typeof obj !== 'object')
        obj = new literals[ot](obj);
      return name in obj;
    };
  });
  var hasProperty$1 = interopDefault(hasProperty);
  var require$$0$11 = Object.freeze({default: hasProperty$1});
  var getPathInfo = createCommonjsModule(function(module) {
    var hasProperty = interopDefault(require$$0$11);
    module.exports = function getPathInfo(path, obj) {
      var parsed = parsePath(path),
          last = parsed[parsed.length - 1];
      var info = {
        parent: parsed.length > 1 ? _getPathValue(parsed, obj, parsed.length - 1) : obj,
        name: last.p || last.i,
        value: _getPathValue(parsed, obj)
      };
      info.exists = hasProperty(info.name, info.parent);
      return info;
    };
    function parsePath(path) {
      var str = path.replace(/([^\\])\[/g, '$1.['),
          parts = str.match(/(\\\.|[^.]+?)+/g);
      return parts.map(function(value) {
        var re = /^\[(\d+)\]$/,
            mArr = re.exec(value);
        if (mArr)
          return {i: parseFloat(mArr[1])};
        else
          return {p: value.replace(/\\([.\[\]])/g, '$1')};
      });
    }
    function _getPathValue(parsed, obj, index) {
      var tmp = obj,
          res;
      index = (index === undefined ? parsed.length : index);
      for (var i = 0,
          l = index; i < l; i++) {
        var part = parsed[i];
        if (tmp) {
          if ('undefined' !== typeof part.p)
            tmp = tmp[part.p];
          else if ('undefined' !== typeof part.i)
            tmp = tmp[part.i];
          if (i == (l - 1))
            res = tmp;
        } else {
          res = undefined;
        }
      }
      return res;
    }
  });
  var getPathInfo$1 = interopDefault(getPathInfo);
  var require$$0$10 = Object.freeze({default: getPathInfo$1});
  var getPathValue = createCommonjsModule(function(module) {
    var getPathInfo = interopDefault(require$$0$10);
    module.exports = function(path, obj) {
      var info = getPathInfo(path, obj);
      return info.value;
    };
  });
  var getPathValue$1 = interopDefault(getPathValue);
  var require$$9 = Object.freeze({default: getPathValue$1});
  var addProperty = createCommonjsModule(function(module) {
    var config = interopDefault(require$$0$7);
    var flag = interopDefault(require$$1$1);
    module.exports = function(ctx, name, getter) {
      Object.defineProperty(ctx, name, {
        get: function addProperty() {
          var old_ssfi = flag(this, 'ssfi');
          if (old_ssfi && config.includeStack === false)
            flag(this, 'ssfi', addProperty);
          var result = getter.call(this);
          return result === undefined ? this : result;
        },
        configurable: true
      });
    };
  });
  var addProperty$1 = interopDefault(addProperty);
  var require$$5 = Object.freeze({default: addProperty$1});
  var addMethod = createCommonjsModule(function(module) {
    var config = interopDefault(require$$0$7);
    var flag = interopDefault(require$$1$1);
    module.exports = function(ctx, name, method) {
      ctx[name] = function() {
        var old_ssfi = flag(this, 'ssfi');
        if (old_ssfi && config.includeStack === false)
          flag(this, 'ssfi', ctx[name]);
        var result = method.apply(this, arguments);
        return result === undefined ? this : result;
      };
    };
  });
  var addMethod$1 = interopDefault(addMethod);
  var require$$4$1 = Object.freeze({default: addMethod$1});
  var overwriteProperty = createCommonjsModule(function(module) {
    module.exports = function(ctx, name, getter) {
      var _get = Object.getOwnPropertyDescriptor(ctx, name),
          _super = function() {};
      if (_get && 'function' === typeof _get.get)
        _super = _get.get;
      Object.defineProperty(ctx, name, {
        get: function() {
          var result = getter(_super).call(this);
          return result === undefined ? this : result;
        },
        configurable: true
      });
    };
  });
  var overwriteProperty$1 = interopDefault(overwriteProperty);
  var require$$3$1 = Object.freeze({default: overwriteProperty$1});
  var overwriteMethod = createCommonjsModule(function(module) {
    module.exports = function(ctx, name, method) {
      var _method = ctx[name],
          _super = function() {
            return this;
          };
      if (_method && 'function' === typeof _method)
        _super = _method;
      ctx[name] = function() {
        var result = method(_super).apply(this, arguments);
        return result === undefined ? this : result;
      };
    };
  });
  var overwriteMethod$1 = interopDefault(overwriteMethod);
  var require$$2$4 = Object.freeze({default: overwriteMethod$1});
  var addChainableMethod = createCommonjsModule(function(module) {
    var transferFlags = interopDefault(require$$2$3);
    var flag = interopDefault(require$$1$1);
    var config = interopDefault(require$$0$7);
    var hasProtoSupport = '__proto__' in Object;
    var excludeNames = /^(?:length|name|arguments|caller)$/;
    var call = Function.prototype.call,
        apply = Function.prototype.apply;
    module.exports = function(ctx, name, method, chainingBehavior) {
      if (typeof chainingBehavior !== 'function') {
        chainingBehavior = function() {};
      }
      var chainableBehavior = {
        method: method,
        chainingBehavior: chainingBehavior
      };
      if (!ctx.__methods) {
        ctx.__methods = {};
      }
      ctx.__methods[name] = chainableBehavior;
      Object.defineProperty(ctx, name, {
        get: function() {
          chainableBehavior.chainingBehavior.call(this);
          var assert = function assert() {
            var old_ssfi = flag(this, 'ssfi');
            if (old_ssfi && config.includeStack === false)
              flag(this, 'ssfi', assert);
            var result = chainableBehavior.method.apply(this, arguments);
            return result === undefined ? this : result;
          };
          if (hasProtoSupport) {
            var prototype = assert.__proto__ = Object.create(this);
            prototype.call = call;
            prototype.apply = apply;
          } else {
            var asserterNames = Object.getOwnPropertyNames(ctx);
            asserterNames.forEach(function(asserterName) {
              if (!excludeNames.test(asserterName)) {
                var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
                Object.defineProperty(assert, asserterName, pd);
              }
            });
          }
          transferFlags(this, assert);
          return assert;
        },
        configurable: true
      });
    };
  });
  var addChainableMethod$1 = interopDefault(addChainableMethod);
  var require$$1$5 = Object.freeze({default: addChainableMethod$1});
  var overwriteChainableMethod = createCommonjsModule(function(module) {
    module.exports = function(ctx, name, method, chainingBehavior) {
      var chainableBehavior = ctx.__methods[name];
      var _chainingBehavior = chainableBehavior.chainingBehavior;
      chainableBehavior.chainingBehavior = function() {
        var result = chainingBehavior(_chainingBehavior).call(this);
        return result === undefined ? this : result;
      };
      var _method = chainableBehavior.method;
      chainableBehavior.method = function() {
        var result = method(_method).apply(this, arguments);
        return result === undefined ? this : result;
      };
    };
  });
  var overwriteChainableMethod$1 = interopDefault(overwriteChainableMethod);
  var require$$0$12 = Object.freeze({default: overwriteChainableMethod$1});
  var index$3 = createCommonjsModule(function(module) {
    var exports = module.exports = {};
    exports.test = interopDefault(require$$19);
    exports.type = interopDefault(require$$0$3);
    exports.expectTypes = interopDefault(require$$17);
    exports.getMessage = interopDefault(require$$16);
    exports.getActual = interopDefault(require$$2$1);
    exports.inspect = interopDefault(require$$1$2);
    exports.objDisplay = interopDefault(require$$0$6);
    exports.flag = interopDefault(require$$1$1);
    exports.transferFlags = interopDefault(require$$2$3);
    exports.eql = interopDefault(require$$10);
    exports.getPathValue = interopDefault(require$$9);
    exports.getPathInfo = interopDefault(require$$0$10);
    exports.hasProperty = interopDefault(require$$0$11);
    exports.getName = interopDefault(require$$2$2);
    exports.addProperty = interopDefault(require$$5);
    exports.addMethod = interopDefault(require$$4$1);
    exports.overwriteProperty = interopDefault(require$$3$1);
    exports.overwriteMethod = interopDefault(require$$2$4);
    exports.addChainableMethod = interopDefault(require$$1$5);
    exports.overwriteChainableMethod = interopDefault(require$$0$12);
  });
  var index$4 = interopDefault(index$3);
  var require$$6 = Object.freeze({default: index$4});
  var assertion = createCommonjsModule(function(module) {
    var config = interopDefault(require$$0$7);
    module.exports = function(_chai, util) {
      var AssertionError = _chai.AssertionError,
          flag = util.flag;
      _chai.Assertion = Assertion;
      function Assertion(obj, msg, stack) {
        flag(this, 'ssfi', stack || arguments.callee);
        flag(this, 'object', obj);
        flag(this, 'message', msg);
      }
      Object.defineProperty(Assertion, 'includeStack', {
        get: function() {
          console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
          return config.includeStack;
        },
        set: function(value) {
          console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
          config.includeStack = value;
        }
      });
      Object.defineProperty(Assertion, 'showDiff', {
        get: function() {
          console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
          return config.showDiff;
        },
        set: function(value) {
          console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
          config.showDiff = value;
        }
      });
      Assertion.addProperty = function(name, fn) {
        util.addProperty(this.prototype, name, fn);
      };
      Assertion.addMethod = function(name, fn) {
        util.addMethod(this.prototype, name, fn);
      };
      Assertion.addChainableMethod = function(name, fn, chainingBehavior) {
        util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
      };
      Assertion.overwriteProperty = function(name, fn) {
        util.overwriteProperty(this.prototype, name, fn);
      };
      Assertion.overwriteMethod = function(name, fn) {
        util.overwriteMethod(this.prototype, name, fn);
      };
      Assertion.overwriteChainableMethod = function(name, fn, chainingBehavior) {
        util.overwriteChainableMethod(this.prototype, name, fn, chainingBehavior);
      };
      Assertion.prototype.assert = function(expr, msg, negateMsg, expected, _actual, showDiff) {
        var ok = util.test(this, arguments);
        if (true !== showDiff)
          showDiff = false;
        if (true !== config.showDiff)
          showDiff = false;
        if (!ok) {
          var msg = util.getMessage(this, arguments),
              actual = util.getActual(this, arguments);
          throw new AssertionError(msg, {
            actual: actual,
            expected: expected,
            showDiff: showDiff
          }, (config.includeStack) ? this.assert : flag(this, 'ssfi'));
        }
      };
      Object.defineProperty(Assertion.prototype, '_obj', {
        get: function() {
          return flag(this, 'object');
        },
        set: function(val) {
          flag(this, 'object', val);
        }
      });
    };
  });
  var assertion$1 = interopDefault(assertion);
  var require$$4$2 = Object.freeze({default: assertion$1});
  var assertions = createCommonjsModule(function(module) {
    module.exports = function(chai, _) {
      var Assertion = chai.Assertion,
          toString = Object.prototype.toString,
          flag = _.flag;
      ['to', 'be', 'been', 'is', 'and', 'has', 'have', 'with', 'that', 'which', 'at', 'of', 'same'].forEach(function(chain) {
        Assertion.addProperty(chain, function() {
          return this;
        });
      });
      Assertion.addProperty('not', function() {
        flag(this, 'negate', true);
      });
      Assertion.addProperty('deep', function() {
        flag(this, 'deep', true);
      });
      Assertion.addProperty('any', function() {
        flag(this, 'any', true);
        flag(this, 'all', false);
      });
      Assertion.addProperty('all', function() {
        flag(this, 'all', true);
        flag(this, 'any', false);
      });
      function an(type, msg) {
        if (msg)
          flag(this, 'message', msg);
        type = type.toLowerCase();
        var obj = flag(this, 'object'),
            article = ~['a', 'e', 'i', 'o', 'u'].indexOf(type.charAt(0)) ? 'an ' : 'a ';
        this.assert(type === _.type(obj), 'expected #{this} to be ' + article + type, 'expected #{this} not to be ' + article + type);
      }
      Assertion.addChainableMethod('an', an);
      Assertion.addChainableMethod('a', an);
      function includeChainingBehavior() {
        flag(this, 'contains', true);
      }
      function include(val, msg) {
        _.expectTypes(this, ['array', 'object', 'string']);
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        var expected = false;
        if (_.type(obj) === 'array' && _.type(val) === 'object') {
          for (var i in obj) {
            if (_.eql(obj[i], val)) {
              expected = true;
              break;
            }
          }
        } else if (_.type(val) === 'object') {
          if (!flag(this, 'negate')) {
            for (var k in val)
              new Assertion(obj).property(k, val[k]);
            return;
          }
          var subset = {};
          for (var k in val)
            subset[k] = obj[k];
          expected = _.eql(subset, val);
        } else {
          expected = (obj != undefined) && ~obj.indexOf(val);
        }
        this.assert(expected, 'expected #{this} to include ' + _.inspect(val), 'expected #{this} to not include ' + _.inspect(val));
      }
      Assertion.addChainableMethod('include', include, includeChainingBehavior);
      Assertion.addChainableMethod('contain', include, includeChainingBehavior);
      Assertion.addChainableMethod('contains', include, includeChainingBehavior);
      Assertion.addChainableMethod('includes', include, includeChainingBehavior);
      Assertion.addProperty('ok', function() {
        this.assert(flag(this, 'object'), 'expected #{this} to be truthy', 'expected #{this} to be falsy');
      });
      Assertion.addProperty('true', function() {
        this.assert(true === flag(this, 'object'), 'expected #{this} to be true', 'expected #{this} to be false', this.negate ? false : true);
      });
      Assertion.addProperty('false', function() {
        this.assert(false === flag(this, 'object'), 'expected #{this} to be false', 'expected #{this} to be true', this.negate ? true : false);
      });
      Assertion.addProperty('null', function() {
        this.assert(null === flag(this, 'object'), 'expected #{this} to be null', 'expected #{this} not to be null');
      });
      Assertion.addProperty('undefined', function() {
        this.assert(undefined === flag(this, 'object'), 'expected #{this} to be undefined', 'expected #{this} not to be undefined');
      });
      Assertion.addProperty('NaN', function() {
        this.assert(isNaN(flag(this, 'object')), 'expected #{this} to be NaN', 'expected #{this} not to be NaN');
      });
      Assertion.addProperty('exist', function() {
        this.assert(null != flag(this, 'object'), 'expected #{this} to exist', 'expected #{this} to not exist');
      });
      Assertion.addProperty('empty', function() {
        var obj = flag(this, 'object'),
            expected = obj;
        if (Array.isArray(obj) || 'string' === typeof object) {
          expected = obj.length;
        } else if (typeof obj === 'object') {
          expected = Object.keys(obj).length;
        }
        this.assert(!expected, 'expected #{this} to be empty', 'expected #{this} not to be empty');
      });
      function checkArguments() {
        var obj = flag(this, 'object'),
            type = Object.prototype.toString.call(obj);
        this.assert('[object Arguments]' === type, 'expected #{this} to be arguments but got ' + type, 'expected #{this} to not be arguments');
      }
      Assertion.addProperty('arguments', checkArguments);
      Assertion.addProperty('Arguments', checkArguments);
      function assertEqual(val, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        if (flag(this, 'deep')) {
          return this.eql(val);
        } else {
          this.assert(val === obj, 'expected #{this} to equal #{exp}', 'expected #{this} to not equal #{exp}', val, this._obj, true);
        }
      }
      Assertion.addMethod('equal', assertEqual);
      Assertion.addMethod('equals', assertEqual);
      Assertion.addMethod('eq', assertEqual);
      function assertEql(obj, msg) {
        if (msg)
          flag(this, 'message', msg);
        this.assert(_.eql(obj, flag(this, 'object')), 'expected #{this} to deeply equal #{exp}', 'expected #{this} to not deeply equal #{exp}', obj, this._obj, true);
      }
      Assertion.addMethod('eql', assertEql);
      Assertion.addMethod('eqls', assertEql);
      function assertAbove(n, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        if (flag(this, 'doLength')) {
          new Assertion(obj, msg).to.have.property('length');
          var len = obj.length;
          this.assert(len > n, 'expected #{this} to have a length above #{exp} but got #{act}', 'expected #{this} to not have a length above #{exp}', n, len);
        } else {
          this.assert(obj > n, 'expected #{this} to be above ' + n, 'expected #{this} to be at most ' + n);
        }
      }
      Assertion.addMethod('above', assertAbove);
      Assertion.addMethod('gt', assertAbove);
      Assertion.addMethod('greaterThan', assertAbove);
      function assertLeast(n, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        if (flag(this, 'doLength')) {
          new Assertion(obj, msg).to.have.property('length');
          var len = obj.length;
          this.assert(len >= n, 'expected #{this} to have a length at least #{exp} but got #{act}', 'expected #{this} to have a length below #{exp}', n, len);
        } else {
          this.assert(obj >= n, 'expected #{this} to be at least ' + n, 'expected #{this} to be below ' + n);
        }
      }
      Assertion.addMethod('least', assertLeast);
      Assertion.addMethod('gte', assertLeast);
      function assertBelow(n, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        if (flag(this, 'doLength')) {
          new Assertion(obj, msg).to.have.property('length');
          var len = obj.length;
          this.assert(len < n, 'expected #{this} to have a length below #{exp} but got #{act}', 'expected #{this} to not have a length below #{exp}', n, len);
        } else {
          this.assert(obj < n, 'expected #{this} to be below ' + n, 'expected #{this} to be at least ' + n);
        }
      }
      Assertion.addMethod('below', assertBelow);
      Assertion.addMethod('lt', assertBelow);
      Assertion.addMethod('lessThan', assertBelow);
      function assertMost(n, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        if (flag(this, 'doLength')) {
          new Assertion(obj, msg).to.have.property('length');
          var len = obj.length;
          this.assert(len <= n, 'expected #{this} to have a length at most #{exp} but got #{act}', 'expected #{this} to have a length above #{exp}', n, len);
        } else {
          this.assert(obj <= n, 'expected #{this} to be at most ' + n, 'expected #{this} to be above ' + n);
        }
      }
      Assertion.addMethod('most', assertMost);
      Assertion.addMethod('lte', assertMost);
      Assertion.addMethod('within', function(start, finish, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object'),
            range = start + '..' + finish;
        if (flag(this, 'doLength')) {
          new Assertion(obj, msg).to.have.property('length');
          var len = obj.length;
          this.assert(len >= start && len <= finish, 'expected #{this} to have a length within ' + range, 'expected #{this} to not have a length within ' + range);
        } else {
          this.assert(obj >= start && obj <= finish, 'expected #{this} to be within ' + range, 'expected #{this} to not be within ' + range);
        }
      });
      function assertInstanceOf(constructor, msg) {
        if (msg)
          flag(this, 'message', msg);
        var name = _.getName(constructor);
        this.assert(flag(this, 'object') instanceof constructor, 'expected #{this} to be an instance of ' + name, 'expected #{this} to not be an instance of ' + name);
      }
      ;
      Assertion.addMethod('instanceof', assertInstanceOf);
      Assertion.addMethod('instanceOf', assertInstanceOf);
      Assertion.addMethod('property', function(name, val, msg) {
        if (msg)
          flag(this, 'message', msg);
        var isDeep = !!flag(this, 'deep'),
            descriptor = isDeep ? 'deep property ' : 'property ',
            negate = flag(this, 'negate'),
            obj = flag(this, 'object'),
            pathInfo = isDeep ? _.getPathInfo(name, obj) : null,
            hasProperty = isDeep ? pathInfo.exists : _.hasProperty(name, obj),
            value = isDeep ? pathInfo.value : obj[name];
        if (negate && arguments.length > 1) {
          if (undefined === value) {
            msg = (msg != null) ? msg + ': ' : '';
            throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));
          }
        } else {
          this.assert(hasProperty, 'expected #{this} to have a ' + descriptor + _.inspect(name), 'expected #{this} to not have ' + descriptor + _.inspect(name));
        }
        if (arguments.length > 1) {
          this.assert(val === value, 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}', 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}', val, value);
        }
        flag(this, 'object', value);
      });
      function assertOwnProperty(name, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        this.assert(obj.hasOwnProperty(name), 'expected #{this} to have own property ' + _.inspect(name), 'expected #{this} to not have own property ' + _.inspect(name));
      }
      Assertion.addMethod('ownProperty', assertOwnProperty);
      Assertion.addMethod('haveOwnProperty', assertOwnProperty);
      function assertOwnPropertyDescriptor(name, descriptor, msg) {
        if (typeof descriptor === 'string') {
          msg = descriptor;
          descriptor = null;
        }
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        var actualDescriptor = Object.getOwnPropertyDescriptor(Object(obj), name);
        if (actualDescriptor && descriptor) {
          this.assert(_.eql(descriptor, actualDescriptor), 'expected the own property descriptor for ' + _.inspect(name) + ' on #{this} to match ' + _.inspect(descriptor) + ', got ' + _.inspect(actualDescriptor), 'expected the own property descriptor for ' + _.inspect(name) + ' on #{this} to not match ' + _.inspect(descriptor), descriptor, actualDescriptor, true);
        } else {
          this.assert(actualDescriptor, 'expected #{this} to have an own property descriptor for ' + _.inspect(name), 'expected #{this} to not have an own property descriptor for ' + _.inspect(name));
        }
        flag(this, 'object', actualDescriptor);
      }
      Assertion.addMethod('ownPropertyDescriptor', assertOwnPropertyDescriptor);
      Assertion.addMethod('haveOwnPropertyDescriptor', assertOwnPropertyDescriptor);
      function assertLengthChain() {
        flag(this, 'doLength', true);
      }
      function assertLength(n, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        new Assertion(obj, msg).to.have.property('length');
        var len = obj.length;
        this.assert(len == n, 'expected #{this} to have a length of #{exp} but got #{act}', 'expected #{this} to not have a length of #{act}', n, len);
      }
      Assertion.addChainableMethod('length', assertLength, assertLengthChain);
      Assertion.addMethod('lengthOf', assertLength);
      function assertMatch(re, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        this.assert(re.exec(obj), 'expected #{this} to match ' + re, 'expected #{this} not to match ' + re);
      }
      Assertion.addMethod('match', assertMatch);
      Assertion.addMethod('matches', assertMatch);
      Assertion.addMethod('string', function(str, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        new Assertion(obj, msg).is.a('string');
        this.assert(~obj.indexOf(str), 'expected #{this} to contain ' + _.inspect(str), 'expected #{this} to not contain ' + _.inspect(str));
      });
      function assertKeys(keys) {
        var obj = flag(this, 'object'),
            str,
            ok = true,
            mixedArgsMsg = 'keys must be given single argument of Array|Object|String, or multiple String arguments';
        switch (_.type(keys)) {
          case "array":
            if (arguments.length > 1)
              throw (new Error(mixedArgsMsg));
            break;
          case "object":
            if (arguments.length > 1)
              throw (new Error(mixedArgsMsg));
            keys = Object.keys(keys);
            break;
          default:
            keys = Array.prototype.slice.call(arguments);
        }
        if (!keys.length)
          throw new Error('keys required');
        var actual = Object.keys(obj),
            expected = keys,
            len = keys.length,
            any = flag(this, 'any'),
            all = flag(this, 'all');
        if (!any && !all) {
          all = true;
        }
        if (any) {
          var intersection = expected.filter(function(key) {
            return ~actual.indexOf(key);
          });
          ok = intersection.length > 0;
        }
        if (all) {
          ok = keys.every(function(key) {
            return ~actual.indexOf(key);
          });
          if (!flag(this, 'negate') && !flag(this, 'contains')) {
            ok = ok && keys.length == actual.length;
          }
        }
        if (len > 1) {
          keys = keys.map(function(key) {
            return _.inspect(key);
          });
          var last = keys.pop();
          if (all) {
            str = keys.join(', ') + ', and ' + last;
          }
          if (any) {
            str = keys.join(', ') + ', or ' + last;
          }
        } else {
          str = _.inspect(keys[0]);
        }
        str = (len > 1 ? 'keys ' : 'key ') + str;
        str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;
        this.assert(ok, 'expected #{this} to ' + str, 'expected #{this} to not ' + str, expected.slice(0).sort(), actual.sort(), true);
      }
      Assertion.addMethod('keys', assertKeys);
      Assertion.addMethod('key', assertKeys);
      function assertThrows(constructor, errMsg, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        new Assertion(obj, msg).is.a('function');
        var thrown = false,
            desiredError = null,
            name = null,
            thrownError = null;
        if (arguments.length === 0) {
          errMsg = null;
          constructor = null;
        } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {
          errMsg = constructor;
          constructor = null;
        } else if (constructor && constructor instanceof Error) {
          desiredError = constructor;
          constructor = null;
          errMsg = null;
        } else if (typeof constructor === 'function') {
          name = constructor.prototype.name;
          if (!name || (name === 'Error' && constructor !== Error)) {
            name = constructor.name || (new constructor()).name;
          }
        } else {
          constructor = null;
        }
        try {
          obj();
        } catch (err) {
          if (desiredError) {
            this.assert(err === desiredError, 'expected #{this} to throw #{exp} but #{act} was thrown', 'expected #{this} to not throw #{exp}', (desiredError instanceof Error ? desiredError.toString() : desiredError), (err instanceof Error ? err.toString() : err));
            flag(this, 'object', err);
            return this;
          }
          if (constructor) {
            this.assert(err instanceof constructor, 'expected #{this} to throw #{exp} but #{act} was thrown', 'expected #{this} to not throw #{exp} but #{act} was thrown', name, (err instanceof Error ? err.toString() : err));
            if (!errMsg) {
              flag(this, 'object', err);
              return this;
            }
          }
          var message = 'error' === _.type(err) && "message" in err ? err.message : '' + err;
          if ((message != null) && errMsg && errMsg instanceof RegExp) {
            this.assert(errMsg.exec(message), 'expected #{this} to throw error matching #{exp} but got #{act}', 'expected #{this} to throw error not matching #{exp}', errMsg, message);
            flag(this, 'object', err);
            return this;
          } else if ((message != null) && errMsg && 'string' === typeof errMsg) {
            this.assert(~message.indexOf(errMsg), 'expected #{this} to throw error including #{exp} but got #{act}', 'expected #{this} to throw error not including #{act}', errMsg, message);
            flag(this, 'object', err);
            return this;
          } else {
            thrown = true;
            thrownError = err;
          }
        }
        var actuallyGot = '',
            expectedThrown = name !== null ? name : desiredError ? '#{exp}' : 'an error';
        if (thrown) {
          actuallyGot = ' but #{act} was thrown';
        }
        this.assert(thrown === true, 'expected #{this} to throw ' + expectedThrown + actuallyGot, 'expected #{this} to not throw ' + expectedThrown + actuallyGot, (desiredError instanceof Error ? desiredError.toString() : desiredError), (thrownError instanceof Error ? thrownError.toString() : thrownError));
        flag(this, 'object', thrownError);
      }
      ;
      Assertion.addMethod('throw', assertThrows);
      Assertion.addMethod('throws', assertThrows);
      Assertion.addMethod('Throw', assertThrows);
      function respondTo(method, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object'),
            itself = flag(this, 'itself'),
            context = ('function' === _.type(obj) && !itself) ? obj.prototype[method] : obj[method];
        this.assert('function' === typeof context, 'expected #{this} to respond to ' + _.inspect(method), 'expected #{this} to not respond to ' + _.inspect(method));
      }
      Assertion.addMethod('respondTo', respondTo);
      Assertion.addMethod('respondsTo', respondTo);
      Assertion.addProperty('itself', function() {
        flag(this, 'itself', true);
      });
      function satisfy(matcher, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        var result = matcher(obj);
        this.assert(result, 'expected #{this} to satisfy ' + _.objDisplay(matcher), 'expected #{this} to not satisfy' + _.objDisplay(matcher), this.negate ? false : true, result);
      }
      Assertion.addMethod('satisfy', satisfy);
      Assertion.addMethod('satisfies', satisfy);
      function closeTo(expected, delta, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        new Assertion(obj, msg).is.a('number');
        if (_.type(expected) !== 'number' || _.type(delta) !== 'number') {
          throw new Error('the arguments to closeTo or approximately must be numbers');
        }
        this.assert(Math.abs(obj - expected) <= delta, 'expected #{this} to be close to ' + expected + ' +/- ' + delta, 'expected #{this} not to be close to ' + expected + ' +/- ' + delta);
      }
      Assertion.addMethod('closeTo', closeTo);
      Assertion.addMethod('approximately', closeTo);
      function isSubsetOf(subset, superset, cmp) {
        return subset.every(function(elem) {
          if (!cmp)
            return superset.indexOf(elem) !== -1;
          return superset.some(function(elem2) {
            return cmp(elem, elem2);
          });
        });
      }
      Assertion.addMethod('members', function(subset, msg) {
        if (msg)
          flag(this, 'message', msg);
        var obj = flag(this, 'object');
        new Assertion(obj).to.be.an('array');
        new Assertion(subset).to.be.an('array');
        var cmp = flag(this, 'deep') ? _.eql : undefined;
        if (flag(this, 'contains')) {
          return this.assert(isSubsetOf(subset, obj, cmp), 'expected #{this} to be a superset of #{act}', 'expected #{this} to not be a superset of #{act}', obj, subset);
        }
        this.assert(isSubsetOf(obj, subset, cmp) && isSubsetOf(subset, obj, cmp), 'expected #{this} to have the same members as #{act}', 'expected #{this} to not have the same members as #{act}', obj, subset);
      });
      function oneOf(list, msg) {
        if (msg)
          flag(this, 'message', msg);
        var expected = flag(this, 'object');
        new Assertion(list).to.be.an('array');
        this.assert(list.indexOf(expected) > -1, 'expected #{this} to be one of #{exp}', 'expected #{this} to not be one of #{exp}', list, expected);
      }
      Assertion.addMethod('oneOf', oneOf);
      function assertChanges(object, prop, msg) {
        if (msg)
          flag(this, 'message', msg);
        var fn = flag(this, 'object');
        new Assertion(object, msg).to.have.property(prop);
        new Assertion(fn).is.a('function');
        var initial = object[prop];
        fn();
        this.assert(initial !== object[prop], 'expected .' + prop + ' to change', 'expected .' + prop + ' to not change');
      }
      Assertion.addChainableMethod('change', assertChanges);
      Assertion.addChainableMethod('changes', assertChanges);
      function assertIncreases(object, prop, msg) {
        if (msg)
          flag(this, 'message', msg);
        var fn = flag(this, 'object');
        new Assertion(object, msg).to.have.property(prop);
        new Assertion(fn).is.a('function');
        var initial = object[prop];
        fn();
        this.assert(object[prop] - initial > 0, 'expected .' + prop + ' to increase', 'expected .' + prop + ' to not increase');
      }
      Assertion.addChainableMethod('increase', assertIncreases);
      Assertion.addChainableMethod('increases', assertIncreases);
      function assertDecreases(object, prop, msg) {
        if (msg)
          flag(this, 'message', msg);
        var fn = flag(this, 'object');
        new Assertion(object, msg).to.have.property(prop);
        new Assertion(fn).is.a('function');
        var initial = object[prop];
        fn();
        this.assert(object[prop] - initial < 0, 'expected .' + prop + ' to decrease', 'expected .' + prop + ' to not decrease');
      }
      Assertion.addChainableMethod('decrease', assertDecreases);
      Assertion.addChainableMethod('decreases', assertDecreases);
      Assertion.addProperty('extensible', function() {
        var obj = flag(this, 'object');
        var isExtensible;
        try {
          isExtensible = Object.isExtensible(obj);
        } catch (err) {
          if (err instanceof TypeError)
            isExtensible = false;
          else
            throw err;
        }
        this.assert(isExtensible, 'expected #{this} to be extensible', 'expected #{this} to not be extensible');
      });
      Assertion.addProperty('sealed', function() {
        var obj = flag(this, 'object');
        var isSealed;
        try {
          isSealed = Object.isSealed(obj);
        } catch (err) {
          if (err instanceof TypeError)
            isSealed = true;
          else
            throw err;
        }
        this.assert(isSealed, 'expected #{this} to be sealed', 'expected #{this} to not be sealed');
      });
      Assertion.addProperty('frozen', function() {
        var obj = flag(this, 'object');
        var isFrozen;
        try {
          isFrozen = Object.isFrozen(obj);
        } catch (err) {
          if (err instanceof TypeError)
            isFrozen = true;
          else
            throw err;
        }
        this.assert(isFrozen, 'expected #{this} to be frozen', 'expected #{this} to not be frozen');
      });
    };
  });
  var assertions$1 = interopDefault(assertions);
  var require$$3$2 = Object.freeze({default: assertions$1});
  var expect$1 = createCommonjsModule(function(module) {
    module.exports = function(chai, util) {
      chai.expect = function(val, message) {
        return new chai.Assertion(val, message);
      };
      chai.expect.fail = function(actual, expected, message, operator) {
        message = message || 'expect.fail()';
        throw new chai.AssertionError(message, {
          actual: actual,
          expected: expected,
          operator: operator
        }, chai.expect.fail);
      };
    };
  });
  var expect$2 = interopDefault(expect$1);
  var require$$2$5 = Object.freeze({default: expect$2});
  var should = createCommonjsModule(function(module) {
    module.exports = function(chai, util) {
      var Assertion = chai.Assertion;
      function loadShould() {
        function shouldGetter() {
          if (this instanceof String || this instanceof Number || this instanceof Boolean) {
            return new Assertion(this.valueOf(), null, shouldGetter);
          }
          return new Assertion(this, null, shouldGetter);
        }
        function shouldSetter(value) {
          Object.defineProperty(this, 'should', {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
          });
        }
        Object.defineProperty(Object.prototype, 'should', {
          set: shouldSetter,
          get: shouldGetter,
          configurable: true
        });
        var should = {};
        should.fail = function(actual, expected, message, operator) {
          message = message || 'should.fail()';
          throw new chai.AssertionError(message, {
            actual: actual,
            expected: expected,
            operator: operator
          }, should.fail);
        };
        should.equal = function(val1, val2, msg) {
          new Assertion(val1, msg).to.equal(val2);
        };
        should.Throw = function(fn, errt, errs, msg) {
          new Assertion(fn, msg).to.Throw(errt, errs);
        };
        should.exist = function(val, msg) {
          new Assertion(val, msg).to.exist;
        };
        should.not = {};
        should.not.equal = function(val1, val2, msg) {
          new Assertion(val1, msg).to.not.equal(val2);
        };
        should.not.Throw = function(fn, errt, errs, msg) {
          new Assertion(fn, msg).to.not.Throw(errt, errs);
        };
        should.not.exist = function(val, msg) {
          new Assertion(val, msg).to.not.exist;
        };
        should['throw'] = should['Throw'];
        should.not['throw'] = should.not['Throw'];
        return should;
      }
      ;
      chai.should = loadShould;
      chai.Should = loadShould;
    };
  });
  var should$1 = interopDefault(should);
  var require$$1$6 = Object.freeze({default: should$1});
  var assert = createCommonjsModule(function(module) {
    module.exports = function(chai, util) {
      var Assertion = chai.Assertion,
          flag = util.flag;
      var assert = chai.assert = function(express, errmsg) {
        var test = new Assertion(null, null, chai.assert);
        test.assert(express, errmsg, '[ negation message unavailable ]');
      };
      assert.fail = function(actual, expected, message, operator) {
        message = message || 'assert.fail()';
        throw new chai.AssertionError(message, {
          actual: actual,
          expected: expected,
          operator: operator
        }, assert.fail);
      };
      assert.isOk = function(val, msg) {
        new Assertion(val, msg).is.ok;
      };
      assert.isNotOk = function(val, msg) {
        new Assertion(val, msg).is.not.ok;
      };
      assert.equal = function(act, exp, msg) {
        var test = new Assertion(act, msg, assert.equal);
        test.assert(exp == flag(test, 'object'), 'expected #{this} to equal #{exp}', 'expected #{this} to not equal #{act}', exp, act);
      };
      assert.notEqual = function(act, exp, msg) {
        var test = new Assertion(act, msg, assert.notEqual);
        test.assert(exp != flag(test, 'object'), 'expected #{this} to not equal #{exp}', 'expected #{this} to equal #{act}', exp, act);
      };
      assert.strictEqual = function(act, exp, msg) {
        new Assertion(act, msg).to.equal(exp);
      };
      assert.notStrictEqual = function(act, exp, msg) {
        new Assertion(act, msg).to.not.equal(exp);
      };
      assert.deepEqual = function(act, exp, msg) {
        new Assertion(act, msg).to.eql(exp);
      };
      assert.notDeepEqual = function(act, exp, msg) {
        new Assertion(act, msg).to.not.eql(exp);
      };
      assert.isAbove = function(val, abv, msg) {
        new Assertion(val, msg).to.be.above(abv);
      };
      assert.isAtLeast = function(val, atlst, msg) {
        new Assertion(val, msg).to.be.least(atlst);
      };
      assert.isBelow = function(val, blw, msg) {
        new Assertion(val, msg).to.be.below(blw);
      };
      assert.isAtMost = function(val, atmst, msg) {
        new Assertion(val, msg).to.be.most(atmst);
      };
      assert.isTrue = function(val, msg) {
        new Assertion(val, msg).is['true'];
      };
      assert.isNotTrue = function(val, msg) {
        new Assertion(val, msg).to.not.equal(true);
      };
      assert.isFalse = function(val, msg) {
        new Assertion(val, msg).is['false'];
      };
      assert.isNotFalse = function(val, msg) {
        new Assertion(val, msg).to.not.equal(false);
      };
      assert.isNull = function(val, msg) {
        new Assertion(val, msg).to.equal(null);
      };
      assert.isNotNull = function(val, msg) {
        new Assertion(val, msg).to.not.equal(null);
      };
      assert.isNaN = function(val, msg) {
        new Assertion(val, msg).to.be.NaN;
      };
      assert.isNotNaN = function(val, msg) {
        new Assertion(val, msg).not.to.be.NaN;
      };
      assert.isUndefined = function(val, msg) {
        new Assertion(val, msg).to.equal(undefined);
      };
      assert.isDefined = function(val, msg) {
        new Assertion(val, msg).to.not.equal(undefined);
      };
      assert.isFunction = function(val, msg) {
        new Assertion(val, msg).to.be.a('function');
      };
      assert.isNotFunction = function(val, msg) {
        new Assertion(val, msg).to.not.be.a('function');
      };
      assert.isObject = function(val, msg) {
        new Assertion(val, msg).to.be.a('object');
      };
      assert.isNotObject = function(val, msg) {
        new Assertion(val, msg).to.not.be.a('object');
      };
      assert.isArray = function(val, msg) {
        new Assertion(val, msg).to.be.an('array');
      };
      assert.isNotArray = function(val, msg) {
        new Assertion(val, msg).to.not.be.an('array');
      };
      assert.isString = function(val, msg) {
        new Assertion(val, msg).to.be.a('string');
      };
      assert.isNotString = function(val, msg) {
        new Assertion(val, msg).to.not.be.a('string');
      };
      assert.isNumber = function(val, msg) {
        new Assertion(val, msg).to.be.a('number');
      };
      assert.isNotNumber = function(val, msg) {
        new Assertion(val, msg).to.not.be.a('number');
      };
      assert.isBoolean = function(val, msg) {
        new Assertion(val, msg).to.be.a('boolean');
      };
      assert.isNotBoolean = function(val, msg) {
        new Assertion(val, msg).to.not.be.a('boolean');
      };
      assert.typeOf = function(val, type, msg) {
        new Assertion(val, msg).to.be.a(type);
      };
      assert.notTypeOf = function(val, type, msg) {
        new Assertion(val, msg).to.not.be.a(type);
      };
      assert.instanceOf = function(val, type, msg) {
        new Assertion(val, msg).to.be.instanceOf(type);
      };
      assert.notInstanceOf = function(val, type, msg) {
        new Assertion(val, msg).to.not.be.instanceOf(type);
      };
      assert.include = function(exp, inc, msg) {
        new Assertion(exp, msg, assert.include).include(inc);
      };
      assert.notInclude = function(exp, inc, msg) {
        new Assertion(exp, msg, assert.notInclude).not.include(inc);
      };
      assert.match = function(exp, re, msg) {
        new Assertion(exp, msg).to.match(re);
      };
      assert.notMatch = function(exp, re, msg) {
        new Assertion(exp, msg).to.not.match(re);
      };
      assert.property = function(obj, prop, msg) {
        new Assertion(obj, msg).to.have.property(prop);
      };
      assert.notProperty = function(obj, prop, msg) {
        new Assertion(obj, msg).to.not.have.property(prop);
      };
      assert.deepProperty = function(obj, prop, msg) {
        new Assertion(obj, msg).to.have.deep.property(prop);
      };
      assert.notDeepProperty = function(obj, prop, msg) {
        new Assertion(obj, msg).to.not.have.deep.property(prop);
      };
      assert.propertyVal = function(obj, prop, val, msg) {
        new Assertion(obj, msg).to.have.property(prop, val);
      };
      assert.propertyNotVal = function(obj, prop, val, msg) {
        new Assertion(obj, msg).to.not.have.property(prop, val);
      };
      assert.deepPropertyVal = function(obj, prop, val, msg) {
        new Assertion(obj, msg).to.have.deep.property(prop, val);
      };
      assert.deepPropertyNotVal = function(obj, prop, val, msg) {
        new Assertion(obj, msg).to.not.have.deep.property(prop, val);
      };
      assert.lengthOf = function(exp, len, msg) {
        new Assertion(exp, msg).to.have.length(len);
      };
      assert.throws = function(fn, errt, errs, msg) {
        if ('string' === typeof errt || errt instanceof RegExp) {
          errs = errt;
          errt = null;
        }
        var assertErr = new Assertion(fn, msg).to.throw(errt, errs);
        return flag(assertErr, 'object');
      };
      assert.doesNotThrow = function(fn, type, msg) {
        if ('string' === typeof type) {
          msg = type;
          type = null;
        }
        new Assertion(fn, msg).to.not.Throw(type);
      };
      assert.operator = function(val, operator, val2, msg) {
        var ok;
        switch (operator) {
          case '==':
            ok = val == val2;
            break;
          case '===':
            ok = val === val2;
            break;
          case '>':
            ok = val > val2;
            break;
          case '>=':
            ok = val >= val2;
            break;
          case '<':
            ok = val < val2;
            break;
          case '<=':
            ok = val <= val2;
            break;
          case '!=':
            ok = val != val2;
            break;
          case '!==':
            ok = val !== val2;
            break;
          default:
            throw new Error('Invalid operator "' + operator + '"');
        }
        var test = new Assertion(ok, msg);
        test.assert(true === flag(test, 'object'), 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2), 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2));
      };
      assert.closeTo = function(act, exp, delta, msg) {
        new Assertion(act, msg).to.be.closeTo(exp, delta);
      };
      assert.approximately = function(act, exp, delta, msg) {
        new Assertion(act, msg).to.be.approximately(exp, delta);
      };
      assert.sameMembers = function(set1, set2, msg) {
        new Assertion(set1, msg).to.have.same.members(set2);
      };
      assert.sameDeepMembers = function(set1, set2, msg) {
        new Assertion(set1, msg).to.have.same.deep.members(set2);
      };
      assert.includeMembers = function(superset, subset, msg) {
        new Assertion(superset, msg).to.include.members(subset);
      };
      assert.includeDeepMembers = function(superset, subset, msg) {
        new Assertion(superset, msg).to.include.deep.members(subset);
      };
      assert.oneOf = function(inList, list, msg) {
        new Assertion(inList, msg).to.be.oneOf(list);
      };
      assert.changes = function(fn, obj, prop) {
        new Assertion(fn).to.change(obj, prop);
      };
      assert.doesNotChange = function(fn, obj, prop) {
        new Assertion(fn).to.not.change(obj, prop);
      };
      assert.increases = function(fn, obj, prop) {
        new Assertion(fn).to.increase(obj, prop);
      };
      assert.doesNotIncrease = function(fn, obj, prop) {
        new Assertion(fn).to.not.increase(obj, prop);
      };
      assert.decreases = function(fn, obj, prop) {
        new Assertion(fn).to.decrease(obj, prop);
      };
      assert.doesNotDecrease = function(fn, obj, prop) {
        new Assertion(fn).to.not.decrease(obj, prop);
      };
      assert.ifError = function(val) {
        if (val) {
          throw (val);
        }
      };
      assert.isExtensible = function(obj, msg) {
        new Assertion(obj, msg).to.be.extensible;
      };
      assert.isNotExtensible = function(obj, msg) {
        new Assertion(obj, msg).to.not.be.extensible;
      };
      assert.isSealed = function(obj, msg) {
        new Assertion(obj, msg).to.be.sealed;
      };
      assert.isNotSealed = function(obj, msg) {
        new Assertion(obj, msg).to.not.be.sealed;
      };
      assert.isFrozen = function(obj, msg) {
        new Assertion(obj, msg).to.be.frozen;
      };
      assert.isNotFrozen = function(obj, msg) {
        new Assertion(obj, msg).to.not.be.frozen;
      };
      (function alias(name, as) {
        assert[as] = assert[name];
        return alias;
      })('isOk', 'ok')('isNotOk', 'notOk')('throws', 'throw')('throws', 'Throw')('isExtensible', 'extensible')('isNotExtensible', 'notExtensible')('isSealed', 'sealed')('isNotSealed', 'notSealed')('isFrozen', 'frozen')('isNotFrozen', 'notFrozen');
    };
  });
  var assert$1 = interopDefault(assert);
  var require$$0$13 = Object.freeze({default: assert$1});
  var chai$1 = createCommonjsModule(function(module) {
    var used = [],
        exports = module.exports = {};
    exports.version = '3.5.0';
    exports.AssertionError = interopDefault(require$$2);
    var util = interopDefault(require$$6);
    exports.use = function(fn) {
      if (!~used.indexOf(fn)) {
        fn(this, util);
        used.push(fn);
      }
      return this;
    };
    exports.util = util;
    var config = interopDefault(require$$0$7);
    exports.config = config;
    var assertion = interopDefault(require$$4$2);
    exports.use(assertion);
    var core = interopDefault(require$$3$2);
    exports.use(core);
    var expect = interopDefault(require$$2$5);
    exports.use(expect);
    var should = interopDefault(require$$1$6);
    exports.use(should);
    var assert = interopDefault(require$$0$13);
    exports.use(assert);
  });
  var chai$2 = interopDefault(chai$1);
  var require$$0$2 = Object.freeze({default: chai$2});
  var index = createCommonjsModule(function(module) {
    module.exports = interopDefault(require$$0$2);
  });
  var chai = interopDefault(index);
  function createSpy(name) {
    var calls = [];
    var spy = function spy() {
      for (var _len = arguments.length,
          args = Array(_len),
          _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      calls.push([this].concat(args));
    };
    spy.calls = calls;
    Object.defineProperty(spy, 'name', {get: function get() {
        return name;
      }});
    return spy;
  }
  var index$11 = createCommonjsModule(function(module) {
    var s = 1000;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      if ('string' == typeof val)
        return parse(val);
      return options.long ? long(val) : short(val);
    };
    function parse(str) {
      str = '' + str;
      if (str.length > 10000)
        return;
      var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
      if (!match)
        return;
      var n = parseFloat(match[1]);
      var type = (match[2] || 'ms').toLowerCase();
      switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
          return n * y;
        case 'days':
        case 'day':
        case 'd':
          return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
          return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
          return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
          return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
          return n;
      }
    }
    function short(ms) {
      if (ms >= d)
        return Math.round(ms / d) + 'd';
      if (ms >= h)
        return Math.round(ms / h) + 'h';
      if (ms >= m)
        return Math.round(ms / m) + 'm';
      if (ms >= s)
        return Math.round(ms / s) + 's';
      return ms + 'ms';
    }
    function long(ms) {
      return plural(ms, d, 'day') || plural(ms, h, 'hour') || plural(ms, m, 'minute') || plural(ms, s, 'second') || ms + ' ms';
    }
    function plural(ms, n, name) {
      if (ms < n)
        return;
      if (ms < n * 1.5)
        return Math.floor(ms / n) + ' ' + name;
      return Math.ceil(ms / n) + ' ' + name + 's';
    }
  });
  var index$12 = interopDefault(index$11);
  var require$$0$14 = Object.freeze({default: index$12});
  var debug$1 = createCommonjsModule(function(module, exports) {
    exports = module.exports = debug;
    exports.coerce = coerce;
    exports.disable = disable;
    exports.enable = enable;
    exports.enabled = enabled;
    exports.humanize = interopDefault(require$$0$14);
    exports.names = [];
    exports.skips = [];
    exports.formatters = {};
    var prevColor = 0;
    var prevTime;
    function selectColor() {
      return exports.colors[prevColor++ % exports.colors.length];
    }
    function debug(namespace) {
      function disabled() {}
      disabled.enabled = false;
      function enabled() {
        var self = enabled;
        var curr = +new Date();
        var ms = curr - (prevTime || curr);
        self.diff = ms;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        if (null == self.useColors)
          self.useColors = exports.useColors();
        if (null == self.color && self.useColors)
          self.color = selectColor();
        var args = Array.prototype.slice.call(arguments);
        args[0] = exports.coerce(args[0]);
        if ('string' !== typeof args[0]) {
          args = ['%o'].concat(args);
        }
        var index = 0;
        args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
          if (match === '%%')
            return match;
          index++;
          var formatter = exports.formatters[format];
          if ('function' === typeof formatter) {
            var val = args[index];
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        if ('function' === typeof exports.formatArgs) {
          args = exports.formatArgs.apply(self, args);
        }
        var logFn = enabled.log || exports.log || console.log.bind(console);
        logFn.apply(self, args);
      }
      enabled.enabled = true;
      var fn = exports.enabled(namespace) ? enabled : disabled;
      fn.namespace = namespace;
      return fn;
    }
    function enable(namespaces) {
      exports.save(namespaces);
      var split = (namespaces || '').split(/[\s,]+/);
      var len = split.length;
      for (var i = 0; i < len; i++) {
        if (!split[i])
          continue;
        namespaces = split[i].replace(/\*/g, '.*?');
        if (namespaces[0] === '-') {
          exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
        } else {
          exports.names.push(new RegExp('^' + namespaces + '$'));
        }
      }
    }
    function disable() {
      exports.enable('');
    }
    function enabled(name) {
      var i,
          len;
      for (i = 0, len = exports.skips.length; i < len; i++) {
        if (exports.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports.names.length; i < len; i++) {
        if (exports.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error)
        return val.stack || val.message;
      return val;
    }
  });
  var debug$2 = interopDefault(debug$1);
  var formatters = debug$1.formatters;
  var skips = debug$1.skips;
  var names = debug$1.names;
  var humanize = debug$1.humanize;
  var enabled = debug$1.enabled;
  var enable = debug$1.enable;
  var disable = debug$1.disable;
  var coerce = debug$1.coerce;
  var require$$2$6 = Object.freeze({
    default: debug$2,
    formatters: formatters,
    skips: skips,
    names: names,
    humanize: humanize,
    enabled: enabled,
    enable: enable,
    disable: disable,
    coerce: coerce
  });
  var node = createCommonjsModule(function(module, exports) {
    var tty = interopDefault(require$$4);
    var util = interopDefault(require$$3);
    exports = module.exports = interopDefault(require$$2$6);
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.colors = [6, 2, 3, 4, 5, 1];
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    var stream = 1 === fd ? process.stdout : 2 === fd ? process.stderr : createWritableStdioStream(fd);
    function useColors() {
      var debugColors = (process.env.DEBUG_COLORS || '').trim().toLowerCase();
      if (0 === debugColors.length) {
        return tty.isatty(fd);
      } else {
        return '0' !== debugColors && 'no' !== debugColors && 'false' !== debugColors && 'disabled' !== debugColors;
      }
    }
    var inspect = (4 === util.inspect.length ? function(v, colors) {
      return util.inspect(v, void 0, void 0, colors);
    } : function(v, colors) {
      return util.inspect(v, {colors: colors});
    });
    exports.formatters.o = function(v) {
      return inspect(v, this.useColors).replace(/\s*\n\s*/g, ' ');
    };
    function formatArgs() {
      var args = arguments;
      var useColors = this.useColors;
      var name = this.namespace;
      if (useColors) {
        var c = this.color;
        args[0] = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m' + args[0] + '\u001b[3' + c + 'm' + ' +' + exports.humanize(this.diff) + '\u001b[0m';
      } else {
        args[0] = new Date().toUTCString() + ' ' + name + ' ' + args[0];
      }
      return args;
    }
    function log() {
      return stream.write(util.format.apply(this, arguments) + '\n');
    }
    function save(namespaces) {
      if (null == namespaces) {
        delete process.env.DEBUG;
      } else {
        process.env.DEBUG = namespaces;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function createWritableStdioStream(fd) {
      var stream;
      var tty_wrap = process.binding('tty_wrap');
      switch (tty_wrap.guessHandleType(fd)) {
        case 'TTY':
          stream = new tty.WriteStream(fd);
          stream._type = 'tty';
          if (stream._handle && stream._handle.unref) {
            stream._handle.unref();
          }
          break;
        case 'FILE':
          var fs = interopDefault(require$$1);
          stream = new fs.SyncWriteStream(fd, {autoClose: false});
          stream._type = 'fs';
          break;
        case 'PIPE':
        case 'TCP':
          var net = interopDefault(require$$0$1);
          stream = new net.Socket({
            fd: fd,
            readable: false,
            writable: true
          });
          stream.readable = false;
          stream.read = null;
          stream._type = 'pipe';
          if (stream._handle && stream._handle.unref) {
            stream._handle.unref();
          }
          break;
        default:
          throw new Error('Implement me. Unknown stream file type!');
      }
      stream.fd = fd;
      stream._isStdio = true;
      return stream;
    }
    exports.enable(load());
  });
  var debug = interopDefault(node);
  function indexOf(callbacks, callback) {
    for (var i = 0,
        l = callbacks.length; i < l; i++) {
      if (callbacks[i] === callback) {
        return i;
      }
    }
    return -1;
  }
  function callbacksFor(object) {
    var callbacks = object._promiseCallbacks;
    if (!callbacks) {
      callbacks = object._promiseCallbacks = {};
    }
    return callbacks;
  }
  var EventTarget = {
    'mixin': function(object) {
      object['on'] = this['on'];
      object['off'] = this['off'];
      object['trigger'] = this['trigger'];
      object._promiseCallbacks = undefined;
      return object;
    },
    'on': function(eventName, callback) {
      if (typeof callback !== 'function') {
        throw new TypeError('Callback must be a function');
      }
      var allCallbacks = callbacksFor(this),
          callbacks;
      callbacks = allCallbacks[eventName];
      if (!callbacks) {
        callbacks = allCallbacks[eventName] = [];
      }
      if (indexOf(callbacks, callback) === -1) {
        callbacks.push(callback);
      }
    },
    'off': function(eventName, callback) {
      var allCallbacks = callbacksFor(this),
          callbacks,
          index;
      if (!callback) {
        allCallbacks[eventName] = [];
        return;
      }
      callbacks = allCallbacks[eventName];
      index = indexOf(callbacks, callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    },
    'trigger': function(eventName, options, label) {
      var allCallbacks = callbacksFor(this),
          callbacks,
          callback;
      if (callbacks = allCallbacks[eventName]) {
        for (var i = 0; i < callbacks.length; i++) {
          callback = callbacks[i];
          callback(options, label);
        }
      }
    }
  };
  var config$2 = {instrument: false};
  EventTarget['mixin'](config$2);
  function configure(name, value) {
    if (name === 'onerror') {
      config$2['on']('error', value);
      return;
    }
    if (arguments.length === 2) {
      config$2[name] = value;
    } else {
      return config$2[name];
    }
  }
  function objectOrFunction(x) {
    return typeof x === 'function' || (typeof x === 'object' && x !== null);
  }
  function isFunction(x) {
    return typeof x === 'function';
  }
  function isMaybeThenable(x) {
    return typeof x === 'object' && x !== null;
  }
  var _isArray;
  if (!Array.isArray) {
    _isArray = function(x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    };
  } else {
    _isArray = Array.isArray;
  }
  var isArray = _isArray;
  var now = Date.now || function() {
    return new Date().getTime();
  };
  function F() {}
  var o_create = (Object.create || function(o) {
    if (arguments.length > 1) {
      throw new Error('Second argument not supported');
    }
    if (typeof o !== 'object') {
      throw new TypeError('Argument must be an object');
    }
    F.prototype = o;
    return new F();
  });
  var queue = [];
  function scheduleFlush() {
    setTimeout(function() {
      var entry;
      for (var i = 0; i < queue.length; i++) {
        entry = queue[i];
        var payload = entry.payload;
        payload.guid = payload.key + payload.id;
        payload.childGuid = payload.key + payload.childId;
        if (payload.error) {
          payload.stack = payload.error.stack;
        }
        config$2['trigger'](entry.name, entry.payload);
      }
      queue.length = 0;
    }, 50);
  }
  function instrument(eventName, promise, child) {
    if (1 === queue.push({
      name: eventName,
      payload: {
        key: promise._guidKey,
        id: promise._id,
        eventName: eventName,
        detail: promise._result,
        childId: child && child._id,
        label: promise._label,
        timeStamp: now(),
        error: config$2["instrument-with-stack"] ? new Error(promise._label) : null
      }
    })) {
      scheduleFlush();
    }
  }
  function resolve$1(object, label) {
    var Constructor = this;
    if (object && typeof object === 'object' && object.constructor === Constructor) {
      return object;
    }
    var promise = new Constructor(noop, label);
    resolve(promise, object);
    return promise;
  }
  function withOwnPromise() {
    return new TypeError('A promises callback cannot return that same promise.');
  }
  function noop() {}
  var PENDING = void 0;
  var FULFILLED = 1;
  var REJECTED = 2;
  var GET_THEN_ERROR = new ErrorObject();
  function getThen(promise) {
    try {
      return promise.then;
    } catch (error) {
      GET_THEN_ERROR.error = error;
      return GET_THEN_ERROR;
    }
  }
  function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
    try {
      then.call(value, fulfillmentHandler, rejectionHandler);
    } catch (e) {
      return e;
    }
  }
  function handleForeignThenable(promise, thenable, then) {
    config$2.async(function(promise) {
      var sealed = false;
      var error = tryThen(then, thenable, function(value) {
        if (sealed) {
          return;
        }
        sealed = true;
        if (thenable !== value) {
          resolve(promise, value, undefined);
        } else {
          fulfill(promise, value);
        }
      }, function(reason) {
        if (sealed) {
          return;
        }
        sealed = true;
        reject(promise, reason);
      }, 'Settle: ' + (promise._label || ' unknown promise'));
      if (!sealed && error) {
        sealed = true;
        reject(promise, error);
      }
    }, promise);
  }
  function handleOwnThenable(promise, thenable) {
    if (thenable._state === FULFILLED) {
      fulfill(promise, thenable._result);
    } else if (thenable._state === REJECTED) {
      thenable._onError = null;
      reject(promise, thenable._result);
    } else {
      subscribe(thenable, undefined, function(value) {
        if (thenable !== value) {
          resolve(promise, value, undefined);
        } else {
          fulfill(promise, value);
        }
      }, function(reason) {
        reject(promise, reason);
      });
    }
  }
  function handleMaybeThenable(promise, maybeThenable, then$$) {
    if (maybeThenable.constructor === promise.constructor && then$$ === then && constructor.resolve === resolve$1) {
      handleOwnThenable(promise, maybeThenable);
    } else {
      if (then$$ === GET_THEN_ERROR) {
        reject(promise, GET_THEN_ERROR.error);
      } else if (then$$ === undefined) {
        fulfill(promise, maybeThenable);
      } else if (isFunction(then$$)) {
        handleForeignThenable(promise, maybeThenable, then$$);
      } else {
        fulfill(promise, maybeThenable);
      }
    }
  }
  function resolve(promise, value) {
    if (promise === value) {
      fulfill(promise, value);
    } else if (objectOrFunction(value)) {
      handleMaybeThenable(promise, value, getThen(value));
    } else {
      fulfill(promise, value);
    }
  }
  function publishRejection(promise) {
    if (promise._onError) {
      promise._onError(promise._result);
    }
    publish(promise);
  }
  function fulfill(promise, value) {
    if (promise._state !== PENDING) {
      return;
    }
    promise._result = value;
    promise._state = FULFILLED;
    if (promise._subscribers.length === 0) {
      if (config$2.instrument) {
        instrument('fulfilled', promise);
      }
    } else {
      config$2.async(publish, promise);
    }
  }
  function reject(promise, reason) {
    if (promise._state !== PENDING) {
      return;
    }
    promise._state = REJECTED;
    promise._result = reason;
    config$2.async(publishRejection, promise);
  }
  function subscribe(parent, child, onFulfillment, onRejection) {
    var subscribers = parent._subscribers;
    var length = subscribers.length;
    parent._onError = null;
    subscribers[length] = child;
    subscribers[length + FULFILLED] = onFulfillment;
    subscribers[length + REJECTED] = onRejection;
    if (length === 0 && parent._state) {
      config$2.async(publish, parent);
    }
  }
  function publish(promise) {
    var subscribers = promise._subscribers;
    var settled = promise._state;
    if (config$2.instrument) {
      instrument(settled === FULFILLED ? 'fulfilled' : 'rejected', promise);
    }
    if (subscribers.length === 0) {
      return;
    }
    var child,
        callback,
        detail = promise._result;
    for (var i = 0; i < subscribers.length; i += 3) {
      child = subscribers[i];
      callback = subscribers[i + settled];
      if (child) {
        invokeCallback(settled, child, callback, detail);
      } else {
        callback(detail);
      }
    }
    promise._subscribers.length = 0;
  }
  function ErrorObject() {
    this.error = null;
  }
  var TRY_CATCH_ERROR = new ErrorObject();
  function tryCatch(callback, detail) {
    try {
      return callback(detail);
    } catch (e) {
      TRY_CATCH_ERROR.error = e;
      return TRY_CATCH_ERROR;
    }
  }
  function invokeCallback(settled, promise, callback, detail) {
    var hasCallback = isFunction(callback),
        value,
        error,
        succeeded,
        failed;
    if (hasCallback) {
      value = tryCatch(callback, detail);
      if (value === TRY_CATCH_ERROR) {
        failed = true;
        error = value.error;
        value = null;
      } else {
        succeeded = true;
      }
      if (promise === value) {
        reject(promise, withOwnPromise());
        return;
      }
    } else {
      value = detail;
      succeeded = true;
    }
    if (promise._state !== PENDING) {} else if (hasCallback && succeeded) {
      resolve(promise, value);
    } else if (failed) {
      reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      reject(promise, value);
    }
  }
  function initializePromise(promise, resolver) {
    var resolved = false;
    try {
      resolver(function resolvePromise(value) {
        if (resolved) {
          return;
        }
        resolved = true;
        resolve(promise, value);
      }, function rejectPromise(reason) {
        if (resolved) {
          return;
        }
        resolved = true;
        reject(promise, reason);
      });
    } catch (e) {
      reject(promise, e);
    }
  }
  function then(onFulfillment, onRejection, label) {
    var parent = this;
    var state = parent._state;
    if (state === FULFILLED && !onFulfillment || state === REJECTED && !onRejection) {
      config$2.instrument && instrument('chained', parent, parent);
      return parent;
    }
    parent._onError = null;
    var child = new parent.constructor(noop, label);
    var result = parent._result;
    config$2.instrument && instrument('chained', parent, child);
    if (state) {
      var callback = arguments[state - 1];
      config$2.async(function() {
        invokeCallback(state, child, callback, result);
      });
    } else {
      subscribe(parent, child, onFulfillment, onRejection);
    }
    return child;
  }
  function makeSettledResult(state, position, value) {
    if (state === FULFILLED) {
      return {
        state: 'fulfilled',
        value: value
      };
    } else {
      return {
        state: 'rejected',
        reason: value
      };
    }
  }
  function Enumerator(Constructor, input, abortOnReject, label) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop, label);
    this._abortOnReject = abortOnReject;
    if (this._validateInput(input)) {
      this._input = input;
      this.length = input.length;
      this._remaining = input.length;
      this._init();
      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate();
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, this._validationError());
    }
  }
  Enumerator.prototype._validateInput = function(input) {
    return isArray(input);
  };
  Enumerator.prototype._validationError = function() {
    return new Error('Array Methods must be provided an Array');
  };
  Enumerator.prototype._init = function() {
    this._result = new Array(this.length);
  };
  Enumerator.prototype._enumerate = function() {
    var length = this.length;
    var promise = this.promise;
    var input = this._input;
    for (var i = 0; promise._state === PENDING && i < length; i++) {
      this._eachEntry(input[i], i);
    }
  };
  Enumerator.prototype._settleMaybeThenable = function(entry, i) {
    var c = this._instanceConstructor;
    var resolve = c.resolve;
    if (resolve === resolve$1) {
      var then$$ = getThen(entry);
      if (then$$ === then && entry._state !== PENDING) {
        entry._onError = null;
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof then$$ !== 'function') {
        this._remaining--;
        this._result[i] = this._makeResult(FULFILLED, i, entry);
      } else if (c === Promise$1) {
        var promise = new c(noop);
        handleMaybeThenable(promise, entry, then$$);
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function(resolve) {
          resolve(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve(entry), i);
    }
  };
  Enumerator.prototype._eachEntry = function(entry, i) {
    if (isMaybeThenable(entry)) {
      this._settleMaybeThenable(entry, i);
    } else {
      this._remaining--;
      this._result[i] = this._makeResult(FULFILLED, i, entry);
    }
  };
  Enumerator.prototype._settledAt = function(state, i, value) {
    var promise = this.promise;
    if (promise._state === PENDING) {
      this._remaining--;
      if (this._abortOnReject && state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = this._makeResult(state, i, value);
      }
    }
    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };
  Enumerator.prototype._makeResult = function(state, i, value) {
    return value;
  };
  Enumerator.prototype._willSettleAt = function(promise, i) {
    var enumerator = this;
    subscribe(promise, undefined, function(value) {
      enumerator._settledAt(FULFILLED, i, value);
    }, function(reason) {
      enumerator._settledAt(REJECTED, i, reason);
    });
  };
  function all(entries, label) {
    return new Enumerator(this, entries, true, label).promise;
  }
  function race(entries, label) {
    var Constructor = this;
    var promise = new Constructor(noop, label);
    if (!isArray(entries)) {
      reject(promise, new TypeError('You must pass an array to race.'));
      return promise;
    }
    var length = entries.length;
    function onFulfillment(value) {
      resolve(promise, value);
    }
    function onRejection(reason) {
      reject(promise, reason);
    }
    for (var i = 0; promise._state === PENDING && i < length; i++) {
      subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
    }
    return promise;
  }
  function reject$1(reason, label) {
    var Constructor = this;
    var promise = new Constructor(noop, label);
    reject(promise, reason);
    return promise;
  }
  var guidKey = 'rsvp_' + now() + '-';
  var counter = 0;
  function needsResolver() {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }
  function needsNew() {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }
  function Promise$1(resolver, label) {
    this._id = counter++;
    this._label = label;
    this._state = undefined;
    this._result = undefined;
    this._subscribers = [];
    config$2.instrument && instrument('created', this);
    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise$1 ? initializePromise(this, resolver) : needsNew();
    }
  }
  Promise$1.cast = resolve$1;
  Promise$1.all = all;
  Promise$1.race = race;
  Promise$1.resolve = resolve$1;
  Promise$1.reject = reject$1;
  Promise$1.prototype = {
    constructor: Promise$1,
    _guidKey: guidKey,
    _onError: function(reason) {
      var promise = this;
      config$2.after(function() {
        if (promise._onError) {
          config$2['trigger']('error', reason, promise._label);
        }
      });
    },
    then: then,
    'catch': function(onRejection, label) {
      return this.then(undefined, onRejection, label);
    },
    'finally': function(callback, label) {
      var promise = this;
      var constructor = promise.constructor;
      return promise.then(function(value) {
        return constructor.resolve(callback()).then(function() {
          return value;
        });
      }, function(reason) {
        return constructor.resolve(callback()).then(function() {
          return constructor.reject(reason);
        });
      }, label);
    }
  };
  function Result() {
    this.value = undefined;
  }
  var ERROR = new Result();
  var GET_THEN_ERROR$1 = new Result();
  function getThen$1(obj) {
    try {
      return obj.then;
    } catch (error) {
      ERROR.value = error;
      return ERROR;
    }
  }
  function tryApply(f, s, a) {
    try {
      f.apply(s, a);
    } catch (error) {
      ERROR.value = error;
      return ERROR;
    }
  }
  function makeObject(_, argumentNames) {
    var obj = {};
    var name;
    var i;
    var length = _.length;
    var args = new Array(length);
    for (var x = 0; x < length; x++) {
      args[x] = _[x];
    }
    for (i = 0; i < argumentNames.length; i++) {
      name = argumentNames[i];
      obj[name] = args[i + 1];
    }
    return obj;
  }
  function arrayResult(_) {
    var length = _.length;
    var args = new Array(length - 1);
    for (var i = 1; i < length; i++) {
      args[i - 1] = _[i];
    }
    return args;
  }
  function wrapThenable(then, promise) {
    return {then: function(onFulFillment, onRejection) {
        return then.call(promise, onFulFillment, onRejection);
      }};
  }
  function denodeify(nodeFunc, options) {
    var fn = function() {
      var self = this;
      var l = arguments.length;
      var args = new Array(l + 1);
      var arg;
      var promiseInput = false;
      for (var i = 0; i < l; ++i) {
        arg = arguments[i];
        if (!promiseInput) {
          promiseInput = needsPromiseInput(arg);
          if (promiseInput === GET_THEN_ERROR$1) {
            var p = new Promise$1(noop);
            reject(p, GET_THEN_ERROR$1.value);
            return p;
          } else if (promiseInput && promiseInput !== true) {
            arg = wrapThenable(promiseInput, arg);
          }
        }
        args[i] = arg;
      }
      var promise = new Promise$1(noop);
      args[l] = function(err, val) {
        if (err)
          reject(promise, err);
        else if (options === undefined)
          resolve(promise, val);
        else if (options === true)
          resolve(promise, arrayResult(arguments));
        else if (isArray(options))
          resolve(promise, makeObject(arguments, options));
        else
          resolve(promise, val);
      };
      if (promiseInput) {
        return handlePromiseInput(promise, args, nodeFunc, self);
      } else {
        return handleValueInput(promise, args, nodeFunc, self);
      }
    };
    fn.__proto__ = nodeFunc;
    return fn;
  }
  function handleValueInput(promise, args, nodeFunc, self) {
    var result = tryApply(nodeFunc, self, args);
    if (result === ERROR) {
      reject(promise, result.value);
    }
    return promise;
  }
  function handlePromiseInput(promise, args, nodeFunc, self) {
    return Promise$1.all(args).then(function(args) {
      var result = tryApply(nodeFunc, self, args);
      if (result === ERROR) {
        reject(promise, result.value);
      }
      return promise;
    });
  }
  function needsPromiseInput(arg) {
    if (arg && typeof arg === 'object') {
      if (arg.constructor === Promise$1) {
        return true;
      } else {
        return getThen$1(arg);
      }
    } else {
      return false;
    }
  }
  function all$1(array, label) {
    return Promise$1.all(array, label);
  }
  function AllSettled(Constructor, entries, label) {
    this._superConstructor(Constructor, entries, false, label);
  }
  AllSettled.prototype = o_create(Enumerator.prototype);
  AllSettled.prototype._superConstructor = Enumerator;
  AllSettled.prototype._makeResult = makeSettledResult;
  AllSettled.prototype._validationError = function() {
    return new Error('allSettled must be called with an array');
  };
  function allSettled(entries, label) {
    return new AllSettled(Promise$1, entries, label).promise;
  }
  function race$1(array, label) {
    return Promise$1.race(array, label);
  }
  function PromiseHash(Constructor, object, label) {
    this._superConstructor(Constructor, object, true, label);
  }
  PromiseHash.prototype = o_create(Enumerator.prototype);
  PromiseHash.prototype._superConstructor = Enumerator;
  PromiseHash.prototype._init = function() {
    this._result = {};
  };
  PromiseHash.prototype._validateInput = function(input) {
    return input && typeof input === 'object';
  };
  PromiseHash.prototype._validationError = function() {
    return new Error('Promise.hash must be called with an object');
  };
  PromiseHash.prototype._enumerate = function() {
    var enumerator = this;
    var promise = enumerator.promise;
    var input = enumerator._input;
    var results = [];
    for (var key in input) {
      if (promise._state === PENDING && Object.prototype.hasOwnProperty.call(input, key)) {
        results.push({
          position: key,
          entry: input[key]
        });
      }
    }
    var length = results.length;
    enumerator._remaining = length;
    var result;
    for (var i = 0; promise._state === PENDING && i < length; i++) {
      result = results[i];
      enumerator._eachEntry(result.entry, result.position);
    }
  };
  function hash(object, label) {
    return new PromiseHash(Promise$1, object, label).promise;
  }
  function HashSettled(Constructor, object, label) {
    this._superConstructor(Constructor, object, false, label);
  }
  HashSettled.prototype = o_create(PromiseHash.prototype);
  HashSettled.prototype._superConstructor = Enumerator;
  HashSettled.prototype._makeResult = makeSettledResult;
  HashSettled.prototype._validationError = function() {
    return new Error('hashSettled must be called with an object');
  };
  function hashSettled(object, label) {
    return new HashSettled(Promise$1, object, label).promise;
  }
  function rethrow(reason) {
    setTimeout(function() {
      throw reason;
    });
    throw reason;
  }
  function defer(label) {
    var deferred = {};
    deferred['promise'] = new Promise$1(function(resolve, reject) {
      deferred['resolve'] = resolve;
      deferred['reject'] = reject;
    }, label);
    return deferred;
  }
  function map(promises, mapFn, label) {
    return Promise$1.all(promises, label).then(function(values) {
      if (!isFunction(mapFn)) {
        throw new TypeError("You must pass a function as map's second argument.");
      }
      var length = values.length;
      var results = new Array(length);
      for (var i = 0; i < length; i++) {
        results[i] = mapFn(values[i]);
      }
      return Promise$1.all(results, label);
    });
  }
  function resolve$2(value, label) {
    return Promise$1.resolve(value, label);
  }
  function reject$2(reason, label) {
    return Promise$1.reject(reason, label);
  }
  function filter(promises, filterFn, label) {
    return Promise$1.all(promises, label).then(function(values) {
      if (!isFunction(filterFn)) {
        throw new TypeError("You must pass a function as filter's second argument.");
      }
      var length = values.length;
      var filtered = new Array(length);
      for (var i = 0; i < length; i++) {
        filtered[i] = filterFn(values[i]);
      }
      return Promise$1.all(filtered, label).then(function(filtered) {
        var results = new Array(length);
        var newLength = 0;
        for (var i = 0; i < length; i++) {
          if (filtered[i]) {
            results[newLength] = values[i];
            newLength++;
          }
        }
        results.length = newLength;
        return results;
      });
    });
  }
  var len = 0;
  var vertxNext;
  function asap(callback, arg) {
    queue$1[len] = callback;
    queue$1[len + 1] = arg;
    len += 2;
    if (len === 2) {
      scheduleFlush$1();
    }
  }
  var browserWindow = (typeof window !== 'undefined') ? window : undefined;
  var browserGlobal = browserWindow || {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
  function useNextTick() {
    var nextTick = process.nextTick;
    var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
    if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
      nextTick = setImmediate;
    }
    return function() {
      nextTick(flush);
    };
  }
  function useVertxTimer() {
    return function() {
      vertxNext(flush);
    };
  }
  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }
  function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function() {
      channel.port2.postMessage(0);
    };
  }
  function useSetTimeout() {
    return function() {
      setTimeout(flush, 1);
    };
  }
  var queue$1 = new Array(1000);
  function flush() {
    for (var i = 0; i < len; i += 2) {
      var callback = queue$1[i];
      var arg = queue$1[i + 1];
      callback(arg);
      queue$1[i] = undefined;
      queue$1[i + 1] = undefined;
    }
    len = 0;
  }
  function attemptVertex() {
    try {
      var r = require;
      var vertx = r('vertx');
      vertxNext = vertx.runOnLoop || vertx.runOnContext;
      return useVertxTimer();
    } catch (e) {
      return useSetTimeout();
    }
  }
  var scheduleFlush$1;
  if (isNode) {
    scheduleFlush$1 = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush$1 = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush$1 = useMessageChannel();
  } else if (browserWindow === undefined && typeof require === 'function') {
    scheduleFlush$1 = attemptVertex();
  } else {
    scheduleFlush$1 = useSetTimeout();
  }
  config$2.async = asap;
  config$2.after = function(cb) {
    setTimeout(cb, 0);
  };
  var cast = resolve$2;
  function async(callback, arg) {
    config$2.async(callback, arg);
  }
  function on() {
    config$2['on'].apply(config$2, arguments);
  }
  function off() {
    config$2['off'].apply(config$2, arguments);
  }
  if (typeof window !== 'undefined' && typeof window['__PROMISE_INSTRUMENTATION__'] === 'object') {
    var callbacks = window['__PROMISE_INSTRUMENTATION__'];
    configure('instrument', true);
    for (var eventName in callbacks) {
      if (callbacks.hasOwnProperty(eventName)) {
        on(eventName, callbacks[eventName]);
      }
    }
  }
  var require$$1$7 = Object.freeze({
    cast: cast,
    Promise: Promise$1,
    EventTarget: EventTarget,
    all: all$1,
    allSettled: allSettled,
    race: race$1,
    hash: hash,
    hashSettled: hashSettled,
    rethrow: rethrow,
    defer: defer,
    denodeify: denodeify,
    configure: configure,
    on: on,
    off: off,
    resolve: resolve$2,
    reject: reject$2,
    async: async,
    map: map,
    filter: filter
  });
  var _args = [[{
    "raw": "heimdalljs@^0.1.1",
    "scope": null,
    "escapedName": "heimdalljs",
    "name": "heimdalljs",
    "rawSpec": "^0.1.1",
    "spec": ">=0.1.1 <0.2.0",
    "type": "range"
  }, "/Users/dhamilto/devel/heimdalljs/heimdalljs-logger"]];
  var _from = "heimdalljs@>=0.1.1 <0.2.0";
  var _id = "heimdalljs@0.1.1";
  var _inCache = true;
  var _installable = true;
  var _location = "/heimdalljs";
  var _nodeVersion = "4.4.5";
  var _npmOperationalInternal = {
    "host": "packages-12-west.internal.npmjs.com",
    "tmp": "tmp/heimdalljs-0.1.1.tgz_1470088961013_0.7430886796209961"
  };
  var _npmUser = {
    "name": "hjdivad",
    "email": "npm@hjdivad.com"
  };
  var _npmVersion = "3.10.5";
  var _phantomChildren = {};
  var _requested = {
    "raw": "heimdalljs@^0.1.1",
    "scope": null,
    "escapedName": "heimdalljs",
    "name": "heimdalljs",
    "rawSpec": "^0.1.1",
    "spec": ">=0.1.1 <0.2.0",
    "type": "range"
  };
  var _requiredBy = ["/"];
  var _resolved = "https://registry.npmjs.org/heimdalljs/-/heimdalljs-0.1.1.tgz";
  var _shasum = "60068bf56882af17d803d27d524a720c9c80787a";
  var _shrinkwrap = null;
  var _spec = "heimdalljs@^0.1.1";
  var _where = "/Users/dhamilto/devel/heimdalljs/heimdalljs-logger";
  var author = "";
  var bugs = {"url": "https://github.com/hjdivad/heimdalljs-lib/issues"};
  var dependencies = {
    "rsvp": "^3.2.1",
    "semver": "^5.2.0"
  };
  var description = "Structured instrumentation library";
  var devDependencies = {
    "broccoli": "^0.16.9",
    "chai": "^3.2.0",
    "chai-as-promised": "^5.1.0",
    "chai-files": "^1.2.0",
    "mocha": "^2.2.5",
    "mocha-jshint": "~2.2.3"
  };
  var directories = {};
  var dist = {
    "shasum": "60068bf56882af17d803d27d524a720c9c80787a",
    "tarball": "https://registry.npmjs.org/heimdalljs/-/heimdalljs-0.1.1.tgz"
  };
  var gitHead = "64f06b377daac048204ec6227133f6efad44f510";
  var homepage = "https://github.com/hjdivad/heimdalljs-lib#readme";
  var keywords = ["javascript"];
  var license = "MIT";
  var main = "index.js";
  var maintainers = [{
    "name": "hjdivad",
    "email": "npm@hjdivad.com"
  }, {
    "name": "stefanpenner",
    "email": "stefan.penner@gmail.com"
  }];
  var name = "heimdalljs";
  var optionalDependencies = {};
  var readme = "ERROR: No README data found!";
  var repository = {
    "type": "git",
    "url": "git+https://github.com/heimdalljs/heimdalljs-lib.git"
  };
  var scripts = {
    "test": "mocha tests/",
    "test:debug": "mocha --no-timeouts debug tests/"
  };
  var version = "0.1.1";
  var _package = {
    _args: _args,
    _from: _from,
    _id: _id,
    _inCache: _inCache,
    _installable: _installable,
    _location: _location,
    _nodeVersion: _nodeVersion,
    _npmOperationalInternal: _npmOperationalInternal,
    _npmUser: _npmUser,
    _npmVersion: _npmVersion,
    _phantomChildren: _phantomChildren,
    _requested: _requested,
    _requiredBy: _requiredBy,
    _resolved: _resolved,
    _shasum: _shasum,
    _shrinkwrap: _shrinkwrap,
    _spec: _spec,
    _where: _where,
    author: author,
    bugs: bugs,
    dependencies: dependencies,
    description: description,
    devDependencies: devDependencies,
    directories: directories,
    dist: dist,
    gitHead: gitHead,
    homepage: homepage,
    keywords: keywords,
    license: license,
    main: main,
    maintainers: maintainers,
    name: name,
    optionalDependencies: optionalDependencies,
    readme: readme,
    repository: repository,
    scripts: scripts,
    version: version
  };
  var require$$0$15 = Object.freeze({
    _args: _args,
    _from: _from,
    _id: _id,
    _inCache: _inCache,
    _installable: _installable,
    _location: _location,
    _nodeVersion: _nodeVersion,
    _npmOperationalInternal: _npmOperationalInternal,
    _npmUser: _npmUser,
    _npmVersion: _npmVersion,
    _phantomChildren: _phantomChildren,
    _requested: _requested,
    _requiredBy: _requiredBy,
    _resolved: _resolved,
    _shasum: _shasum,
    _shrinkwrap: _shrinkwrap,
    _spec: _spec,
    _where: _where,
    author: author,
    bugs: bugs,
    dependencies: dependencies,
    description: description,
    devDependencies: devDependencies,
    directories: directories,
    dist: dist,
    gitHead: gitHead,
    homepage: homepage,
    keywords: keywords,
    license: license,
    main: main,
    maintainers: maintainers,
    name: name,
    optionalDependencies: optionalDependencies,
    readme: readme,
    repository: repository,
    scripts: scripts,
    version: version,
    default: _package
  });
  var heimdall$1 = createCommonjsModule(function(module) {
    'use strict';
    var RSVP = interopDefault(require$$1$7);
    var VERSION = interopDefault(require$$0$15).version;
    module.exports = Heimdall;
    function Heimdall() {
      this.version = VERSION;
      this._reset();
    }
    Object.defineProperty(Heimdall.prototype, 'current', {get: function() {
        return this._current;
      }});
    Heimdall.prototype._reset = function() {
      this._nextId = 0;
      this._current = undefined;
      this._previousTime = undefined;
      this.start('heimdall');
      this._root = this._current;
      this._monitorSchema = {};
      this._configs = {};
    };
    Heimdall.prototype.start = function(name, Schema) {
      var id;
      var data;
      if (typeof name === 'string') {
        id = {name: name};
      } else {
        id = name;
      }
      if (typeof Schema === 'function') {
        data = new Schema();
      } else {
        data = {};
      }
      this._recordTime();
      var node = new HeimdallNode(this, id, data, this._current);
      if (this._current) {
        this._current.addChild(node);
      }
      this._current = node;
      return new Cookie(node, this);
    };
    Heimdall.prototype._recordTime = function() {
      var time = process.hrtime();
      if (this._current) {
        var delta = (time[0] - this._previousTime[0]) * 1e9 + (time[1] - this._previousTime[1]);
        this._current.stats.time.self += delta;
      }
      this._previousTime = time;
    };
    Heimdall.prototype.node = function(name, Schema, callback, context) {
      if (arguments.length < 3) {
        callback = Schema;
        Schema = undefined;
      }
      var cookie = this.start(name, Schema);
      return new RSVP.Promise(function(resolve) {
        resolve(callback.call(context, cookie.node.stats.own));
      }).finally(function() {
        cookie.stop();
      });
    };
    Heimdall.prototype.registerMonitor = function(name, Schema) {
      if (name === 'own' || name === 'time') {
        throw new Error('Cannot register monitor at namespace "' + name + '".  "own" and "time" are reserved');
      }
      if (this._monitorSchema[name]) {
        throw new Error('A monitor for "' + name + '" is already registered"');
      }
      this._monitorSchema[name] = Schema;
    };
    Heimdall.prototype.statsFor = function(name) {
      var stats = this._current.stats;
      var Schema;
      if (!stats[name]) {
        Schema = this._monitorSchema[name];
        if (!Schema) {
          throw new Error('No monitor registered for "' + name + '"');
        }
        stats[name] = new Schema();
      }
      return stats[name];
    };
    Heimdall.prototype.configFor = function configFor(name) {
      var config = this._configs[name];
      if (!config) {
        config = this._configs[name] = {};
      }
      return config;
    };
    Heimdall.prototype.toJSON = function() {
      var result = [];
      this.visitPreOrder(function(node) {
        result.push(node.toJSON());
      });
      return {nodes: result};
      ;
    };
    Heimdall.prototype.visitPreOrder = function(cb) {
      this._root.visitPreOrder(cb);
    };
    Heimdall.prototype.visitPostOrder = function(cb) {
      this._root.visitPostOrder(cb);
    };
    Heimdall.prototype._createStats = function(data) {
      var stats = {
        own: data,
        time: {self: 0}
      };
      return stats;
    };
    Object.defineProperty(Heimdall.prototype, 'stack', {get: function() {
        var stack = [];
        var top = this._current;
        while (top !== undefined && top !== this._root) {
          stack.unshift(top);
          top = top.parent;
        }
        return stack.map(function(node) {
          return node.id.name;
        });
      }});
    function HeimdallNode(heimdall, id, data, parent) {
      this.heimdall = heimdall;
      this.id = id;
      this._id = heimdall._nextId++;
      this.stats = this.heimdall._createStats(data);
      this.children = [];
      this.parent = parent;
    }
    Object.defineProperty(HeimdallNode.prototype, 'isRoot', {get() {
        return this.parent === undefined;
      }});
    HeimdallNode.prototype.visitPreOrder = function(cb) {
      cb(this);
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].visitPreOrder(cb);
      }
    };
    HeimdallNode.prototype.visitPostOrder = function(cb) {
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].visitPostOrder(cb);
      }
      cb(this);
    };
    HeimdallNode.prototype.toJSON = function() {
      return {
        _id: this._id,
        id: this.id,
        stats: this.stats,
        children: this.children.map(function(child) {
          return child._id;
        })
      };
    };
    HeimdallNode.prototype.toJSONSubgraph = function() {
      var nodes = [];
      this.visitPreOrder(function(node) {
        nodes.push(node.toJSON());
      });
      return nodes;
    };
    HeimdallNode.prototype.addChild = function(node) {
      this.children.push(node);
    };
    function Cookie(node, heimdall) {
      this.node = node;
      this.restoreNode = this.node.parent;
      this.heimdall = heimdall;
      this.stopped = false;
    }
    Object.defineProperty(Cookie.prototype, 'stats', {get: function() {
        return this.node.stats.own;
      }});
    Cookie.prototype.stop = function() {
      var monitor;
      if (this.heimdall._current !== this.node) {
        throw new TypeError('cannot stop: not the current node');
      } else if (this.stopped === true) {
        throw new TypeError('cannot stop: already stopped');
      }
      this.stopped = true;
      this.heimdall._recordTime();
      this.heimdall._current = this.restoreNode;
    };
    Cookie.prototype.resume = function() {
      if (this.stopped === false) {
        throw new TypeError('cannot resume: not stopped');
      }
      this.stopped = false;
      this.restoreNode = this.heimdall._current;
      this.heimdall._current = this.node;
    };
  });
  var heimdall$2 = interopDefault(heimdall$1);
  var require$$2$7 = Object.freeze({default: heimdall$2});
  var semver = createCommonjsModule(function(module, exports) {
    exports = module.exports = SemVer;
    var debug;
    if (typeof process === 'object' && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG))
      debug = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift('SEMVER');
        console.log.apply(console, args);
      };
    else
      debug = function() {};
    exports.SEMVER_SPEC_VERSION = '2.0.0';
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
    var re = exports.re = [];
    var src = exports.src = [];
    var R = 0;
    var NUMERICIDENTIFIER = R++;
    src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
    var NUMERICIDENTIFIERLOOSE = R++;
    src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';
    var NONNUMERICIDENTIFIER = R++;
    src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';
    var MAINVERSION = R++;
    src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' + '(' + src[NUMERICIDENTIFIER] + ')\\.' + '(' + src[NUMERICIDENTIFIER] + ')';
    var MAINVERSIONLOOSE = R++;
    src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' + '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' + '(' + src[NUMERICIDENTIFIERLOOSE] + ')';
    var PRERELEASEIDENTIFIER = R++;
    src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] + '|' + src[NONNUMERICIDENTIFIER] + ')';
    var PRERELEASEIDENTIFIERLOOSE = R++;
    src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] + '|' + src[NONNUMERICIDENTIFIER] + ')';
    var PRERELEASE = R++;
    src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] + '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';
    var PRERELEASELOOSE = R++;
    src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] + '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';
    var BUILDIDENTIFIER = R++;
    src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';
    var BUILD = R++;
    src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] + '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';
    var FULL = R++;
    var FULLPLAIN = 'v?' + src[MAINVERSION] + src[PRERELEASE] + '?' + src[BUILD] + '?';
    src[FULL] = '^' + FULLPLAIN + '$';
    var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] + src[PRERELEASELOOSE] + '?' + src[BUILD] + '?';
    var LOOSE = R++;
    src[LOOSE] = '^' + LOOSEPLAIN + '$';
    var GTLT = R++;
    src[GTLT] = '((?:<|>)?=?)';
    var XRANGEIDENTIFIERLOOSE = R++;
    src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
    var XRANGEIDENTIFIER = R++;
    src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';
    var XRANGEPLAIN = R++;
    src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' + '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' + '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' + '(?:' + src[PRERELEASE] + ')?' + src[BUILD] + '?' + ')?)?';
    var XRANGEPLAINLOOSE = R++;
    src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' + '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' + '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' + '(?:' + src[PRERELEASELOOSE] + ')?' + src[BUILD] + '?' + ')?)?';
    var XRANGE = R++;
    src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
    var XRANGELOOSE = R++;
    src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';
    var LONETILDE = R++;
    src[LONETILDE] = '(?:~>?)';
    var TILDETRIM = R++;
    src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
    re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
    var tildeTrimReplace = '$1~';
    var TILDE = R++;
    src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
    var TILDELOOSE = R++;
    src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';
    var LONECARET = R++;
    src[LONECARET] = '(?:\\^)';
    var CARETTRIM = R++;
    src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
    re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
    var caretTrimReplace = '$1^';
    var CARET = R++;
    src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
    var CARETLOOSE = R++;
    src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';
    var COMPARATORLOOSE = R++;
    src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
    var COMPARATOR = R++;
    src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';
    var COMPARATORTRIM = R++;
    src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] + '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';
    re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
    var comparatorTrimReplace = '$1$2$3';
    var HYPHENRANGE = R++;
    src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' + '\\s+-\\s+' + '(' + src[XRANGEPLAIN] + ')' + '\\s*$';
    var HYPHENRANGELOOSE = R++;
    src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' + '\\s+-\\s+' + '(' + src[XRANGEPLAINLOOSE] + ')' + '\\s*$';
    var STAR = R++;
    src[STAR] = '(<|>)?=?\\s*\\*';
    for (var i = 0; i < R; i++) {
      debug(i, src[i]);
      if (!re[i])
        re[i] = new RegExp(src[i]);
    }
    exports.parse = parse;
    function parse(version, loose) {
      if (version instanceof SemVer)
        return version;
      if (typeof version !== 'string')
        return null;
      if (version.length > MAX_LENGTH)
        return null;
      var r = loose ? re[LOOSE] : re[FULL];
      if (!r.test(version))
        return null;
      try {
        return new SemVer(version, loose);
      } catch (er) {
        return null;
      }
    }
    exports.valid = valid;
    function valid(version, loose) {
      var v = parse(version, loose);
      return v ? v.version : null;
    }
    exports.clean = clean;
    function clean(version, loose) {
      var s = parse(version.trim().replace(/^[=v]+/, ''), loose);
      return s ? s.version : null;
    }
    exports.SemVer = SemVer;
    function SemVer(version, loose) {
      if (version instanceof SemVer) {
        if (version.loose === loose)
          return version;
        else
          version = version.version;
      } else if (typeof version !== 'string') {
        throw new TypeError('Invalid Version: ' + version);
      }
      if (version.length > MAX_LENGTH)
        throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters');
      if (!(this instanceof SemVer))
        return new SemVer(version, loose);
      debug('SemVer', version, loose);
      this.loose = loose;
      var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);
      if (!m)
        throw new TypeError('Invalid Version: ' + version);
      this.raw = version;
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];
      if (this.major > MAX_SAFE_INTEGER || this.major < 0)
        throw new TypeError('Invalid major version');
      if (this.minor > MAX_SAFE_INTEGER || this.minor < 0)
        throw new TypeError('Invalid minor version');
      if (this.patch > MAX_SAFE_INTEGER || this.patch < 0)
        throw new TypeError('Invalid patch version');
      if (!m[4])
        this.prerelease = [];
      else
        this.prerelease = m[4].split('.').map(function(id) {
          if (/^[0-9]+$/.test(id)) {
            var num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER)
              return num;
          }
          return id;
        });
      this.build = m[5] ? m[5].split('.') : [];
      this.format();
    }
    SemVer.prototype.format = function() {
      this.version = this.major + '.' + this.minor + '.' + this.patch;
      if (this.prerelease.length)
        this.version += '-' + this.prerelease.join('.');
      return this.version;
    };
    SemVer.prototype.toString = function() {
      return this.version;
    };
    SemVer.prototype.compare = function(other) {
      debug('SemVer.compare', this.version, this.loose, other);
      if (!(other instanceof SemVer))
        other = new SemVer(other, this.loose);
      return this.compareMain(other) || this.comparePre(other);
    };
    SemVer.prototype.compareMain = function(other) {
      if (!(other instanceof SemVer))
        other = new SemVer(other, this.loose);
      return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
    };
    SemVer.prototype.comparePre = function(other) {
      if (!(other instanceof SemVer))
        other = new SemVer(other, this.loose);
      if (this.prerelease.length && !other.prerelease.length)
        return -1;
      else if (!this.prerelease.length && other.prerelease.length)
        return 1;
      else if (!this.prerelease.length && !other.prerelease.length)
        return 0;
      var i = 0;
      do {
        var a = this.prerelease[i];
        var b = other.prerelease[i];
        debug('prerelease compare', i, a, b);
        if (a === undefined && b === undefined)
          return 0;
        else if (b === undefined)
          return 1;
        else if (a === undefined)
          return -1;
        else if (a === b)
          continue;
        else
          return compareIdentifiers(a, b);
      } while (++i);
    };
    SemVer.prototype.inc = function(release, identifier) {
      switch (release) {
        case 'premajor':
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc('pre', identifier);
          break;
        case 'preminor':
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc('pre', identifier);
          break;
        case 'prepatch':
          this.prerelease.length = 0;
          this.inc('patch', identifier);
          this.inc('pre', identifier);
          break;
        case 'prerelease':
          if (this.prerelease.length === 0)
            this.inc('patch', identifier);
          this.inc('pre', identifier);
          break;
        case 'major':
          if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0)
            this.major++;
          this.minor = 0;
          this.patch = 0;
          this.prerelease = [];
          break;
        case 'minor':
          if (this.patch !== 0 || this.prerelease.length === 0)
            this.minor++;
          this.patch = 0;
          this.prerelease = [];
          break;
        case 'patch':
          if (this.prerelease.length === 0)
            this.patch++;
          this.prerelease = [];
          break;
        case 'pre':
          if (this.prerelease.length === 0)
            this.prerelease = [0];
          else {
            var i = this.prerelease.length;
            while (--i >= 0) {
              if (typeof this.prerelease[i] === 'number') {
                this.prerelease[i]++;
                i = -2;
              }
            }
            if (i === -1)
              this.prerelease.push(0);
          }
          if (identifier) {
            if (this.prerelease[0] === identifier) {
              if (isNaN(this.prerelease[1]))
                this.prerelease = [identifier, 0];
            } else
              this.prerelease = [identifier, 0];
          }
          break;
        default:
          throw new Error('invalid increment argument: ' + release);
      }
      this.format();
      this.raw = this.version;
      return this;
    };
    exports.inc = inc;
    function inc(version, release, loose, identifier) {
      if (typeof(loose) === 'string') {
        identifier = loose;
        loose = undefined;
      }
      try {
        return new SemVer(version, loose).inc(release, identifier).version;
      } catch (er) {
        return null;
      }
    }
    exports.diff = diff;
    function diff(version1, version2) {
      if (eq(version1, version2)) {
        return null;
      } else {
        var v1 = parse(version1);
        var v2 = parse(version2);
        if (v1.prerelease.length || v2.prerelease.length) {
          for (var key in v1) {
            if (key === 'major' || key === 'minor' || key === 'patch') {
              if (v1[key] !== v2[key]) {
                return 'pre' + key;
              }
            }
          }
          return 'prerelease';
        }
        for (var key in v1) {
          if (key === 'major' || key === 'minor' || key === 'patch') {
            if (v1[key] !== v2[key]) {
              return key;
            }
          }
        }
      }
    }
    exports.compareIdentifiers = compareIdentifiers;
    var numeric = /^[0-9]+$/;
    function compareIdentifiers(a, b) {
      var anum = numeric.test(a);
      var bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return (anum && !bnum) ? -1 : (bnum && !anum) ? 1 : a < b ? -1 : a > b ? 1 : 0;
    }
    exports.rcompareIdentifiers = rcompareIdentifiers;
    function rcompareIdentifiers(a, b) {
      return compareIdentifiers(b, a);
    }
    exports.major = major;
    function major(a, loose) {
      return new SemVer(a, loose).major;
    }
    exports.minor = minor;
    function minor(a, loose) {
      return new SemVer(a, loose).minor;
    }
    exports.patch = patch;
    function patch(a, loose) {
      return new SemVer(a, loose).patch;
    }
    exports.compare = compare;
    function compare(a, b, loose) {
      return new SemVer(a, loose).compare(b);
    }
    exports.compareLoose = compareLoose;
    function compareLoose(a, b) {
      return compare(a, b, true);
    }
    exports.rcompare = rcompare;
    function rcompare(a, b, loose) {
      return compare(b, a, loose);
    }
    exports.sort = sort;
    function sort(list, loose) {
      return list.sort(function(a, b) {
        return exports.compare(a, b, loose);
      });
    }
    exports.rsort = rsort;
    function rsort(list, loose) {
      return list.sort(function(a, b) {
        return exports.rcompare(a, b, loose);
      });
    }
    exports.gt = gt;
    function gt(a, b, loose) {
      return compare(a, b, loose) > 0;
    }
    exports.lt = lt;
    function lt(a, b, loose) {
      return compare(a, b, loose) < 0;
    }
    exports.eq = eq;
    function eq(a, b, loose) {
      return compare(a, b, loose) === 0;
    }
    exports.neq = neq;
    function neq(a, b, loose) {
      return compare(a, b, loose) !== 0;
    }
    exports.gte = gte;
    function gte(a, b, loose) {
      return compare(a, b, loose) >= 0;
    }
    exports.lte = lte;
    function lte(a, b, loose) {
      return compare(a, b, loose) <= 0;
    }
    exports.cmp = cmp;
    function cmp(a, op, b, loose) {
      var ret;
      switch (op) {
        case '===':
          if (typeof a === 'object')
            a = a.version;
          if (typeof b === 'object')
            b = b.version;
          ret = a === b;
          break;
        case '!==':
          if (typeof a === 'object')
            a = a.version;
          if (typeof b === 'object')
            b = b.version;
          ret = a !== b;
          break;
        case '':
        case '=':
        case '==':
          ret = eq(a, b, loose);
          break;
        case '!=':
          ret = neq(a, b, loose);
          break;
        case '>':
          ret = gt(a, b, loose);
          break;
        case '>=':
          ret = gte(a, b, loose);
          break;
        case '<':
          ret = lt(a, b, loose);
          break;
        case '<=':
          ret = lte(a, b, loose);
          break;
        default:
          throw new TypeError('Invalid operator: ' + op);
      }
      return ret;
    }
    exports.Comparator = Comparator;
    function Comparator(comp, loose) {
      if (comp instanceof Comparator) {
        if (comp.loose === loose)
          return comp;
        else
          comp = comp.value;
      }
      if (!(this instanceof Comparator))
        return new Comparator(comp, loose);
      debug('comparator', comp, loose);
      this.loose = loose;
      this.parse(comp);
      if (this.semver === ANY)
        this.value = '';
      else
        this.value = this.operator + this.semver.version;
      debug('comp', this);
    }
    var ANY = {};
    Comparator.prototype.parse = function(comp) {
      var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
      var m = comp.match(r);
      if (!m)
        throw new TypeError('Invalid comparator: ' + comp);
      this.operator = m[1];
      if (this.operator === '=')
        this.operator = '';
      if (!m[2])
        this.semver = ANY;
      else
        this.semver = new SemVer(m[2], this.loose);
    };
    Comparator.prototype.toString = function() {
      return this.value;
    };
    Comparator.prototype.test = function(version) {
      debug('Comparator.test', version, this.loose);
      if (this.semver === ANY)
        return true;
      if (typeof version === 'string')
        version = new SemVer(version, this.loose);
      return cmp(version, this.operator, this.semver, this.loose);
    };
    exports.Range = Range;
    function Range(range, loose) {
      if ((range instanceof Range) && range.loose === loose)
        return range;
      if (!(this instanceof Range))
        return new Range(range, loose);
      this.loose = loose;
      this.raw = range;
      this.set = range.split(/\s*\|\|\s*/).map(function(range) {
        return this.parseRange(range.trim());
      }, this).filter(function(c) {
        return c.length;
      });
      if (!this.set.length) {
        throw new TypeError('Invalid SemVer Range: ' + range);
      }
      this.format();
    }
    Range.prototype.format = function() {
      this.range = this.set.map(function(comps) {
        return comps.join(' ').trim();
      }).join('||').trim();
      return this.range;
    };
    Range.prototype.toString = function() {
      return this.range;
    };
    Range.prototype.parseRange = function(range) {
      var loose = this.loose;
      range = range.trim();
      debug('range', range, loose);
      var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
      range = range.replace(hr, hyphenReplace);
      debug('hyphen replace', range);
      range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
      debug('comparator trim', range, re[COMPARATORTRIM]);
      range = range.replace(re[TILDETRIM], tildeTrimReplace);
      range = range.replace(re[CARETTRIM], caretTrimReplace);
      range = range.split(/\s+/).join(' ');
      var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
      var set = range.split(' ').map(function(comp) {
        return parseComparator(comp, loose);
      }).join(' ').split(/\s+/);
      if (this.loose) {
        set = set.filter(function(comp) {
          return !!comp.match(compRe);
        });
      }
      set = set.map(function(comp) {
        return new Comparator(comp, loose);
      });
      return set;
    };
    exports.toComparators = toComparators;
    function toComparators(range, loose) {
      return new Range(range, loose).set.map(function(comp) {
        return comp.map(function(c) {
          return c.value;
        }).join(' ').trim().split(' ');
      });
    }
    function parseComparator(comp, loose) {
      debug('comp', comp);
      comp = replaceCarets(comp, loose);
      debug('caret', comp);
      comp = replaceTildes(comp, loose);
      debug('tildes', comp);
      comp = replaceXRanges(comp, loose);
      debug('xrange', comp);
      comp = replaceStars(comp, loose);
      debug('stars', comp);
      return comp;
    }
    function isX(id) {
      return !id || id.toLowerCase() === 'x' || id === '*';
    }
    function replaceTildes(comp, loose) {
      return comp.trim().split(/\s+/).map(function(comp) {
        return replaceTilde(comp, loose);
      }).join(' ');
    }
    function replaceTilde(comp, loose) {
      var r = loose ? re[TILDELOOSE] : re[TILDE];
      return comp.replace(r, function(_, M, m, p, pr) {
        debug('tilde', comp, _, M, m, p, pr);
        var ret;
        if (isX(M))
          ret = '';
        else if (isX(m))
          ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
        else if (isX(p))
          ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
        else if (pr) {
          debug('replaceTilde pr', pr);
          if (pr.charAt(0) !== '-')
            pr = '-' + pr;
          ret = '>=' + M + '.' + m + '.' + p + pr + ' <' + M + '.' + (+m + 1) + '.0';
        } else
          ret = '>=' + M + '.' + m + '.' + p + ' <' + M + '.' + (+m + 1) + '.0';
        debug('tilde return', ret);
        return ret;
      });
    }
    function replaceCarets(comp, loose) {
      return comp.trim().split(/\s+/).map(function(comp) {
        return replaceCaret(comp, loose);
      }).join(' ');
    }
    function replaceCaret(comp, loose) {
      debug('caret', comp, loose);
      var r = loose ? re[CARETLOOSE] : re[CARET];
      return comp.replace(r, function(_, M, m, p, pr) {
        debug('caret', comp, _, M, m, p, pr);
        var ret;
        if (isX(M))
          ret = '';
        else if (isX(m))
          ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
        else if (isX(p)) {
          if (M === '0')
            ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
          else
            ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0';
        } else if (pr) {
          debug('replaceCaret pr', pr);
          if (pr.charAt(0) !== '-')
            pr = '-' + pr;
          if (M === '0') {
            if (m === '0')
              ret = '>=' + M + '.' + m + '.' + p + pr + ' <' + M + '.' + m + '.' + (+p + 1);
            else
              ret = '>=' + M + '.' + m + '.' + p + pr + ' <' + M + '.' + (+m + 1) + '.0';
          } else
            ret = '>=' + M + '.' + m + '.' + p + pr + ' <' + (+M + 1) + '.0.0';
        } else {
          debug('no pr');
          if (M === '0') {
            if (m === '0')
              ret = '>=' + M + '.' + m + '.' + p + ' <' + M + '.' + m + '.' + (+p + 1);
            else
              ret = '>=' + M + '.' + m + '.' + p + ' <' + M + '.' + (+m + 1) + '.0';
          } else
            ret = '>=' + M + '.' + m + '.' + p + ' <' + (+M + 1) + '.0.0';
        }
        debug('caret return', ret);
        return ret;
      });
    }
    function replaceXRanges(comp, loose) {
      debug('replaceXRanges', comp, loose);
      return comp.split(/\s+/).map(function(comp) {
        return replaceXRange(comp, loose);
      }).join(' ');
    }
    function replaceXRange(comp, loose) {
      comp = comp.trim();
      var r = loose ? re[XRANGELOOSE] : re[XRANGE];
      return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
        debug('xRange', comp, ret, gtlt, M, m, p, pr);
        var xM = isX(M);
        var xm = xM || isX(m);
        var xp = xm || isX(p);
        var anyX = xp;
        if (gtlt === '=' && anyX)
          gtlt = '';
        if (xM) {
          if (gtlt === '>' || gtlt === '<') {
            ret = '<0.0.0';
          } else {
            ret = '*';
          }
        } else if (gtlt && anyX) {
          if (xm)
            m = 0;
          if (xp)
            p = 0;
          if (gtlt === '>') {
            gtlt = '>=';
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else if (xp) {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === '<=') {
            gtlt = '<';
            if (xm)
              M = +M + 1;
            else
              m = +m + 1;
          }
          ret = gtlt + M + '.' + m + '.' + p;
        } else if (xm) {
          ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
        } else if (xp) {
          ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
        }
        debug('xRange return', ret);
        return ret;
      });
    }
    function replaceStars(comp, loose) {
      debug('replaceStars', comp, loose);
      return comp.trim().replace(re[STAR], '');
    }
    function hyphenReplace($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) {
      if (isX(fM))
        from = '';
      else if (isX(fm))
        from = '>=' + fM + '.0.0';
      else if (isX(fp))
        from = '>=' + fM + '.' + fm + '.0';
      else
        from = '>=' + from;
      if (isX(tM))
        to = '';
      else if (isX(tm))
        to = '<' + (+tM + 1) + '.0.0';
      else if (isX(tp))
        to = '<' + tM + '.' + (+tm + 1) + '.0';
      else if (tpr)
        to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;
      else
        to = '<=' + to;
      return (from + ' ' + to).trim();
    }
    Range.prototype.test = function(version) {
      if (!version)
        return false;
      if (typeof version === 'string')
        version = new SemVer(version, this.loose);
      for (var i = 0; i < this.set.length; i++) {
        if (testSet(this.set[i], version))
          return true;
      }
      return false;
    };
    function testSet(set, version) {
      for (var i = 0; i < set.length; i++) {
        if (!set[i].test(version))
          return false;
      }
      if (version.prerelease.length) {
        for (var i = 0; i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === ANY)
            continue;
          if (set[i].semver.prerelease.length > 0) {
            var allowed = set[i].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch)
              return true;
          }
        }
        return false;
      }
      return true;
    }
    exports.satisfies = satisfies;
    function satisfies(version, range, loose) {
      try {
        range = new Range(range, loose);
      } catch (er) {
        return false;
      }
      return range.test(version);
    }
    exports.maxSatisfying = maxSatisfying;
    function maxSatisfying(versions, range, loose) {
      return versions.filter(function(version) {
        return satisfies(version, range, loose);
      }).sort(function(a, b) {
        return rcompare(a, b, loose);
      })[0] || null;
    }
    exports.minSatisfying = minSatisfying;
    function minSatisfying(versions, range, loose) {
      return versions.filter(function(version) {
        return satisfies(version, range, loose);
      }).sort(function(a, b) {
        return compare(a, b, loose);
      })[0] || null;
    }
    exports.validRange = validRange;
    function validRange(range, loose) {
      try {
        return new Range(range, loose).range || '*';
      } catch (er) {
        return null;
      }
    }
    exports.ltr = ltr;
    function ltr(version, range, loose) {
      return outside(version, range, '<', loose);
    }
    exports.gtr = gtr;
    function gtr(version, range, loose) {
      return outside(version, range, '>', loose);
    }
    exports.outside = outside;
    function outside(version, range, hilo, loose) {
      version = new SemVer(version, loose);
      range = new Range(range, loose);
      var gtfn,
          ltefn,
          ltfn,
          comp,
          ecomp;
      switch (hilo) {
        case '>':
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = '>';
          ecomp = '>=';
          break;
        case '<':
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = '<';
          ecomp = '<=';
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version, range, loose)) {
        return false;
      }
      for (var i = 0; i < range.set.length; ++i) {
        var comparators = range.set[i];
        var high = null;
        var low = null;
        comparators.forEach(function(comparator) {
          if (comparator.semver === ANY) {
            comparator = new Comparator('>=0.0.0');
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, loose)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, loose)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    }
    exports.prerelease = prerelease;
    function prerelease(version, loose) {
      var parsed = parse(version, loose);
      return (parsed && parsed.prerelease.length) ? parsed.prerelease : null;
    }
  });
  var semver$1 = interopDefault(semver);
  var prerelease = semver.prerelease;
  var outside = semver.outside;
  var gtr = semver.gtr;
  var ltr = semver.ltr;
  var validRange = semver.validRange;
  var minSatisfying = semver.minSatisfying;
  var maxSatisfying = semver.maxSatisfying;
  var satisfies = semver.satisfies;
  var toComparators = semver.toComparators;
  var Range = semver.Range;
  var Comparator = semver.Comparator;
  var cmp = semver.cmp;
  var lte = semver.lte;
  var gte = semver.gte;
  var neq = semver.neq;
  var eq = semver.eq;
  var lt = semver.lt;
  var gt = semver.gt;
  var rsort = semver.rsort;
  var sort = semver.sort;
  var rcompare = semver.rcompare;
  var compareLoose = semver.compareLoose;
  var compare = semver.compare;
  var patch = semver.patch;
  var minor = semver.minor;
  var major = semver.major;
  var rcompareIdentifiers = semver.rcompareIdentifiers;
  var compareIdentifiers = semver.compareIdentifiers;
  var diff = semver.diff;
  var inc = semver.inc;
  var SemVer = semver.SemVer;
  var clean = semver.clean;
  var valid = semver.valid;
  var parse = semver.parse;
  var src = semver.src;
  var re = semver.re;
  var SEMVER_SPEC_VERSION = semver.SEMVER_SPEC_VERSION;
  var require$$1$8 = Object.freeze({
    default: semver$1,
    prerelease: prerelease,
    outside: outside,
    gtr: gtr,
    ltr: ltr,
    validRange: validRange,
    minSatisfying: minSatisfying,
    maxSatisfying: maxSatisfying,
    satisfies: satisfies,
    toComparators: toComparators,
    Range: Range,
    Comparator: Comparator,
    cmp: cmp,
    lte: lte,
    gte: gte,
    neq: neq,
    eq: eq,
    lt: lt,
    gt: gt,
    rsort: rsort,
    sort: sort,
    rcompare: rcompare,
    compareLoose: compareLoose,
    compare: compare,
    patch: patch,
    minor: minor,
    major: major,
    rcompareIdentifiers: rcompareIdentifiers,
    compareIdentifiers: compareIdentifiers,
    diff: diff,
    inc: inc,
    SemVer: SemVer,
    clean: clean,
    valid: valid,
    parse: parse,
    src: src,
    re: re,
    SEMVER_SPEC_VERSION: SEMVER_SPEC_VERSION
  });
  var index$13 = createCommonjsModule(function(module) {
    'use strict';
    var Heimdall = interopDefault(require$$2$7);
    var semver = interopDefault(require$$1$8);
    var version = interopDefault(require$$0$15).version;
    var compatibleVersion = '^' + version;
    if (process._heimdall) {
      var globalVersion = process._heimdall.version;
      if (!semver.satisfies(globalVersion, compatibleVersion)) {
        throw new Error('Version "' + globalVersion + '" not compatible with "' + compatibleVersion + '"');
      }
    } else {
      process._heimdall = new Heimdall();
    }
    module.exports = process._heimdall;
  });
  var heimdall = interopDefault(index$13);
  var classCallCheck = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  var createClass = function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
          descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();
  var MATCHER = function MATCHER(n) {
    return true;
  };
  var Prefixer = function() {
    function Prefixer() {
      classCallCheck(this, Prefixer);
      var logConfig = heimdall.configFor('logging');
      this.matcher = logConfig.matcher || MATCHER;
      this.depth = typeof logConfig.depth === 'number' ? logConfig.depth : 3;
    }
    createClass(Prefixer, [{
      key: 'prefix',
      value: function prefix() {
        var parts = [];
        var node = heimdall.current;
        while (node) {
          if (node.isRoot || parts.length >= this.depth) {
            break;
          }
          if (this.matcher(node.id)) {
            parts.push(node.id.name + '#' + node._id);
          }
          node = node.parent;
        }
        return parts.length > 0 ? '[' + parts.reverse().join(' -> ') + '] ' : '';
      }
    }]);
    return Prefixer;
  }();
  var ERROR$1 = 0;
  var WARN = 1;
  var INFO = 2;
  var DEBUG = 3;
  var TRACE = 4;
  var Logger = function() {
    function Logger(namespace, level) {
      classCallCheck(this, Logger);
      this.level = level;
      this._print = debug(namespace);
      this._prefixer = new Prefixer();
    }
    createClass(Logger, [{
      key: '_message',
      value: function _message(level, msg) {
        if (level <= this.level) {
          for (var _len = arguments.length,
              args = Array(_len > 2 ? _len - 2 : 0),
              _key = 2; _key < _len; _key++) {
            args[_key - 2] = arguments[_key];
          }
          this._print.apply(this, ['' + this._prefixer.prefix() + msg].concat(args));
        }
      }
    }, {
      key: 'trace',
      value: function trace() {
        for (var _len2 = arguments.length,
            args = Array(_len2),
            _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        return this._message.apply(this, [TRACE].concat(args));
      }
    }, {
      key: 'debug',
      value: function debug() {
        for (var _len3 = arguments.length,
            args = Array(_len3),
            _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }
        return this._message.apply(this, [DEBUG].concat(args));
      }
    }, {
      key: 'info',
      value: function info() {
        for (var _len4 = arguments.length,
            args = Array(_len4),
            _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }
        return this._message.apply(this, [INFO].concat(args));
      }
    }, {
      key: 'warn',
      value: function warn() {
        for (var _len5 = arguments.length,
            args = Array(_len5),
            _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }
        return this._message.apply(this, [WARN].concat(args));
      }
    }, {
      key: 'error',
      value: function error() {
        for (var _len6 = arguments.length,
            args = Array(_len6),
            _key6 = 0; _key6 < _len6; _key6++) {
          args[_key6] = arguments[_key6];
        }
        return this._message.apply(this, [ERROR$1].concat(args));
      }
    }]);
    return Logger;
  }();
  var NULL_LOGGER = {
    trace: function trace() {},
    debug: function debug() {},
    info: function info() {},
    warn: function warn() {},
    error: function error() {}
  };
  function computeDebugLevel() {
    var level = void 0;
    if (!process.env.DEBUG_LEVEL) {
      level = INFO;
    } else {
      switch (process.env.DEBUG_LEVEL.toUpperCase()) {
        case 'ERROR':
          level = ERROR$1;
          break;
        case 'WARN':
          level = WARN;
          break;
        case 'INFO':
          level = INFO;
          break;
        case 'DEBUG':
          level = DEBUG;
          break;
        case 'TRACE':
          level = TRACE;
          break;
        default:
          level = parseInt(process.env.DEBUG_LEVEL, 10);
      }
    }
    logGenerator.debugLevel = level;
  }
  function logGenerator(namespace) {
    if (debug.enabled(namespace)) {
      if (logGenerator.debugLevel === undefined) {
        computeDebugLevel();
      }
      return new Logger(namespace, logGenerator.debugLevel);
    } else {
      return NULL_LOGGER;
    }
  }
  logGenerator.debugLevel = undefined;
  var expect = chai.expect;
  describe('logGenerator', function() {
    var origDebugLevel = process.env.DEBUG_LEVEL;
    beforeEach(function() {
      debug.names.splice(0, debug.names.length);
      debug.skips.splice(0, debug.skips.length);
    });
    afterEach(function() {
      process.env.DEBUG_LEVEL = origDebugLevel;
    });
    it('returns a null logger for disabled namespaces', function() {
      expect(logGenerator('something')).to.equal(NULL_LOGGER);
    });
    it('returns a logger', function() {
      debug.enable('super-duper:project');
      expect(logGenerator('super-duper:project') instanceof Logger).to.equal(true);
    });
    it('sets log level according to DEBUG_LEVEL for names', function() {
      debug.enable('super-duper:project');
      expect(logGenerator('something-else')).to.equal(NULL_LOGGER);
      process.env.DEBUG_LEVEL = 'ERROR';
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(ERROR$1);
      process.env.DEBUG_LEVEL = 'WARN';
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(WARN);
      process.env.DEBUG_LEVEL = 'INFO';
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(INFO);
      process.env.DEBUG_LEVEL = 'DEBUG';
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(DEBUG);
      process.env.DEBUG_LEVEL = 'trace';
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(TRACE);
      process.env.DEBUG_LEVEL = 'error';
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(ERROR$1);
      process.env.DEBUG_LEVEL = 'warn';
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(WARN);
      process.env.DEBUG_LEVEL = 'info';
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(INFO);
      process.env.DEBUG_LEVEL = 'DEBUG';
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(DEBUG);
      process.env.DEBUG_LEVEL = 'TRACE';
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(TRACE);
    });
    it('sets log level according to DEBUG_LEVEL for numbers', function() {
      debug.enable('super-duper:project');
      process.env.DEBUG_LEVEL = '' + ERROR$1;
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(ERROR$1);
      process.env.DEBUG_LEVEL = '' + WARN;
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(WARN);
      process.env.DEBUG_LEVEL = '' + INFO;
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(INFO);
      process.env.DEBUG_LEVEL = '' + DEBUG;
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(DEBUG);
      process.env.DEBUG_LEVEL = '' + TRACE;
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(TRACE);
    });
    it('uses a default level of INFO', function() {
      debug.enable('super-duper:project');
      delete process.env.DEBUG_LEVEL;
      logGenerator.debugLevel = undefined;
      expect(logGenerator('super-duper:project').level).to.equal(INFO);
    });
  });
  describe('NullLogger', function() {
    it('implements the logger API with noops', function() {
      var logger = NULL_LOGGER;
      var noopFnPattern = /^function (\w|\$)*\(\) \{\}$/;
      expect(logger.error + '').to.match(noopFnPattern);
      expect(logger.warn + '').to.match(noopFnPattern);
      expect(logger.info + '').to.match(noopFnPattern);
      expect(logger.debug + '').to.match(noopFnPattern);
      expect(logger.trace + '').to.match(noopFnPattern);
    });
  });
  describe('Logger', function() {
    it('prints messages <= its level', function() {
      var logger = new Logger('namespace', TRACE);
      logger._print = createSpy('_print');
      logger.error('hello');
      logger.warn('world');
      logger.info('how');
      logger.debug('are', 'you');
      logger.trace('doing');
      expect(logger._print.calls.map(function(c) {
        return c.slice(1);
      })).to.eql([['hello'], ['world'], ['how'], ['are', 'you'], ['doing']]);
    });
    it('ignores messages > its level', function() {
      var logger = new Logger('namespace', ERROR$1 - 1);
      logger._print = createSpy('_print');
      logger.error('hello');
      logger.warn('world');
      logger.info('how');
      logger.debug('are', 'you');
      logger.trace('doing');
      expect(logger._print.calls.map(function(c) {
        return c.slice(1);
      })).to.eql([]);
    });
    it('prefixes messages', function() {
      var logger = new Logger('namespace', INFO);
      logger._print = createSpy('_print');
      logger._prefixer = {prefix: function prefix() {
          return 'hello ';
        }};
      logger.info('world');
      expect(logger._print.calls.map(function(c) {
        return c.slice(1);
      })).to.eql([['hello world']]);
    });
  });
  describe('Prefixer', function() {
    beforeEach(function() {
      heimdall._reset();
    });
    it("reads matcher and depth from heimdall's logging config if present", function() {
      var logConfig = heimdall.configFor('logging');
      logConfig.depth = 1;
      logConfig.matcher = function(id) {
        return id.name == 'hello';
      };
      var prefixer = new Prefixer();
      heimdall.start({name: 'hello'});
      heimdall.start({name: 'somemthing-else'});
      heimdall.start({name: 'hello'});
      expect(prefixer.prefix()).to.match(/\[hello#\d\] /);
    });
    it('ignores the heimdall root node', function() {
      expect(new Prefixer().prefix()).to.equal('');
    });
    it('collects nodes from path to root, limited by `matcher`', function() {
      heimdall.start({name: 'a'});
      heimdall.start({name: 'b'});
      heimdall.start({name: 'c'});
      heimdall.start({name: 'd'});
      heimdall.start({name: 'e'});
      var prefixer = new Prefixer();
      prefixer.matcher = function(id) {
        return (/[ace]/.test(id.name));
      };
      expect(prefixer.prefix()).to.match(/\[a#\d -> c#\d -> e#\d\] /);
    });
    it('collects nodes from path to root, limited by `depth`', function() {
      heimdall.start({name: 'a'});
      heimdall.start({name: 'b'});
      heimdall.start({name: 'c'});
      heimdall.start({name: 'd'});
      heimdall.start({name: 'e'});
      var prefixer = new Prefixer();
      prefixer.depth = 4;
      expect(prefixer.prefix()).to.match(/\[b#\d -> c#\d -> d#\d -> e#\d\] /);
    });
    it('defaults depth to 3', function() {
      heimdall.start({name: 'a'});
      heimdall.start({name: 'b'});
      heimdall.start({name: 'c'});
      heimdall.start({name: 'd'});
      heimdall.start({name: 'e'});
      var prefixer = new Prefixer();
      expect(prefixer.prefix()).to.match(/\[c#\d -> d#\d -> e#\d\] /);
    });
  });
})(require('buffer').Buffer, require('process'));
