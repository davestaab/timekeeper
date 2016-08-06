/* */ 
(function(process) {
  var fs = require('fs');
  var tmpdir = require('os').tmpdir();
  var path = require('path');
  var isWindows = process.platform === 'win32';
  var options = {
    isWindows: isWindows,
    canSymlink: testCanSymlink(),
    fs: fs
  };
  function testCanSymlink() {
    if (isWindows === false) {
      return true;
    }
    var canLinkSrc = path.join(tmpdir, "canLinkSrc.tmp");
    var canLinkDest = path.join(tmpdir, "canLinkDest.tmp");
    try {
      fs.writeFileSync(canLinkSrc, '');
    } catch (e) {
      return false;
    }
    try {
      fs.symlinkSync(canLinkSrc, canLinkDest);
    } catch (e) {
      fs.unlinkSync(canLinkSrc);
      return false;
    }
    fs.unlinkSync(canLinkSrc);
    fs.unlinkSync(canLinkDest);
    return true;
  }
  module.exports = symlinkOrCopy;
  function symlinkOrCopy() {
    throw new Error("This function does not exist. Use require('symlink-or-copy').sync");
  }
  module.exports.setOptions = setOptions;
  function setOptions(newOptions) {
    options = newOptions;
  }
  module.exports.sync = symlinkOrCopySync;
  function symlinkOrCopySync(srcPath, destPath) {
    if (options.isWindows) {
      symlinkWindows(srcPath, destPath);
    } else {
      symlink(srcPath, destPath);
    }
  }
  function symlink(srcPath, destPath) {
    var lstat = options.fs.lstatSync(srcPath);
    if (lstat.isSymbolicLink()) {
      srcPath = options.fs.realpathSync(srcPath);
    } else if (srcPath[0] !== '/') {
      srcPath = process.cwd() + '/' + srcPath;
    }
    options.fs.symlinkSync(srcPath, destPath);
  }
  var WINDOWS_PREFIX = "\\\\?\\";
  function symlinkWindows(srcPath, destPath) {
    var stat = options.fs.lstatSync(srcPath);
    var isDir = stat.isDirectory();
    var wasResolved = false;
    if (stat.isSymbolicLink()) {
      srcPath = options.fs.realpathSync(srcPath);
      isDir = options.fs.lstatSync(srcPath).isDirectory();
      wasResolved = true;
    }
    srcPath = WINDOWS_PREFIX + (wasResolved ? srcPath : path.resolve(srcPath));
    destPath = WINDOWS_PREFIX + path.resolve(path.normalize(destPath));
    if (options.canSymlink) {
      options.fs.symlinkSync(srcPath, destPath, isDir ? 'dir' : 'file');
    } else {
      if (isDir) {
        options.fs.symlinkSync(srcPath, destPath, 'junction');
      } else {
        options.fs.writeFileSync(destPath, options.fs.readFileSync(srcPath), {
          flag: 'wx',
          mode: stat.mode
        });
        options.fs.utimesSync(destPath, stat.atime, stat.mtime);
      }
    }
  }
})(require('process'));
