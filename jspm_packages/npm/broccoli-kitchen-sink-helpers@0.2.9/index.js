/* */ 
(function(process) {
  var fs = require('fs');
  var path = require('path');
  var crypto = require('crypto');
  var mkdirp = require('mkdirp');
  var glob = require('glob');
  var isWindows = process.platform === 'win32';
  var pathSep = path.sep;
  var keysForTreeWarningPrinted = false;
  exports.hashTree = hashTree;
  function hashTree(fullPath) {
    return hashStrings(keysForTree(fullPath));
  }
  exports.keysForTree = keysForTree;
  function keysForTree(fullPath, initialRelativePath) {
    var relativePath = initialRelativePath || '.';
    var stats;
    var statKeys;
    try {
      stats = fs.statSync(fullPath);
    } catch (err) {
      if (!keysForTreeWarningPrinted) {
        console.warn('Warning: failed to stat ' + fullPath);
        keysForTreeWarningPrinted = true;
      }
    }
    var childKeys = [];
    if (stats) {
      statKeys = ['stats', stats.mode];
    } else {
      statKeys = ['stat failed'];
    }
    if (stats && stats.isDirectory()) {
      var fileIdentity = stats.dev + '\x00' + stats.ino;
      var entries;
      try {
        entries = fs.readdirSync(fullPath).sort();
      } catch (err) {
        console.warn('Warning: Failed to read directory ' + fullPath);
        console.warn(err.stack);
        childKeys = ['readdir failed'];
      }
      if (entries != null) {
        for (var i = 0; i < entries.length; i++) {
          var keys = keysForTree(path.join(fullPath, entries[i]), path.join(relativePath, entries[i]));
          childKeys = childKeys.concat(keys);
        }
      }
    } else if (stats && stats.isFile()) {
      statKeys.push(stats.mtime.getTime());
      statKeys.push(stats.size);
    }
    return ['path', relativePath].concat(statKeys).concat(childKeys);
  }
  exports.hashStats = hashStats;
  function hashStats(stats, path) {
    var keys = [];
    if (stats != null) {
      keys.push(stats.mode, stats.size, stats.mtime.getTime());
    }
    if (path != null) {
      keys.push(path);
    }
    return hashStrings(keys);
  }
  exports.hashStrings = hashStrings;
  function hashStrings(strings) {
    var joinedStrings = strings.join('\x00');
    return crypto.createHash('md5').update(joinedStrings).digest('hex');
  }
  exports.copyRecursivelySync = copyRecursivelySync;
  function copyRecursivelySync(src, dest, _mkdirp) {
    if (_mkdirp == null)
      _mkdirp = true;
    var srcStats = fs.statSync(src);
    if (srcStats.isDirectory()) {
      mkdirp.sync(dest);
      var entries = fs.readdirSync(src).sort();
      for (var i = 0; i < entries.length; i++) {
        copyRecursivelySync(src + '/' + entries[i], dest + '/' + entries[i], false);
      }
    } else {
      if (_mkdirp) {
        mkdirp.sync(path.dirname(dest));
      }
      copyPreserveSync(src, dest, srcStats);
    }
  }
  exports.copyPreserveSync = copyPreserveSync;
  function copyPreserveSync(src, dest, srcStats) {
    if (srcStats == null)
      srcStats = fs.statSync(src);
    if (srcStats.isFile()) {
      var content = fs.readFileSync(src);
      fs.writeFileSync(dest, content, {flag: 'wx'});
      fs.utimesSync(dest, srcStats.atime, srcStats.mtime);
    } else {
      throw new Error('Unexpected file type for ' + src);
    }
  }
  exports.linkRecursivelySync = linkRecursivelySync;
  function linkRecursivelySync() {
    throw new Error('linkRecursivelySync has been removed; use copyRecursivelySync instead (note: it does not overwrite)');
  }
  exports.linkAndOverwrite = linkAndOverwrite;
  function linkAndOverwrite() {
    throw new Error('linkAndOverwrite has been removed; use copyPreserveSync instead (note: it does not overwrite)');
  }
  exports.assertAbsolutePaths = assertAbsolutePaths;
  function assertAbsolutePaths(paths) {
    for (var i = 0; i < paths.length; i++) {
      if (paths[i][0] !== '/') {
        throw new Error('Path must be absolute: "' + paths[i] + '"');
      }
    }
  }
  exports.multiGlob = multiGlob;
  function multiGlob(globs, globOptions) {
    if (!Array.isArray(globs)) {
      throw new TypeError("multiGlob's first argument must be an array");
    }
    var options = {
      follow: true,
      nomount: true,
      strict: true
    };
    for (var key in globOptions) {
      if (globOptions.hasOwnProperty(key)) {
        options[key] = globOptions[key];
      }
    }
    var pathSet = {};
    var paths = [];
    for (var i = 0; i < globs.length; i++) {
      if (options.nomount && globs[i][0] === '/') {
        throw new Error('Absolute paths not allowed (`nomount` is enabled): ' + globs[i]);
      }
      var matches = glob.sync(globs[i], options);
      if (matches.length === 0) {
        throw new Error('Path or pattern "' + globs[i] + '" did not match any files');
      }
      for (var j = 0; j < matches.length; j++) {
        if (!pathSet[matches[j]]) {
          pathSet[matches[j]] = true;
          paths.push(matches[j]);
        }
      }
    }
    return paths;
  }
  exports.symlinkOrCopyPreserveSync = symlinkOrCopyPreserveSync;
  function symlinkOrCopyPreserveSync(sourcePath, destPath) {
    if (isWindows) {
      copyRecursivelySync(sourcePath, destPath);
    } else {
      if (fs.lstatSync(sourcePath).isSymbolicLink()) {
        sourcePath = fs.realpathSync(sourcePath);
      } else if (sourcePath[0] !== pathSep) {
        sourcePath = process.cwd() + pathSep + sourcePath;
      }
      fs.symlinkSync(sourcePath, destPath);
    }
  }
})(require('process'));
