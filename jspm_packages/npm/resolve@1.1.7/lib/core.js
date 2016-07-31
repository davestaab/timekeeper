/* */ 
module.exports = require('./core.json!systemjs-json').reduce(function(acc, x) {
  acc[x] = true;
  return acc;
}, {});
