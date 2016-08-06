/* */ 
(function(process) {
  'use strict';
  function _interopDefault(ex) {
    return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex;
  }
  var require$$4 = require('tty');
  var require$$3 = require('util');
  var require$$1 = require('fs');
  var require$$0 = require('net');
  var heimdall = _interopDefault(require('heimdalljs'));
  function interopDefault(ex) {
    return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
  }
  function createCommonjsModule(fn, module) {
    return module = {exports: {}}, fn(module, module.exports), module.exports;
  }
  var index = createCommonjsModule(function(module) {
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
  var index$1 = interopDefault(index);
  var require$$0$1 = Object.freeze({default: index$1});
  var debug = createCommonjsModule(function(module, exports) {
    exports = module.exports = debug;
    exports.coerce = coerce;
    exports.disable = disable;
    exports.enable = enable;
    exports.enabled = enabled;
    exports.humanize = interopDefault(require$$0$1);
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
  var debug$1 = interopDefault(debug);
  var formatters = debug.formatters;
  var skips = debug.skips;
  var names = debug.names;
  var humanize = debug.humanize;
  var enabled = debug.enabled;
  var enable = debug.enable;
  var disable = debug.disable;
  var coerce = debug.coerce;
  var require$$2 = Object.freeze({
    default: debug$1,
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
    exports = module.exports = interopDefault(require$$2);
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
          var net = interopDefault(require$$0);
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
  var debugGen = interopDefault(node);
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
  var ERROR = 0;
  var WARN = 1;
  var INFO = 2;
  var DEBUG = 3;
  var TRACE = 4;
  var Logger = function() {
    function Logger(namespace, level) {
      classCallCheck(this, Logger);
      this.level = level;
      this._print = debugGen(namespace);
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
        return this._message.apply(this, [ERROR].concat(args));
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
          level = ERROR;
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
    if (debugGen.enabled(namespace)) {
      if (logGenerator.debugLevel === undefined) {
        computeDebugLevel();
      }
      return new Logger(namespace, logGenerator.debugLevel);
    } else {
      return NULL_LOGGER;
    }
  }
  logGenerator.debugLevel = undefined;
  module.exports = logGenerator;
})(require('process'));
