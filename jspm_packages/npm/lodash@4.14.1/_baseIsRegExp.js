/* */ 
var isObject = require('./isObject');
var regexpTag = '[object RegExp]';
var objectProto = Object.prototype;
var objectToString = objectProto.toString;
function baseIsRegExp(value) {
  return isObject(value) && objectToString.call(value) == regexpTag;
}
module.exports = baseIsRegExp;
