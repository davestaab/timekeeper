/* */ 
var overArg = require('./_overArg');
var nativeKeys = Object.keys;
var baseKeys = overArg(nativeKeys, Object);
module.exports = baseKeys;
