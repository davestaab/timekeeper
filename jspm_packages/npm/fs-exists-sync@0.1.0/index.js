/* */ 
'use strict';
var fs = require('fs');
module.exports = function(filepath) {
  try {
    (fs.accessSync || fs.statSync)(filepath);
    return true;
  } catch (err) {}
  return false;
};
