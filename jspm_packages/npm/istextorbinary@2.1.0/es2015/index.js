/* */ 
(function(Buffer) {
  'use strict';
  var pathUtil = require('path');
  var textExtensions = require('textextensions');
  var binaryExtensions = require('binaryextensions');
  function isTextSync(filename, buffer) {
    var isText = null;
    if (filename) {
      var parts = pathUtil.basename(filename).split('.').reverse();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;
      try {
        for (var _iterator = parts[Symbol.iterator](),
            _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var extension = _step.value;
          if (textExtensions.indexOf(extension) !== -1) {
            isText = true;
            break;
          }
          if (binaryExtensions.indexOf(extension) !== -1) {
            isText = false;
            break;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
    if (buffer && isText === null) {
      isText = getEncodingSync(buffer) === 'utf8';
    }
    return isText;
  }
  function isText(filename, buffer, next) {
    var result = isTextSync(filename, buffer);
    if (result instanceof Error) {
      next(result);
    } else {
      next(null, result);
    }
  }
  function isBinarySync(filename, buffer) {
    var result = isTextSync(filename, buffer);
    return result instanceof Error ? result : !result;
  }
  function isBinary(filename, buffer, next) {
    isText(filename, buffer, function(err, result) {
      if (err)
        return next(err);
      return next(null, !result);
    });
  }
  function getEncodingSync(buffer, opts) {
    var textEncoding = 'utf8';
    var binaryEncoding = 'binary';
    if (opts == null) {
      var chunkLength = 24;
      var encoding = getEncodingSync(buffer, {chunkLength: chunkLength});
      if (encoding === textEncoding) {
        var chunkBegin = Math.max(0, Math.floor(buffer.length / 2) - chunkLength);
        encoding = getEncodingSync(buffer, {
          chunkLength: chunkLength,
          chunkBegin: chunkBegin
        });
        if (encoding === textEncoding) {
          chunkBegin = Math.max(0, buffer.length - chunkLength);
          encoding = getEncodingSync(buffer, {
            chunkLength: chunkLength,
            chunkBegin: chunkBegin
          });
        }
      }
      return encoding;
    } else {
      var _opts$chunkLength = opts.chunkLength;
      var _chunkLength = _opts$chunkLength === undefined ? 24 : _opts$chunkLength;
      var _opts$chunkBegin = opts.chunkBegin;
      var _chunkBegin = _opts$chunkBegin === undefined ? 0 : _opts$chunkBegin;
      var chunkEnd = Math.min(buffer.length, _chunkBegin + _chunkLength);
      var contentChunkUTF8 = buffer.toString(textEncoding, _chunkBegin, chunkEnd);
      var _encoding = textEncoding;
      for (var i = 0; i < contentChunkUTF8.length; ++i) {
        var charCode = contentChunkUTF8.charCodeAt(i);
        if (charCode === 65533 || charCode <= 8) {
          _encoding = binaryEncoding;
          break;
        }
      }
      return _encoding;
    }
  }
  function getEncoding(buffer, opts, next) {
    var result = getEncodingSync(buffer, opts);
    if (result instanceof Error) {
      next(result);
    } else {
      next(null, result);
    }
  }
  module.exports = {
    isTextSync: isTextSync,
    isText: isText,
    isBinarySync: isBinarySync,
    isBinary: isBinary,
    getEncodingSync: getEncodingSync,
    getEncoding: getEncoding
  };
})(require('buffer').Buffer);
