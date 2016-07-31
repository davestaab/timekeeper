/* */ 
(function(process) {
  var fs = require('./fs');
  var constants = require('constants');
  var origCwd = process.cwd;
  var cwd = null;
  process.cwd = function() {
    if (!cwd)
      cwd = origCwd.call(process);
    return cwd;
  };
  try {
    process.cwd();
  } catch (er) {}
  var chdir = process.chdir;
  process.chdir = function(d) {
    cwd = null;
    chdir.call(process, d);
  };
  module.exports = patch;
  function patch(fs) {
    if (constants.hasOwnProperty('O_SYMLINK') && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
      patchLchmod(fs);
    }
    if (!fs.lutimes) {
      patchLutimes(fs);
    }
    fs.chown = chownFix(fs.chown);
    fs.fchown = chownFix(fs.fchown);
    fs.lchown = chownFix(fs.lchown);
    fs.chmod = chmodFix(fs.chmod);
    fs.fchmod = chmodFix(fs.fchmod);
    fs.lchmod = chmodFix(fs.lchmod);
    fs.chownSync = chownFixSync(fs.chownSync);
    fs.fchownSync = chownFixSync(fs.fchownSync);
    fs.lchownSync = chownFixSync(fs.lchownSync);
    fs.chmodSync = chmodFixSync(fs.chmodSync);
    fs.fchmodSync = chmodFixSync(fs.fchmodSync);
    fs.lchmodSync = chmodFixSync(fs.lchmodSync);
    if (!fs.lchmod) {
      fs.lchmod = function(path, mode, cb) {
        if (cb)
          process.nextTick(cb);
      };
      fs.lchmodSync = function() {};
    }
    if (!fs.lchown) {
      fs.lchown = function(path, uid, gid, cb) {
        if (cb)
          process.nextTick(cb);
      };
      fs.lchownSync = function() {};
    }
    if (process.platform === "win32") {
      fs.rename = (function(fs$rename) {
        return function(from, to, cb) {
          var start = Date.now();
          fs$rename(from, to, function CB(er) {
            if (er && (er.code === "EACCES" || er.code === "EPERM") && Date.now() - start < 1000) {
              return fs$rename(from, to, CB);
            }
            if (cb)
              cb(er);
          });
        };
      })(fs.rename);
    }
    fs.read = (function(fs$read) {
      return function(fd, buffer, offset, length, position, callback_) {
        var callback;
        if (callback_ && typeof callback_ === 'function') {
          var eagCounter = 0;
          callback = function(er, _, __) {
            if (er && er.code === 'EAGAIN' && eagCounter < 10) {
              eagCounter++;
              return fs$read.call(fs, fd, buffer, offset, length, position, callback);
            }
            callback_.apply(this, arguments);
          };
        }
        return fs$read.call(fs, fd, buffer, offset, length, position, callback);
      };
    })(fs.read);
    fs.readSync = (function(fs$readSync) {
      return function(fd, buffer, offset, length, position) {
        var eagCounter = 0;
        while (true) {
          try {
            return fs$readSync.call(fs, fd, buffer, offset, length, position);
          } catch (er) {
            if (er.code === 'EAGAIN' && eagCounter < 10) {
              eagCounter++;
              continue;
            }
            throw er;
          }
        }
      };
    })(fs.readSync);
  }
  function patchLchmod(fs) {
    fs.lchmod = function(path, mode, callback) {
      fs.open(path, constants.O_WRONLY | constants.O_SYMLINK, mode, function(err, fd) {
        if (err) {
          if (callback)
            callback(err);
          return;
        }
        fs.fchmod(fd, mode, function(err) {
          fs.close(fd, function(err2) {
            if (callback)
              callback(err || err2);
          });
        });
      });
    };
    fs.lchmodSync = function(path, mode) {
      var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
      var threw = true;
      var ret;
      try {
        ret = fs.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs.closeSync(fd);
          } catch (er) {}
        } else {
          fs.closeSync(fd);
        }
      }
      return ret;
    };
  }
  function patchLutimes(fs) {
    if (constants.hasOwnProperty("O_SYMLINK")) {
      fs.lutimes = function(path, at, mt, cb) {
        fs.open(path, constants.O_SYMLINK, function(er, fd) {
          if (er) {
            if (cb)
              cb(er);
            return;
          }
          fs.futimes(fd, at, mt, function(er) {
            fs.close(fd, function(er2) {
              if (cb)
                cb(er || er2);
            });
          });
        });
      };
      fs.lutimesSync = function(path, at, mt) {
        var fd = fs.openSync(path, constants.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs.closeSync(fd);
            } catch (er) {}
          } else {
            fs.closeSync(fd);
          }
        }
        return ret;
      };
    } else {
      fs.lutimes = function(_a, _b, _c, cb) {
        if (cb)
          process.nextTick(cb);
      };
      fs.lutimesSync = function() {};
    }
  }
  function chmodFix(orig) {
    if (!orig)
      return orig;
    return function(target, mode, cb) {
      return orig.call(fs, target, mode, function(er, res) {
        if (chownErOk(er))
          er = null;
        if (cb)
          cb(er, res);
      });
    };
  }
  function chmodFixSync(orig) {
    if (!orig)
      return orig;
    return function(target, mode) {
      try {
        return orig.call(fs, target, mode);
      } catch (er) {
        if (!chownErOk(er))
          throw er;
      }
    };
  }
  function chownFix(orig) {
    if (!orig)
      return orig;
    return function(target, uid, gid, cb) {
      return orig.call(fs, target, uid, gid, function(er, res) {
        if (chownErOk(er))
          er = null;
        if (cb)
          cb(er, res);
      });
    };
  }
  function chownFixSync(orig) {
    if (!orig)
      return orig;
    return function(target, uid, gid) {
      try {
        return orig.call(fs, target, uid, gid);
      } catch (er) {
        if (!chownErOk(er))
          throw er;
      }
    };
  }
  function chownErOk(er) {
    if (!er)
      return true;
    if (er.code === "ENOSYS")
      return true;
    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true;
    }
    return false;
  }
})(require('process'));
