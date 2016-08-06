/* */ 
var fs = require('fs'),
    join = require('path').join,
    spawn = require('./spawn-sync');
try {
  var result = spawn.tmpFunction({unsafeCleanup: true});
  try {
    fs.mkdirSync(join(result.name, 'issue62'));
    ['foo', 'bar'].forEach(function(subdir) {
      fs.mkdirSync(join(result.name, 'issue62', subdir));
      fs.writeFileSync(join(result.name, 'issue62', subdir, 'baz.txt'), '');
    });
    spawn.out(result.name, spawn.exit);
  } catch (e) {
    spawn.err(e.toString(), spawn.exit);
  }
} catch (e) {
  spawn.err(e, spawn.exit);
}
