/* */ 
'use strict';
var $export = require('./_export'),
    $indexOf = require('./_array-includes')(false),
    $native = [].indexOf,
    NEGATIVE_ZERO = !!$native && 1 / [1].indexOf(1, -0) < 0;
$export($export.P + $export.F * (NEGATIVE_ZERO || !require('./_strict-method')($native)), 'Array', {indexOf: function indexOf(searchElement) {
    return NEGATIVE_ZERO ? $native.apply(this, arguments) || 0 : $indexOf(this, searchElement, arguments[1]);
  }});
