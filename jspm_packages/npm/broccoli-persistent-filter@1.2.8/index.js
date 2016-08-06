/* */ 
(function(process) {
  'use strict';
  var fs = require('fs');
  var path = require('path');
  var mkdirp = require('mkdirp');
  var Promise = require('rsvp').Promise;
  var Plugin = require('broccoli-plugin');
  var walkSync = require('walk-sync');
  var mapSeries = require('promise-map-series');
  var symlinkOrCopySync = require('symlink-or-copy').sync;
  var debugGenerator = require('heimdalljs-logger');
  var md5Hex = require('md5-hex');
  var Processor = require('./lib/processor');
  var defaultProccessor = require('./lib/strategies/default');
  var hashForDep = require('hash-for-dep');
  var BlankObject = require('blank-object');
  var FSTree = require('fs-tree-diff');
  var heimdall = require('heimdalljs');
  function ApplyPatchesSchema() {
    this.mkdir = 0;
    this.rmdir = 0;
    this.unlink = 0;
    this.change = 0;
    this.create = 0;
    this.other = 0;
    this.processed = 0;
    this.linked = 0;
    this.processString = 0;
    this.persistentCacheHit = 0;
    this.persistentCachePrime = 0;
  }
  function DerivePatchesSchema() {
    this.patches = 0;
    this.entries = 0;
  }
  module.exports = Filter;
  Filter.prototype = Object.create(Plugin.prototype);
  Filter.prototype.constructor = Filter;
  function Filter(inputTree, options) {
    if (!this || !(this instanceof Filter) || Object.getPrototypeOf(this) === Filter.prototype) {
      throw new TypeError('Filter is an abstract class and must be sub-classed');
    }
    var name = 'broccoli-persistent-filter:' + (this.constructor.name);
    if (this.description) {
      name += ' > [' + this.description + ']';
    }
    this._logger = debugGenerator(name);
    Plugin.call(this, [inputTree]);
    this.processor = new Processor(options);
    this.processor.setStrategy(defaultProccessor);
    this.currentTree = new FSTree();
    this._persistentOutput = true;
    if (options) {
      if (options.extensions != null)
        this.extensions = options.extensions;
      if (options.targetExtension != null)
        this.targetExtension = options.targetExtension;
      if (options.inputEncoding != null)
        this.inputEncoding = options.inputEncoding;
      if (options.outputEncoding != null)
        this.outputEncoding = options.outputEncoding;
      if (options.persist) {
        this.processor.setStrategy(require('./lib/strategies/persistent'));
      }
    }
    this.processor.init(this);
    this._canProcessCache = new BlankObject();
    this._destFilePathCache = new BlankObject();
  }
  Filter.prototype.build = function() {
    var srcDir = this.inputPaths[0];
    var destDir = this.outputPath;
    var instrumentation = heimdall.start('derivePatches', DerivePatchesSchema);
    var entries = walkSync.entries(srcDir);
    var nextTree = new FSTree.fromEntries(entries);
    var currentTree = this.currentTree;
    this.currentTree = nextTree;
    var patches = currentTree.calculatePatch(nextTree);
    instrumentation.stats.patches = patches.length;
    instrumentation.stats.entries = entries.length;
    instrumentation.stop();
    return heimdall.node('applyPatches', ApplyPatchesSchema, function(instrumentation) {
      return mapSeries(patches, function(patch) {
        var operation = patch[0];
        var relativePath = patch[1];
        var entry = patch[2];
        var outputPath = destDir + '/' + (this.getDestFilePath(relativePath) || relativePath);
        var outputFilePath = outputPath;
        this._logger.debug('[operation:%s] %s', operation, relativePath);
        switch (operation) {
          case 'mkdir':
            {
              instrumentation.mkdir++;
              return fs.mkdirSync(outputPath);
            }
          case 'rmdir':
            {
              instrumentation.rmdir++;
              return fs.rmdirSync(outputPath);
            }
          case 'unlink':
            {
              instrumentation.unlink++;
              return fs.unlinkSync(outputPath);
            }
          case 'change':
            {
              instrumentation.change++;
              return this._handleFile(relativePath, srcDir, destDir, entry, outputFilePath, true, instrumentation);
            }
          case 'create':
            {
              instrumentation.create++;
              return this._handleFile(relativePath, srcDir, destDir, entry, outputFilePath, false, instrumentation);
            }
          default:
            {
              instrumentation.other++;
            }
        }
      }, this);
    }, this);
  };
  Filter.prototype._handleFile = function(relativePath, srcDir, destDir, entry, outputPath, isChange, instrumentation) {
    if (this.canProcessFile(relativePath)) {
      instrumentation.processed++;
      return this.processAndCacheFile(srcDir, destDir, entry, isChange, instrumentation);
    } else {
      instrumentation.linked++;
      if (isChange) {
        fs.unlinkSync(outputPath);
      }
      var srcPath = srcDir + '/' + relativePath;
      return symlinkOrCopySync(srcPath, outputPath);
    }
  };
  Filter.prototype.cacheKey = function() {
    return hashForDep(this.baseDir());
  };
  Filter.prototype.baseDir = function() {
    throw Error('Filter must implement prototype.baseDir');
  };
  Filter.prototype.cacheKeyProcessString = function(string, relativePath) {
    return md5Hex(string + 0x00 + relativePath);
  };
  Filter.prototype.canProcessFile = function canProcessFile(relativePath) {
    return !!this.getDestFilePath(relativePath);
  };
  Filter.prototype.getDestFilePath = function(relativePath) {
    if (this.extensions == null) {
      return relativePath;
    }
    for (var i = 0,
        ii = this.extensions.length; i < ii; ++i) {
      var ext = this.extensions[i];
      if (relativePath.slice(-ext.length - 1) === '.' + ext) {
        if (this.targetExtension != null) {
          relativePath = relativePath.slice(0, -ext.length) + this.targetExtension;
        }
        return relativePath;
      }
    }
    return null;
  };
  Filter.prototype.processAndCacheFile = function(srcDir, destDir, entry, isChange, instrumentation) {
    var filter = this;
    var relativePath = entry.relativePath;
    return Promise.resolve().then(function asyncProcessFile() {
      return filter.processFile(srcDir, destDir, relativePath, isChange, instrumentation);
    }).then(undefined, function asyncProcessFileErrorWrapper(e) {
      if (typeof e !== 'object')
        e = new Error('' + e);
      e.file = relativePath;
      e.treeDir = srcDir;
      throw e;
    });
  };
  function invoke(context, fn, args) {
    return new Promise(function(resolve) {
      resolve(fn.apply(context, args));
    });
  }
  Filter.prototype.processFile = function(srcDir, destDir, relativePath, isChange, instrumentation) {
    var filter = this;
    var inputEncoding = this.inputEncoding;
    var outputEncoding = this.outputEncoding;
    if (inputEncoding === undefined)
      inputEncoding = 'utf8';
    if (outputEncoding === undefined)
      outputEncoding = 'utf8';
    var contents = fs.readFileSync(srcDir + '/' + relativePath, {encoding: inputEncoding});
    instrumentation.processString++;
    var string = invoke(this.processor, this.processor.processString, [this, contents, relativePath, instrumentation]);
    return string.then(function asyncOutputFilteredFile(outputString) {
      var outputPath = filter.getDestFilePath(relativePath);
      if (outputPath == null) {
        throw new Error('canProcessFile("' + relativePath + '") is true, but getDestFilePath("' + relativePath + '") is null');
      }
      outputPath = destDir + '/' + outputPath;
      if (isChange) {
        var isSame = fs.readFileSync(outputPath, 'UTF-8') === outputString;
        if (isSame) {
          this._logger.debug('[change:%s] but was the same, skipping', relativePath, isSame);
          return;
        } else {
          this._logger.debug('[change:%s] but was NOT the same, writing new file', relativePath);
        }
      }
      try {
        fs.writeFileSync(outputPath, outputString, {encoding: outputEncoding});
      } catch (e) {
        mkdirp.sync(path.dirname(outputPath));
        fs.writeFileSync(outputPath, outputString, {encoding: outputEncoding});
      }
      return outputString;
    }.bind(this));
  };
  Filter.prototype.processString = function() {
    throw new Error('When subclassing broccoli-persistent-filter you must implement the ' + '`processString()` method.');
  };
  Filter.prototype.postProcess = function(result) {
    return result;
  };
})(require('process'));
