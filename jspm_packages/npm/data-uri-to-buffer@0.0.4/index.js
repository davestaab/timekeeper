/* */ 
(function(Buffer) {
  module.exports = dataUriToBuffer;
  function dataUriToBuffer(uri) {
    if (!/^data\:/i.test(uri)) {
      throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
    }
    uri = uri.replace(/\r?\n/g, '');
    var firstComma = uri.indexOf(',');
    if (-1 === firstComma || firstComma <= 4)
      throw new TypeError('malformed data: URI');
    var meta = uri.substring(5, firstComma).split(';');
    var base64 = false;
    var charset = 'US-ASCII';
    for (var i = 0; i < meta.length; i++) {
      if ('base64' == meta[i]) {
        base64 = true;
      } else if (0 == meta[i].indexOf('charset=')) {
        charset = meta[i].substring(8);
      }
    }
    var data = unescape(uri.substring(firstComma + 1));
    var encoding = base64 ? 'base64' : 'ascii';
    var buffer = new Buffer(data, encoding);
    buffer.type = meta[0] || 'text/plain';
    buffer.charset = charset;
    return buffer;
  }
})(require('buffer').Buffer);
