/* */ 
var assert = require('assert');
var FS = require('fs');
var JSON5 = require('../lib/json5');
var Path = require('path');
var dirsPath = Path.resolve(__dirname, 'parse-cases');
var dirs = FS.readdirSync(dirsPath);
function createTest(fileName, dir) {
  var ext = Path.extname(fileName);
  var filePath = Path.join(dirsPath, dir, fileName);
  var str = FS.readFileSync(filePath, 'utf8');
  function parseJSON5() {
    return JSON5.parse(str);
  }
  function parseJSON() {
    return JSON.parse(str);
  }
  function parseES5() {
    return eval('"use strict"; (\n' + str + '\n)');
  }
  exports[dir][fileName] = function test() {
    switch (ext) {
      case '.json':
        assert.deepEqual(parseJSON5(), parseJSON(), 'Expected parsed JSON5 to equal parsed JSON.');
        break;
      case '.json5':
        assert.throws(parseJSON, 'Test case bug: expected JSON parsing to fail.');
        if (fileName === 'nan.json5') {
          assert.equal(isNaN(parseJSON5()), isNaN(parseES5()), 'Expected parsed JSON5 to equal parsed ES5.');
        } else {
          assert.deepEqual(parseJSON5(), parseES5(), 'Expected parsed JSON5 to equal parsed ES5.');
        }
        break;
      case '.js':
        assert.throws(parseJSON, 'Test case bug: expected JSON parsing to fail.');
        assert.doesNotThrow(parseES5, 'Test case bug: expected ES5 parsing not to fail.');
        assert.throws(parseJSON5, 'Expected JSON5 parsing to fail.');
        break;
      case '.txt':
        assert.throws(parseES5, 'Test case bug: expected ES5 parsing to fail.');
        assert.throws(parseJSON5, 'Expected JSON5 parsing to fail.');
        break;
    }
  };
}
dirs.forEach(function(dir) {
  exports[dir] = {};
  if (dir === 'todo') {
    return;
  }
  FS.readdirSync(Path.join(dirsPath, dir)).forEach(function(file) {
    createTest(file, dir);
  });
});
