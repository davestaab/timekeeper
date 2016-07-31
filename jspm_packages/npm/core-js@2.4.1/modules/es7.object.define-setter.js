/* */ 
'use strict';
var $export = require('./_export'),
    toObject = require('./_to-object'),
    aFunction = require('./_a-function'),
    $defineProperty = require('./_object-dp');
require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {__defineSetter__: function __defineSetter__(P, setter) {
    $defineProperty.f(toObject(this), P, {
      set: aFunction(setter),
      enumerable: true,
      configurable: true
    });
  }});
