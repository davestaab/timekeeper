/* */ 
var overArg = require('./_overArg');
var nativeGetPrototype = Object.getPrototypeOf;
var getPrototype = overArg(nativeGetPrototype, Object);
module.exports = getPrototype;
