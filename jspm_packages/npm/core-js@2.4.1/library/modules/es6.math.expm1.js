/* */ 
var $export = require('./_export'),
    $expm1 = require('./_math-expm1');
$export($export.S + $export.F * ($expm1 != Math.expm1), 'Math', {expm1: $expm1});
