/* */ 
var baseRest = require('./_baseRest'),
    createWrap = require('./_createWrap'),
    getHolder = require('./_getHolder'),
    replaceHolders = require('./_replaceHolders');
var BIND_FLAG = 1,
    BIND_KEY_FLAG = 2,
    PARTIAL_FLAG = 32;
var bindKey = baseRest(function(object, key, partials) {
  var bitmask = BIND_FLAG | BIND_KEY_FLAG;
  if (partials.length) {
    var holders = replaceHolders(partials, getHolder(bindKey));
    bitmask |= PARTIAL_FLAG;
  }
  return createWrap(key, bitmask, object, partials, holders);
});
bindKey.placeholder = {};
module.exports = bindKey;
