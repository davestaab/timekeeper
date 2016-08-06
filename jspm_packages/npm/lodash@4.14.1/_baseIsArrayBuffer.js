/* */ 
var isObjectLike = require('./isObjectLike');
var arrayBufferTag = '[object ArrayBuffer]';
var objectProto = Object.prototype;
var objectToString = objectProto.toString;
function baseIsArrayBuffer(value) {
  return isObjectLike(value) && objectToString.call(value) == arrayBufferTag;
}
module.exports = baseIsArrayBuffer;
