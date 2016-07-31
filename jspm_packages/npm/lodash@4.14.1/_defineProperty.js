/* */ 
var getNative = require('./_getNative');
var defineProperty = (function() {
  var func = getNative(Object, 'defineProperty'),
      name = getNative.name;
  return (name && name.length > 2) ? func : undefined;
}());
module.exports = defineProperty;
