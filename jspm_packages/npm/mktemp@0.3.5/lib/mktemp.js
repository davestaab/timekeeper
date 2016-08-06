/* */ 
var fs = require('fs'),
    randomstring = require('./randomstring');
function createFile(template, callback) {
  var filename = randomstring.generate(template);
  fs.open(filename, 'ax+', 384, function(err, fd) {
    if (err) {
      if (err.code === 'EEXIST') {
        setImmediate(function(tmpl, cb) {
          createFile(tmpl, cb);
        }, template, callback);
        return;
      }
      filename = null;
    }
    if (fd) {
      fs.close(fd, function(err) {
        callback(err, filename);
      });
    } else {
      callback(err, filename);
    }
  });
}
function createFileSync(template) {
  var isExist,
      filename,
      fd;
  do {
    isExist = false;
    filename = randomstring.generate(template);
    try {
      fd = fs.openSync(filename, 'ax+', 384);
    } catch (e) {
      if (e.code === 'EEXIST') {
        isExist = true;
      } else {
        throw e;
      }
    } finally {
      fd && fs.closeSync(fd);
    }
  } while (isExist);
  return filename;
}
function createDir(template, callback) {
  var dirname = randomstring.generate(template);
  fs.mkdir(dirname, 448, function(err) {
    if (err) {
      if (err.code === 'EEXIST') {
        setImmediate(function(tmpl, cb) {
          createDir(tmpl, cb);
        }, template, callback);
        return;
      }
      dirname = null;
    }
    callback(err, dirname);
  });
}
function createDirSync(template) {
  var isExist,
      dirname;
  do {
    isExist = false;
    dirname = randomstring.generate(template);
    try {
      fs.mkdirSync(dirname, 448);
    } catch (e) {
      if (e.code === 'EEXIST') {
        isExist = true;
      } else {
        throw e;
      }
    }
  } while (isExist);
  return dirname;
}
module.exports = {
  createFile: createFile,
  createFileSync: createFileSync,
  createDir: createDir,
  createDirSync: createDirSync
};
