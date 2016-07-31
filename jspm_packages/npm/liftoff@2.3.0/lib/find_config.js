/* */ 
const fs = require('fs');
const path = require('path');
const fileSearch = require('./file_search');
module.exports = function(opts) {
  opts = opts || {};
  var configNameSearch = opts.configNameSearch;
  var configPath = opts.configPath;
  var searchPaths = opts.searchPaths;
  if (!configPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error('Please provide an array of paths to search for config in.');
    }
    if (!configNameSearch) {
      throw new Error('Please provide a configNameSearch.');
    }
    configPath = fileSearch(configNameSearch, searchPaths);
  }
  if (fs.existsSync(configPath)) {
    return path.resolve(configPath);
  }
  return null;
};
