/* */ 
(function(process) {
  var path = require('path');
  var test = require('tape');
  var resolve = require('../index');
  if (process.platform !== 'win32')
    return;
  test('faulty basedir must produce error in windows', function(t) {
    t.plan(1);
    var resolverDir = 'C:\\a\\b\\c\\d';
    resolve('tape/lib/test.js', {basedir: resolverDir}, function(err, res, pkg) {
      t.equal(true, !!err);
    });
  });
})(require('process'));
