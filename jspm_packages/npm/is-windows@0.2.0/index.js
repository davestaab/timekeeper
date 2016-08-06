/* */ 
"format cjs";
(function(process) {
  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      define(factory);
    } else if (typeof exports === 'object') {
      module.exports = factory;
    } else {
      root.isWindows = factory;
    }
  }(this, function() {
    'use strict';
    return (function isWindows() {
      if (typeof process === 'undefined' || !process) {
        return false;
      }
      return process.platform === 'win32';
    }());
  }));
})(require('process'));
