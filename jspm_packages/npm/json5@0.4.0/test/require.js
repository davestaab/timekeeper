/* */ 
var assert = require('assert');
exports['misc'] = {};
exports['misc']['require hook'] = function() {
  require('../lib/require');
  var json = require('./parse-cases/misc/npm-package.json!systemjs-json');
  var json5 = require('./parse-cases/misc/npm-package.json5');
  assert.deepEqual(json5, json);
};
