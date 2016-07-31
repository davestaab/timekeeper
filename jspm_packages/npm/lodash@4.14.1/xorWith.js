/* */ 
var arrayFilter = require('./_arrayFilter'),
    baseRest = require('./_baseRest'),
    baseXor = require('./_baseXor'),
    isArrayLikeObject = require('./isArrayLikeObject'),
    last = require('./last');
var xorWith = baseRest(function(arrays) {
  var comparator = last(arrays);
  if (isArrayLikeObject(comparator)) {
    comparator = undefined;
  }
  return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined, comparator);
});
module.exports = xorWith;
