/* */ 
var arrayMap = require('./_arrayMap'),
    baseFlatten = require('./_baseFlatten'),
    basePick = require('./_basePick'),
    baseRest = require('./_baseRest'),
    toKey = require('./_toKey');
var pick = baseRest(function(object, props) {
  return object == null ? {} : basePick(object, arrayMap(baseFlatten(props, 1), toKey));
});
module.exports = pick;
