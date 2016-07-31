/* */ 
var baseAt = require('./_baseAt'),
    baseFlatten = require('./_baseFlatten'),
    baseRest = require('./_baseRest');
var at = baseRest(function(object, paths) {
  return baseAt(object, baseFlatten(paths, 1));
});
module.exports = at;
