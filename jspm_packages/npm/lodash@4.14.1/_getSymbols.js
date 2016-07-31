/* */ 
var overArg = require('./_overArg'),
    stubArray = require('./stubArray');
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;
module.exports = getSymbols;
