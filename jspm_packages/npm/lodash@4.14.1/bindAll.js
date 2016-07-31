/* */ 
var arrayEach = require('./_arrayEach'),
    baseFlatten = require('./_baseFlatten'),
    baseRest = require('./_baseRest'),
    bind = require('./bind'),
    toKey = require('./_toKey');
var bindAll = baseRest(function(object, methodNames) {
  arrayEach(baseFlatten(methodNames, 1), function(key) {
    key = toKey(key);
    object[key] = bind(object[key], object);
  });
  return object;
});
module.exports = bindAll;
