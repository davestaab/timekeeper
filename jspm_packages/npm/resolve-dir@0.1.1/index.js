/* */ 
'use strict';
var path = require('path');
var expand = require('expand-tilde');
var gm = require('global-modules');
module.exports = function resolveDir(dir) {
  if (dir.charAt(0) === '~') {
    dir = expand(dir);
  }
  if (dir.charAt(0) === '@') {
    dir = path.join(gm, dir.slice(1));
  }
  return dir;
};
