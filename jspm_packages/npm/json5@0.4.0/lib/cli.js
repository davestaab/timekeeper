/* */ 
(function(process) {
  var FS = require('fs');
  var JSON5 = require('./json5');
  var Path = require('path');
  var USAGE = ['Usage: json5 -c path/to/file.json5 ...', 'Compiles JSON5 files into sibling JSON files with the same basenames.'].join('\n');
  var args = process.argv;
  if (args.length < 4 || args[2] !== '-c') {
    console.error(USAGE);
    process.exit(1);
  }
  var cwd = process.cwd();
  var files = args.slice(3);
  files.forEach(function(file) {
    var path = Path.resolve(cwd, file);
    var basename = Path.basename(path, '.json5');
    var dirname = Path.dirname(path);
    var json5 = FS.readFileSync(path, 'utf8');
    var obj = JSON5.parse(json5);
    var json = JSON.stringify(obj, null, 4);
    path = Path.join(dirname, basename + '.json');
    FS.writeFileSync(path, json, 'utf8');
  });
})(require('process'));
