/* */ 
var fs = require('fs'),
    join = require('path').join,
    spawn = require('./spawn');
spawn.tmpFunction({unsafeCleanup: true}, function(err, name) {
  if (err) {
    spawn.err(err, spawn.exit);
    return;
  }
  try {
    fs.mkdirSync(join(name, 'issue62'));
    ['foo', 'bar'].forEach(function(subdir) {
      fs.mkdirSync(join(name, 'issue62', subdir));
      fs.writeFileSync(join(name, 'issue62', subdir, 'baz.txt'), '');
    });
    spawn.out(name, spawn.exit);
  } catch (e) {
    spawn.err(e.toString(), spawn.exit);
  }
});
