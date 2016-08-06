/* */ 
'use strict';
var helpers = require('broccoli-kitchen-sink-helpers');
var crypto = require('crypto');
var statPathsFor = require('./lib/stat-paths-for');
module.exports = function hashForDep(name, dir, _hashTreeOverride) {
  var inputHashes = statPathsFor(name, dir).map(_hashTreeOverride || helpers.hashTree).join(0x00);
  return crypto.createHash('md5').update(inputHashes).digest('hex');
};
