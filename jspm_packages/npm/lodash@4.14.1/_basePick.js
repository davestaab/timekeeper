/* */ 
var basePickBy = require('./_basePickBy');
function basePick(object, props) {
  object = Object(object);
  return basePickBy(object, props, function(value, key) {
    return key in object;
  });
}
module.exports = basePick;
