/* */ 
var mktemp = require('./lib/mktemp');
module.exports = {
  createFile: mktemp.createFile,
  createFileSync: mktemp.createFileSync,
  createDir: mktemp.createDir,
  createDirSync: mktemp.createDirSync
};
