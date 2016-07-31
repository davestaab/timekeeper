/* */ 
"use strict";
var _location = require('../util/location');
var _index = require('./index');
var _index2 = _interopRequireDefault(_index);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
var pp = _index2.default.prototype;
pp.raise = function(pos, message) {
  var loc = (0, _location.getLineInfo)(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  var err = new SyntaxError(message);
  err.pos = pos;
  err.loc = loc;
  throw err;
};
