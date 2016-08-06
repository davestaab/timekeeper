/* */ 
var $export = require('./_export'),
    $atanh = Math.atanh;
$export($export.S + $export.F * !($atanh && 1 / $atanh(-0) < 0), 'Math', {atanh: function atanh(x) {
    return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
  }});
