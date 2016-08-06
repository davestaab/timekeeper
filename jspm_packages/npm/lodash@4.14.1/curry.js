/* */ 
var createWrap = require('./_createWrap');
var CURRY_FLAG = 8;
function curry(func, arity, guard) {
  arity = guard ? undefined : arity;
  var result = createWrap(func, CURRY_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
  result.placeholder = curry.placeholder;
  return result;
}
curry.placeholder = {};
module.exports = curry;
