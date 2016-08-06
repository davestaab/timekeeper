/* */ 
'use strict';
var Entry = require('./entry');
var logger = require('heimdalljs-logger')('fs-tree-diff:');
var util = require('./util');
var sortAndExpand = util.sortAndExpand;
var validateSortedUnique = util.validateSortedUnique;
var ARBITRARY_START_OF_TIME = 0;
module.exports = FSTree;
function FSTree(options) {
  options = options || {};
  var entries = options.entries || [];
  if (options.sortAndExpand) {
    sortAndExpand(entries);
  } else {
    validateSortedUnique(entries);
  }
  this.entries = entries;
}
FSTree.fromPaths = function(paths, options) {
  if (typeof options !== 'object') {
    options = {};
  }
  var entries = paths.map(function(path) {
    return new Entry(path, 0, ARBITRARY_START_OF_TIME);
  });
  return new FSTree({
    entries: entries,
    sortAndExpand: options.sortAndExpand
  });
};
FSTree.fromEntries = function(entries, options) {
  if (typeof options !== 'object') {
    options = {};
  }
  return new FSTree({
    entries: entries,
    sortAndExpand: options.sortAndExpand
  });
};
Object.defineProperty(FSTree.prototype, 'size', {get: function() {
    return this.entries.length;
  }});
FSTree.prototype.forEach = function(fn, context) {
  this.entries.forEach(fn, context);
};
FSTree.prototype.calculatePatch = function(otherFSTree, isEqual) {
  if (arguments.length > 1 && typeof isEqual !== 'function') {
    throw new TypeError('calculatePatch\'s second argument must be a function');
  }
  if (typeof isEqual !== 'function') {
    isEqual = FSTree.defaultIsEqual;
  }
  var ours = this.entries;
  var theirs = otherFSTree.entries;
  var operations = [];
  var i = 0;
  var j = 0;
  var removals = [];
  var command;
  while (i < ours.length && j < theirs.length) {
    var x = ours[i];
    var y = theirs[j];
    if (x.relativePath < y.relativePath) {
      i++;
      command = removeCommand(x);
      if (x.isDirectory()) {
        removals.push(command);
      } else {
        operations.push(command);
      }
    } else if (x.relativePath > y.relativePath) {
      j++;
      operations.push(addCommand(y));
    } else {
      if (!isEqual(x, y)) {
        command = updateCommand(y);
        if (x.isDirectory()) {
          removals.push(command);
        } else {
          operations.push(command);
        }
      }
      i++;
      j++;
    }
  }
  for (; i < ours.length; i++) {
    removals.push(removeCommand(ours[i]));
  }
  for (; j < theirs.length; j++) {
    operations.push(addCommand(theirs[j]));
  }
  return operations.concat(removals.reverse());
};
FSTree.defaultIsEqual = function defaultIsEqual(entryA, entryB) {
  if (entryA.isDirectory() && entryB.isDirectory()) {
    return true;
  }
  var equal = entryA.size === entryB.size && +entryA.mtime === +entryB.mtime && entryA.mode === entryB.mode;
  if (!equal) {
    logger.info('invalidation reason: \nbefore %o\n entryB %o', entryA, entryB);
  }
  return equal;
};
function addCommand(entry) {
  return [entry.isDirectory() ? 'mkdir' : 'create', entry.relativePath, entry];
}
function removeCommand(entry) {
  return [entry.isDirectory() ? 'rmdir' : 'unlink', entry.relativePath, entry];
}
function updateCommand(entry) {
  return ['change', entry.relativePath, entry];
}
