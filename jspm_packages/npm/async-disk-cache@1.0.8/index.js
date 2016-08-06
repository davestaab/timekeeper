/* */ 
(function(Buffer, process) {
  'use strict';
  var path = require('path');
  var RSVP = require('rsvp');
  var fs = require('fs');
  var readFile = RSVP.denodeify(fs.readFile);
  var writeFile = RSVP.denodeify(fs.writeFile);
  var chmod = RSVP.denodeify(fs.chmod);
  var mkdirp = RSVP.denodeify(require('mkdirp'));
  var rimraf = RSVP.denodeify(require('rimraf'));
  var unlink = RSVP.denodeify(fs.unlink);
  var tmpDir = require('os').tmpDir();
  var debug = require('debug')('async-disk-cache');
  var zlib = require('zlib');
  var CacheEntry = require('./lib/cache-entry');
  function processFile(decompress, filePath) {
    var self = this;
    return function(fileStream) {
      return decompress(fileStream).then(function(value) {
        if (!self.supportBuffer || require('istextorbinary').isTextSync(false, value)) {
          debug('convert to string');
          value = value.toString();
        } else {
          debug('keep data as Buffer');
        }
        return new CacheEntry(true, filePath, value);
      });
    };
  }
  function handleENOENT(reason) {
    if (reason && reason.code === 'ENOENT') {
      return CacheEntry.MISS;
    }
    throw reason;
  }
  var COMPRESSIONS = {
    deflate: {
      in: RSVP.denodeify(zlib.deflate),
      out: RSVP.denodeify(zlib.inflate)
    },
    deflateRaw: {
      in: RSVP.denodeify(zlib.deflateRaw),
      out: RSVP.denodeify(zlib.inflateRaw)
    },
    gzip: {
      in: RSVP.denodeify(zlib.gzip),
      out: RSVP.denodeify(zlib.gunzip)
    }
  };
  function Cache(key, _) {
    var options = _ || {};
    this.tmpDir = options.location || tmpDir;
    this.compression = options.compression || false;
    this.supportBuffer = options.supportBuffer || false;
    this.key = key || 'default-disk-cache';
    this.root = path.join(this.tmpDir, 'if-you-need-to-delete-this-open-an-issue-async-disk-cache', this.key);
    debug('new Cache { root: %s, compression: %s }', this.root, this.compression);
  }
  Cache.prototype.clear = function() {
    debug('clear: %s', this.root);
    return rimraf(path.join(this.root));
  };
  Cache.prototype.has = function(key) {
    var filePath = this.pathFor(key);
    debug('has: %s', filePath);
    return new RSVP.Promise(function(resolve) {
      fs.exists(filePath, resolve);
    });
  };
  Cache.prototype.get = function(key) {
    var filePath = this.pathFor(key);
    debug('get: %s', filePath);
    return readFile(filePath).then(processFile.call(this, this.decompress.bind(this), filePath), handleENOENT);
  };
  Cache.prototype.set = function(key, value) {
    var filePath = this.pathFor(key);
    debug('set : %s', filePath);
    var cache = this;
    return cache.compress(value).then(function(value) {
      return writeP(filePath, value).then(function() {
        return filePath;
      });
    });
  };
  function writeP(filePath, content) {
    var base = path.dirname(filePath);
    return writeFile(filePath, content).catch(function(reason) {
      if (reason && reason.code === 'ENOENT') {
        return mkdirp(base, {mode: '0775'}).then(function() {
          return writeFile(filePath, content);
        });
      } else {
        throw reason;
      }
    }).then(function() {
      return chmod(filePath, parseInt('0666', 8));
    });
  }
  Cache.prototype.remove = function(key) {
    var filePath = this.pathFor(key);
    debug('remove : %s', filePath);
    return unlink(filePath).catch(handleENOENT);
  };
  Cache.prototype.pathFor = function(key) {
    return path.join(this.root, key);
  };
  Cache.prototype.decompress = function(value) {
    if (!this.compression) {
      return RSVP.Promise.resolve(value);
    }
    return COMPRESSIONS[this.compression].out(value);
  };
  Cache.prototype.compress = function(value) {
    if (!this.compression) {
      return RSVP.Promise.resolve(value);
    }
    return COMPRESSIONS[this.compression].in(value);
  };
  module.exports = Cache;
})(require('buffer').Buffer, require('process'));
