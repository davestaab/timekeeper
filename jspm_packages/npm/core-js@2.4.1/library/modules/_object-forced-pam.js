/* */ 
module.exports = require('./_library') || !require('./_fails')(function() {
  var K = Math.random();
  __defineSetter__.call(null, K, function() {});
  delete require('./_global')[K];
});
