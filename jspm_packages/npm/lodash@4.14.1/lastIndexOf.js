/* */ 
var baseFindIndex = require('./_baseFindIndex'),
    baseIsNaN = require('./_baseIsNaN'),
    toInteger = require('./toInteger');
var nativeMax = Math.max,
    nativeMin = Math.min;
function lastIndexOf(array, value, fromIndex) {
  var length = array ? array.length : 0;
  if (!length) {
    return -1;
  }
  var index = length;
  if (fromIndex !== undefined) {
    index = toInteger(fromIndex);
    index = (index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1)) + 1;
  }
  if (value !== value) {
    return baseFindIndex(array, baseIsNaN, index - 1, true);
  }
  while (index--) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}
module.exports = lastIndexOf;
