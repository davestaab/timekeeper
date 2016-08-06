/* */ 
var FS = require('fs');
var JSON5 = require('./json5');
require.extensions['.json5'] = function(module, filename) {
  var content = FS.readFileSync(filename, 'utf8');
  module.exports = JSON5.parse(content);
};
