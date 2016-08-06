/* */ 
(function(process) {
  'use strict';
  var fs = require('graceful-fs');
  var path = require('path');
  var extend = require('extend');
  var errcode = require('err-code');
  var retry = require('retry');
  var syncFs = require('./lib/syncFs');
  var locks = {};
  function getLockFile(file) {
    return file + '.lock';
  }
  function canonicalPath(file, options, callback) {
    if (!options.realpath) {
      return callback(null, path.resolve(file));
    }
    options.fs.realpath(file, callback);
  }
  function acquireLock(file, options, callback) {
    options.fs.mkdir(getLockFile(file), function(err) {
      if (!err) {
        return callback();
      }
      if (err.code !== 'EEXIST') {
        return callback(err);
      }
      if (options.stale <= 0) {
        return callback(errcode('Lock file is already being hold', 'ELOCKED', {file: file}));
      }
      options.fs.stat(getLockFile(file), function(err, stat) {
        if (err) {
          if (err.code === 'ENOENT') {
            return acquireLock(file, extend({}, options, {stale: 0}), callback);
          }
          return callback(err);
        }
        if (stat.mtime.getTime() >= Date.now() - options.stale) {
          return callback(errcode('Lock file is already being hold', 'ELOCKED', {file: file}));
        }
        removeLock(file, options, function(err) {
          if (err) {
            return callback(err);
          }
          acquireLock(file, extend({}, options, {stale: 0}), callback);
        });
      });
    });
  }
  function removeLock(file, options, callback) {
    options.fs.rmdir(getLockFile(file), function(err) {
      if (err && err.code !== 'ENOENT') {
        return callback(err);
      }
      callback();
    });
  }
  function updateLock(file, options) {
    var lock = locks[file];
    if (lock.updateTimeout) {
      return;
    }
    lock.updateDelay = lock.updateDelay || options.update;
    lock.updateTimeout = setTimeout(function() {
      var mtime = Date.now() / 1000;
      lock.updateTimeout = null;
      options.fs.utimes(getLockFile(file), mtime, mtime, function(err) {
        if (lock.released) {
          return;
        }
        if (lock.lastUpdate <= Date.now() - options.stale && lock.lastUpdate > Date.now() - options.stale * 2) {
          return compromisedLock(file, lock, errcode(lock.updateError || 'Unable to update lock within the stale threshold', 'ECOMPROMISED'));
        }
        if (err) {
          if (err.code === 'ENOENT') {
            return compromisedLock(file, lock, errcode(err, 'ECOMPROMISED'));
          }
          lock.updateError = err;
          lock.updateDelay = 1000;
          return updateLock(file, options);
        }
        lock.lastUpdate = Date.now();
        lock.updateError = null;
        lock.updateDelay = null;
        updateLock(file, options);
      });
    }, lock.updateDelay);
    lock.updateTimeout.unref();
  }
  function compromisedLock(file, lock, err) {
    lock.released = true;
    lock.updateTimeout && clearTimeout(lock.updateTimeout);
    if (locks[file] === lock) {
      delete locks[file];
    }
    lock.compromised(err);
  }
  function lock(file, options, compromised, callback) {
    if (typeof options === 'function') {
      callback = compromised;
      compromised = options;
      options = null;
    }
    if (!callback) {
      callback = compromised;
      compromised = null;
    }
    options = extend({
      stale: 10000,
      update: null,
      realpath: true,
      retries: 0,
      fs: fs
    }, options);
    options.retries = options.retries || 0;
    options.retries = typeof options.retries === 'number' ? {retries: options.retries} : options.retries;
    options.stale = Math.max(options.stale || 0, 2000);
    options.update = options.update == null ? options.stale / 2 : options.update || 0;
    options.update = Math.max(Math.min(options.update, options.stale / 2), 1000);
    compromised = compromised || function(err) {
      throw err;
    };
    canonicalPath(file, options, function(err, file) {
      var operation;
      if (err) {
        return callback(err);
      }
      operation = retry.operation(options.retries);
      operation.attempt(function() {
        acquireLock(file, options, function(err) {
          var lock;
          if (operation.retry(err)) {
            return;
          }
          if (err) {
            return callback(operation.mainError());
          }
          locks[file] = lock = {
            options: options,
            compromised: compromised,
            lastUpdate: Date.now()
          };
          updateLock(file, options);
          callback(null, function(releasedCallback) {
            if (lock.released) {
              return releasedCallback && releasedCallback(errcode('Lock is already released', 'ERELEASED'));
            }
            unlock(file, extend({}, options, {realpath: false}), releasedCallback);
          });
        });
      });
    });
  }
  function unlock(file, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    options = extend({
      fs: fs,
      realpath: true
    }, options);
    callback = callback || function() {};
    canonicalPath(file, options, function(err, file) {
      var lock;
      if (err) {
        return callback(err);
      }
      lock = locks[file];
      if (!lock) {
        return callback(errcode('Lock is not acquired/owned by you', 'ENOTACQUIRED'));
      }
      lock.updateTimeout && clearTimeout(lock.updateTimeout);
      lock.released = true;
      delete locks[file];
      removeLock(file, options, callback);
    });
  }
  function lockSync(file, options, compromised) {
    var err,
        release;
    if (typeof options === 'function') {
      compromised = options;
      options = null;
    }
    options = options || {};
    options.fs = syncFs(options.fs || fs);
    options.retries = options.retries || 0;
    options.retries = typeof options.retries === 'number' ? {retries: options.retries} : options.retries;
    if (options.retries.retries) {
      throw errcode('Cannot use retries with the sync api', 'ESYNC');
    }
    lock(file, options, compromised, function(_err, _release) {
      err = _err;
      release = _release;
    });
    if (err) {
      throw err;
    }
    return release;
  }
  function unlockSync(file, options) {
    var err;
    options = options || {};
    options.fs = syncFs(options.fs || fs);
    unlock(file, options, function(_err) {
      err = _err;
    });
    if (err) {
      throw err;
    }
  }
  process.on('exit', function() {
    Object.keys(locks).forEach(function(file) {
      try {
        locks[file].options.fs.rmdirSync(getLockFile(file));
      } catch (e) {}
    });
  });
  module.exports = lock;
  module.exports.lock = lock;
  module.exports.unlock = unlock;
  module.exports.lockSync = lockSync;
  module.exports.unlockSync = unlockSync;
})(require('process'));
