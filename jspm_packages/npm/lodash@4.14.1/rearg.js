/* */ 
var baseFlatten = require('./_baseFlatten'),
    baseRest = require('./_baseRest'),
    createWrap = require('./_createWrap');
var REARG_FLAG = 256;
var rearg = baseRest(function(func, indexes) {
  return createWrap(func, REARG_FLAG, undefined, undefined, undefined, baseFlatten(indexes, 1));
});
module.exports = rearg;
