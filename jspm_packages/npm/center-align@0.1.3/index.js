/* */ 
'use strict';
var utils = require('./utils');
module.exports = function centerAlign(val) {
  return utils.align(val, function(len, longest) {
    return Math.floor((longest - len) / 2);
  });
};
