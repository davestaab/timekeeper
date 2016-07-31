/* */ 
var baseIteratee = require('./_baseIteratee'),
    basePickBy = require('./_basePickBy'),
    getAllKeysIn = require('./_getAllKeysIn');
function pickBy(object, predicate) {
  return object == null ? {} : basePickBy(object, getAllKeysIn(object), baseIteratee(predicate));
}
module.exports = pickBy;
