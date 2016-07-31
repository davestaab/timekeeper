/* */ 
var basePropertyOf = require('./_basePropertyOf');
var htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;'
};
var escapeHtmlChar = basePropertyOf(htmlEscapes);
module.exports = escapeHtmlChar;
