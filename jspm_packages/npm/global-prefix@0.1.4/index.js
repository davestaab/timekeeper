/* */ 
(function(process) {
  'use strict';
  var fs = require('fs');
  var path = require('path');
  var osenv = require('osenv');
  var ini = require('ini');
  var prefix;
  if (process.env.PREFIX) {
    prefix = process.env.PREFIX;
  } else {
    var userConfig = path.resolve(osenv.home(), '.npmrc');
    prefix = readPrefix(userConfig);
    if (!prefix) {
      var npm = npmPath();
      if (npm) {
        var builtinConfig = path.resolve(npm, '..', '..', 'npmrc');
        prefix = readPrefix(builtinConfig);
        if (prefix) {
          var globalConfig = path.resolve(prefix, 'etc', 'npmrc');
          prefix = readPrefix(globalConfig) || prefix;
        }
      }
      if (!prefix)
        fallback();
    }
  }
  function fallback() {
    var isWindows = require('is-windows');
    if (isWindows()) {
      prefix = process.env.APPDATA ? path.join(process.env.APPDATA, 'npm') : path.dirname(process.execPath);
    } else {
      prefix = path.dirname(path.dirname(process.execPath));
      if (process.env.DESTDIR) {
        prefix = path.join(process.env.DESTDIR, prefix);
      }
    }
  }
  function npmPath() {
    try {
      return fs.realpathSync(require('which').sync('npm'));
    } catch (ex) {}
    return false;
  }
  function readPrefix(configPath) {
    try {
      var data = fs.readFileSync(configPath, 'utf-8');
      var config = ini.parse(data);
      if (config.prefix)
        return config.prefix;
    } catch (ex) {}
    return false;
  }
  module.exports = prefix;
})(require('process'));
