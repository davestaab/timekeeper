/* */ 
'use strict';
var resolveSeparated = require('./resolve-separated');
module.exports = function(code) {
  return resolveSeparated(code, '+', arguments[1]);
};
