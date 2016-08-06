/* */ 
(function(Buffer) {
  const pathUtil = require('path');
  const textExtensions = require('textextensions');
  const binaryExtensions = require('binaryextensions');
  function isTextSync(filename, buffer) {
    let isText = null;
    if (filename) {
      const parts = pathUtil.basename(filename).split('.').reverse();
      for (const extension of parts) {
        if (textExtensions.indexOf(extension) !== -1) {
          isText = true;
          break;
        }
        if (binaryExtensions.indexOf(extension) !== -1) {
          isText = false;
          break;
        }
      }
    }
    if (buffer && isText === null) {
      isText = getEncodingSync(buffer) === 'utf8';
    }
    return isText;
  }
  function isText(filename, buffer, next) {
    const result = isTextSync(filename, buffer);
    if (result instanceof Error) {
      next(result);
    } else {
      next(null, result);
    }
  }
  function isBinarySync(filename, buffer) {
    const result = isTextSync(filename, buffer);
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
    const textEncoding = 'utf8';
    const binaryEncoding = 'binary';
    if (opts == null) {
      const chunkLength = 24;
      let encoding = getEncodingSync(buffer, {chunkLength});
      if (encoding === textEncoding) {
        let chunkBegin = Math.max(0, Math.floor(buffer.length / 2) - chunkLength);
        encoding = getEncodingSync(buffer, {
          chunkLength,
          chunkBegin
        });
        if (encoding === textEncoding) {
          chunkBegin = Math.max(0, buffer.length - chunkLength);
          encoding = getEncodingSync(buffer, {
            chunkLength,
            chunkBegin
          });
        }
      }
      return encoding;
    } else {
      const {chunkLength = 24,
        chunkBegin = 0} = opts;
      const chunkEnd = Math.min(buffer.length, chunkBegin + chunkLength);
      const contentChunkUTF8 = buffer.toString(textEncoding, chunkBegin, chunkEnd);
      let encoding = textEncoding;
      for (let i = 0; i < contentChunkUTF8.length; ++i) {
        const charCode = contentChunkUTF8.charCodeAt(i);
        if (charCode === 65533 || charCode <= 8) {
          encoding = binaryEncoding;
          break;
        }
      }
      return encoding;
    }
  }
  function getEncoding(buffer, opts, next) {
    const result = getEncodingSync(buffer, opts);
    if (result instanceof Error) {
      next(result);
    } else {
      next(null, result);
    }
  }
  module.exports = {
    isTextSync,
    isText,
    isBinarySync,
    isBinary,
    getEncodingSync,
    getEncoding
  };
})(require('buffer').Buffer);
