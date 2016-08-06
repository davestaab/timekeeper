/* */ 
var baseRest = require('./_baseRest'),
    createWrap = require('./_createWrap'),
    getHolder = require('./_getHolder'),
    replaceHolders = require('./_replaceHolders');
var PARTIAL_RIGHT_FLAG = 64;
var partialRight = baseRest(function(func, partials) {
  var holders = replaceHolders(partials, getHolder(partialRight));
  return createWrap(func, PARTIAL_RIGHT_FLAG, undefined, partials, holders);
});
partialRight.placeholder = {};
module.exports = partialRight;
