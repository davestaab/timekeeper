/* */ 
(function(process) {
  var path = require('path');
  var homedir = require('os-homedir');
  module.exports = function expandTilde(filepath) {
    var home = homedir();
    if (filepath.charCodeAt(0) === 126) {
      if (filepath.charCodeAt(1) === 43) {
        return path.join(process.cwd(), filepath.slice(2));
      }
      return home ? path.join(home, filepath.slice(1)) : filepath;
    }
    return filepath;
  };
})(require('process'));
