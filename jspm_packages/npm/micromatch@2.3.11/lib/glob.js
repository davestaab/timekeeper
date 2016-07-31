/* */ 
'use strict';
var chars = require('./chars');
var utils = require('./utils');
var Glob = module.exports = function Glob(pattern, options) {
  if (!(this instanceof Glob)) {
    return new Glob(pattern, options);
  }
  this.options = options || {};
  this.pattern = pattern;
  this.history = [];
  this.tokens = {};
  this.init(pattern);
};
Glob.prototype.init = function(pattern) {
  this.orig = pattern;
  this.negated = this.isNegated();
  this.options.track = this.options.track || false;
  this.options.makeRe = true;
};
Glob.prototype.track = function(msg) {
  if (this.options.track) {
    this.history.push({
      msg: msg,
      pattern: this.pattern
    });
  }
};
Glob.prototype.isNegated = function() {
  if (this.pattern.charCodeAt(0) === 33) {
    this.pattern = this.pattern.slice(1);
    return true;
  }
  return false;
};
Glob.prototype.braces = function() {
  if (this.options.nobraces !== true && this.options.nobrace !== true) {
    var a = this.pattern.match(/[\{\(\[]/g);
    var b = this.pattern.match(/[\}\)\]]/g);
    if (a && b && (a.length !== b.length)) {
      this.options.makeRe = false;
    }
    var expanded = utils.braces(this.pattern, this.options);
    this.pattern = expanded.join('|');
  }
};
Glob.prototype.brackets = function() {
  if (this.options.nobrackets !== true) {
    this.pattern = utils.brackets(this.pattern);
  }
};
Glob.prototype.extglob = function() {
  if (this.options.noextglob === true)
    return;
  if (utils.isExtglob(this.pattern)) {
    this.pattern = utils.extglob(this.pattern, {escape: true});
  }
};
Glob.prototype.parse = function(pattern) {
  this.tokens = utils.parseGlob(pattern || this.pattern, true);
  return this.tokens;
};
Glob.prototype._replace = function(a, b, escape) {
  this.track('before (find): "' + a + '" (replace with): "' + b + '"');
  if (escape)
    b = esc(b);
  if (a && b && typeof a === 'string') {
    this.pattern = this.pattern.split(a).join(b);
  } else {
    this.pattern = this.pattern.replace(a, b);
  }
  this.track('after');
};
Glob.prototype.escape = function(str) {
  this.track('before escape: ');
  var re = /["\\](['"]?[^"'\\]['"]?)/g;
  this.pattern = str.replace(re, function($0, $1) {
    var o = chars.ESC;
    var ch = o && o[$1];
    if (ch) {
      return ch;
    }
    if (/[a-z]/i.test($0)) {
      return $0.split('\\').join('');
    }
    return $0;
  });
  this.track('after escape: ');
};
Glob.prototype.unescape = function(str) {
  var re = /__([A-Z]+)_([A-Z]+)__/g;
  this.pattern = str.replace(re, function($0, $1) {
    return chars[$1][$0];
  });
  this.pattern = unesc(this.pattern);
};
function esc(str) {
  str = str.split('?').join('%~');
  str = str.split('*').join('%%');
  return str;
}
function unesc(str) {
  str = str.split('%~').join('?');
  str = str.split('%%').join('*');
  return str;
}
