/* */ 
var speciesConstructor = require('./_array-species-constructor');
module.exports = function(original, length) {
  return new (speciesConstructor(original))(length);
};
