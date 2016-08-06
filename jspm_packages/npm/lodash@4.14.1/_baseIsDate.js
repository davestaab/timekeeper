/* */ 
var isObjectLike = require('./isObjectLike');
var dateTag = '[object Date]';
var objectProto = Object.prototype;
var objectToString = objectProto.toString;
function baseIsDate(value) {
  return isObjectLike(value) && objectToString.call(value) == dateTag;
}
module.exports = baseIsDate;
