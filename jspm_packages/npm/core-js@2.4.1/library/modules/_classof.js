/* */ 
var cof = require('./_cof'),
    TAG = require('./_wks')('toStringTag'),
    ARG = cof(function() {
      return arguments;
    }()) == 'Arguments';
var tryGet = function(it, key) {
  try {
    return it[key];
  } catch (e) {}
};
module.exports = function(it) {
  var O,
      T,
      B;
  return it === undefined ? 'Undefined' : it === null ? 'Null' : typeof(T = tryGet(O = Object(it), TAG)) == 'string' ? T : ARG ? cof(O) : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
