/* */ 
'use strict';
var path = require('path');
var isglob = require('is-glob');
module.exports = function globParent(str) {
  str += 'a';
  do {
    str = path.dirname(str);
  } while (isglob(str));
  return str;
};
