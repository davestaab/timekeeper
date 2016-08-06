/* */ 
(function(process) {
  const path = require('path');
  module.exports = function(opts) {
    if (!opts) {
      opts = {};
    }
    var cwd = opts.cwd;
    var configPath = opts.configPath;
    if (typeof configPath === 'string' && !cwd) {
      cwd = path.dirname(path.resolve(configPath));
    }
    if (typeof cwd === 'string') {
      return path.resolve(cwd);
    }
    return process.cwd();
  };
})(require('process'));
