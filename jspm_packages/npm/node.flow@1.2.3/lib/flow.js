/* */ 
var fs = require('fs');
var extend = require('node.extend');
var slice = [].slice;
var arrays_equal = function(a, b) {
  return !!a && !!b && !(a < b || b < a);
};
var Flow = function() {
  this._defaults = slice.call(arguments) || [];
  this._series_args = [];
  this._series = [];
  this._ready_args = [];
  this._parallel_args = [];
  this._parallel = [];
  this._group = 0;
  this._count = 0;
};
Flow.prototype = {
  _error: function(err) {
    throw err;
  },
  _is_next: function(str) {
    return /self\[ '_' \+ next_type \]\.apply\( self, slice\.call\( arguments \)\);/g.test(str);
  },
  _run_series: function(args) {
    if (args.length && args[0] instanceof Error) {
      return this._error.apply(this, args);
    }
    try {
      this._series.shift().apply(this, args);
    } catch (err) {
      args.unshift(err);
      this._error.apply(this, args);
    }
  },
  _next: function() {
    var args = slice.call(arguments);
    var stack_series_args = this._series_args.shift();
    var next = stack_series_args.pop();
    if (next) {
      if (stack_series_args.length === 0) {
        stack_series_args = args;
      } else {
        extend(true, stack_series_args, args);
      }
      stack_series_args.push(next);
      this._run_series(stack_series_args);
    }
  },
  _run_parallel: function(args) {
    var self = this;
    var parallel_args = this._parallel_args.shift();
    var args_form_last_task = args;
    if (parallel_args === undefined) {
      throw new Error('[node.flow] no parallel task assigned before calling `join`');
    }
    this._count = parallel_args.length;
    this._parallel.shift().forEach(function(task) {
      var _args = parallel_args.shift();
      if (args_form_last_task.length > 0) {
        _args.unshift(args_form_last_task);
      }
      task.apply(self, _args);
    });
    this._group--;
  },
  _ready: function() {
    var arg,
        stack_series_args;
    if (arguments.length > 0) {
      this._ready_args.push(arguments);
    }
    this._count--;
    if (this._count === 0) {
      stack_series_args = this._series_args.shift();
      if (this._ready_args.length > 0) {
        stack_series_args.unshift(this._ready_args);
      }
      arg = stack_series_args;
      this._ready_args = [];
      this._run_series(arg);
    }
  },
  _add: function(args, next_type, callback, merge_default) {
    var self = this;
    var task = [].shift.call(args) || function() {};
    var _args = merge_default ? extend(true, [], this._defaults) : [];
    extend(true, _args, slice.call(args));
    _args.push(function() {
      self['_' + next_type].apply(self, slice.call(arguments));
    });
    callback(_args, task);
  },
  series: function() {
    var self = this;
    this._add(arguments, 'next', function(args, task) {
      self._series_args.push(args);
      self._series.push(task);
    }, true);
    return this;
  },
  parallel: function() {
    var self = this;
    this._add(arguments, 'ready', function(args, task) {
      var group = self._group;
      if (self._parallel[group] === undefined) {
        self._parallel_args[group] = [];
        self._parallel[group] = [];
      }
      self._parallel_args[group].push(args);
      self._parallel[group].push(task);
    }, true);
    return this;
  },
  join: function(is_parallel) {
    var self = this;
    this._add([function() {
      var args = slice.call(arguments);
      var len = arguments.length;
      if (len === 1) {
        if (self._is_next(args[0])) {
          args = [];
        }
      } else {
        self._is_next(args[len - 1]) && [].pop.call(args);
        if (is_parallel === true)
          args = args[0];
        if (self._defaults.length > 0 && arrays_equal(args, self._defaults)) {
          args = [];
        }
      }
      self._run_parallel(args);
    }], 'next', function(args, task) {
      self._series_args.push(args);
      self._series.push(task);
    }, false);
    this._group++;
    return this;
  },
  error: function(callback) {
    this._error = callback;
    return this;
  },
  end: function() {
    this.series.apply(this, arguments)._run_series(this._series_args.shift());
    return this;
  }
};
Flow.version = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version;
module.exports = Flow;
