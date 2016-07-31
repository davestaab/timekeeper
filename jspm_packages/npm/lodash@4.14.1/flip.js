/* */ 
var createWrap = require('./_createWrap');
var FLIP_FLAG = 512;
function flip(func) {
  return createWrap(func, FLIP_FLAG);
}
module.exports = flip;
