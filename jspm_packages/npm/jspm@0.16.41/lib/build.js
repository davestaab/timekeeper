/* */ 
require('core-js/es6/string');
var Promise = require('rsvp').Promise;
var asp = require('rsvp').denodeify;
var fs = require('graceful-fs');
var glob = require('glob');
var rimraf = require('rimraf');
var path = require('path');
var minimatch = require('minimatch');
var build = module.exports;
exports.buildPackage = function(dir, pjson, isCDN) {
  return build.filterIgnoreAndFiles(dir, pjson.ignore, pjson.files).then(function() {
    if (!pjson.directories || !pjson.directories.dist)
      return;
    return asp(fs.stat)(path.resolve(dir, pjson.directories.dist)).then(function(stats) {
      return stats && stats.isDirectory();
    }, function() {
      return false;
    }).then(function(dist) {
      if (dist)
        return build.collapseLibDir(dir, pjson.directories.dist).then(function() {
          return true;
        });
    });
  }).then(function(dist) {
    if (dist)
      return true;
    if (!pjson.directories || !pjson.directories.lib)
      return;
    return asp(fs.stat)(path.resolve(dir, pjson.directories.lib)).then(function(stats) {
      return stats && stats.isDirectory();
    }, function() {
      return false;
    }).then(function(dist) {
      if (dist)
        return build.collapseLibDir(dir, pjson.directories.lib);
    });
  }).then(function(hasDist) {
    if (pjson.format || pjson.shim || pjson.buildConfig || (pjson.registry && pjson.dependencies) || pjson.map)
      return build.compileDir(dir, {
        format: pjson.format,
        shim: pjson.shim,
        dependencies: pjson.dependencies,
        removeJSExtensions: pjson.useJSExtensions,
        map: pjson.map,
        transpile: !hasDist && pjson.buildConfig && pjson.buildConfig.transpile,
        minify: isCDN,
        alwaysIncludeFormat: isCDN
      });
  });
};
exports.filterIgnoreAndFiles = function(dir, ignore, files) {
  if (!ignore && !files)
    return Promise.resolve();
  return asp(glob)(dir + path.sep + '**' + path.sep + '*', {dot: true}).then(function(allFiles) {
    var removeFiles = [];
    allFiles.forEach(function(file) {
      var fileName = path.relative(dir, file).replace(/\\/g, '/');
      if (files && !files.some(function(keepFile) {
        if (keepFile.startsWith('./'))
          keepFile = keepFile.substr(2);
        else if (keepFile.startsWith('/'))
          keepFile = keepFile.substr(1);
        if (inDir(fileName, keepFile, false) || minimatch(fileName, keepFile))
          return true;
      }))
        return removeFiles.push(fileName);
      if (ignore && ignore.some(function(ignoreFile) {
        if (ignoreFile.startsWith('./'))
          ignoreFile = ignoreFile.substr(2);
        else if (ignoreFile.startsWith('/'))
          ignoreFile = ignoreFile.substr(1);
        if (inDir(fileName, ignoreFile, false) || minimatch(fileName, ignoreFile))
          return true;
      }))
        removeFiles.push(fileName);
    });
    return removeFiles.map(function(removeFile) {
      return path.resolve(dir, removeFile);
    }).reverse().reduce(function(removePromise, resolvedFile) {
      return removePromise.then(function() {
        return asp(fs.unlink)(resolvedFile).catch(function(e) {
          if (e.code === 'ENOENT')
            return;
          if (e.code === 'EISDIR' || e.code === 'EPERM')
            return asp(fs.rmdir)(resolvedFile).catch(function(e) {
              if (e.code === 'ENOTEMPTY')
                return;
              throw e;
            });
          throw e;
        });
      });
    }, Promise.resolve());
  });
};
exports.collapseLibDir = function(dir, subDir) {
  if (subDir.endsWith('/'))
    subDir = subDir.substr(0, subDir.length - 1);
  var tmpDir = path.resolve(dir, '..', '.tmp-' + dir.split(path.sep).pop());
  return asp(fs.rename)(path.normalize(dir + path.sep + subDir), tmpDir).then(function() {
    return asp(rimraf)(dir);
  }).then(function() {
    return asp(fs.rename)(tmpDir, dir);
  });
};
function inDir(fileName, dir, sep) {
  return fileName.substr(0, dir.length) === dir && (sep === false || fileName.substr(dir.length - 1, 1) === path.sep);
}
function matchWithWildcard(matches, name) {
  var curMatch;
  var curMatchLength;
  main: for (var p in matches) {
    if (!matches.hasOwnProperty(p))
      continue;
    var matchParts = p.split('/');
    var nameParts = name.split('/');
    if (matchParts.length !== nameParts.length)
      continue;
    var match;
    for (var i = 0; i < matchParts.length; i++) {
      if (matchParts[i].includes('*')) {
        if (!(match = nameParts[i].match(new RegExp(matchParts[i].replace(/([^*\w])/g, '\\$1').replace(/(\*)/g, '(.*)')))))
          continue main;
      } else if (nameParts[i] !== matchParts[i])
        continue main;
    }
    if (p.length >= curMatchLength)
      continue;
    curMatch = p;
    curMatchLength = matchParts.length;
  }
  return curMatch;
}
function prefixMatchLength(name, prefix) {
  var prefixParts = prefix.split('/');
  var nameParts = name.split('/');
  if (prefixParts.length > nameParts.length)
    return 0;
  for (var i = 0; i < prefixParts.length; i++)
    if (nameParts[i] !== prefixParts[i])
      return 0;
  return prefixParts.length;
}
function applyMap(_name, map, baseFile, removeJSExtensions) {
  var name = _name,
      pluginName;
  if (name.includes('!')) {
    pluginName = name.substr(name.indexOf('!') + 1);
    name = name.substr(0, name.length - pluginName.length - 1);
    pluginName = pluginName || name.substr(name.lastIndexOf('.') + 1);
    pluginName = applyMap(pluginName, map, baseFile, false) || pluginName;
  }
  if (removeJSExtensions) {
    if (name.startsWith('./') || name.split('/').length > 1) {
      if (name.endsWith('.js'))
        name = name.substr(0, name.length - 3);
    }
  }
  for (var m in map) {
    if (!map.hasOwnProperty(m))
      continue;
    var matchLength = prefixMatchLength(name, m);
    if (!matchLength)
      continue;
    var subPath = name.split('/').splice(matchLength).join('/');
    var toMap = map[m];
    if (typeof toMap != 'string')
      continue;
    if (toMap.startsWith('./')) {
      toMap = path.relative(path.dirname(baseFile), toMap.substr(2) + '.js').replace(/\\/g, '/');
      if (!toMap.startsWith('.'))
        toMap = './' + toMap;
      toMap = toMap.substr(0, toMap.length - 3);
    }
    return toMap + (subPath ? '/' + subPath : '') + (pluginName ? '!' + pluginName : '');
  }
  if (pluginName)
    name += '!' + pluginName;
  if (name !== _name)
    return name;
}
var esmRegEx = /(^\s*|[}\);\n]\s*)(import\s+(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s+from\s+['"]|\{)|export\s+\*\s+from\s+["']|export\s+(\{|default|function|class|var|const|let|async\s+function))/;
var esmDepRegEx = /(^|\}|\s)(from|import)\s*("([^"]+)"|'([^']+)')/g;
var amdRegEx = /(?:^|[^$_a-zA-Z\xA0-\uFFFF.])define\s*\(\s*("[^"]+"\s*,\s*|'[^']+'\s*,\s*)?\s*(\[(\s*(("[^"]+"|'[^']+')\s*,|\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*(\s*("[^"]+"|'[^']+')\s*,?)?(\s*(\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*\s*\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/;
var amdDefineRegEx = /(?:^|[^$_a-zA-Z\xA0-\uFFFF.])define\s*\(\s*("[^"]+"\s*,|'[^']+'\s*,\s*)?(\[(\s*("[^"]+"|'[^']+')\s*,)*(\s*("[^"]+"|'[^']+')\s*)?\])?/g;
var cjsRequireRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g;
var cjsExportsRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.]|module\.)(exports\s*\[['"]|\exports\s*\.)|(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])module\.exports\s*\=/;
var registerRegEx = /System\.register/;
var metaRegEx = /^(\s*\/\*.*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)+/;
var metaPartRegEx = /\/\*.*\*\/|\/\/[^\n]*|"[^"]+"\s*;?|'[^']+'\s*;?/g;
var initialCommentRegEx = /^\s*(\/\*|\/\/)/;
function detectFormat(source) {
  var meta = source.match(metaRegEx);
  var metadata = {};
  if (meta) {
    var metaParts = meta[0].match(metaPartRegEx);
    for (var i = 0; i < metaParts.length; i++) {
      var len = metaParts[i].length;
      var firstChar = metaParts[i].substr(0, 1);
      if (metaParts[i].endsWith(';'))
        len--;
      if (firstChar !== '"' && firstChar !== '\'')
        continue;
      var metaString = metaParts[i].substr(1, metaParts[i].length - 3);
      var metaName = metaString.substr(0, metaString.indexOf(' '));
      if (metaName) {
        var metaValue = metaString.substr(metaName.length + 1, metaString.length - metaName.length - 1);
        if (metadata[metaName] instanceof Array)
          metadata[metaName].push(metaValue);
        else
          metadata[metaName] = metaValue;
      }
    }
  }
  if (metadata.format)
    return {
      format: metadata.format,
      meta: true
    };
  cjsExportsRegEx.lastIndex = 0;
  cjsRequireRegEx.lastIndex = 0;
  if (source.match(esmRegEx))
    return {format: 'esm'};
  if (source.match(registerRegEx))
    return {format: 'register'};
  if (source.match(amdRegEx))
    return {format: 'amd'};
  if (cjsRequireRegEx.exec(source) || cjsExportsRegEx.exec(source))
    return {format: 'cjs'};
  return {format: 'global'};
}
exports.detectFormat = detectFormat;
exports.compileDir = function(dir, options) {
  dir = path.resolve(dir);
  options.sourceURLBase = options.sourceURLBase || '';
  var compileErrors = '';
  var map = {},
      optionsMap,
      optionsDependencies;
  if (options.map)
    optionsMap = options.map;
  for (var m in optionsMap)
    if (optionsMap.hasOwnProperty(m))
      map[m] = optionsMap[m];
  if (options.dependencies) {
    optionsDependencies = options.dependencies;
    for (var d in optionsDependencies) {
      if (!optionsDependencies.hasOwnProperty(d))
        continue;
      if (map[d])
        continue;
      var curDep = optionsDependencies[d];
      if (curDep.includes(':') || curDep.includes('@'))
        map[d] = curDep;
      else if (curDep && curDep !== '*')
        map[d] = d + '@' + curDep;
      else
        map[d] = d;
    }
  }
  var nl = '\n';
  return asp(glob)(dir + path.sep + '**' + path.sep + '*.js').then(function(files) {
    return Promise.all(files.map(function(file) {
      var changed = false;
      var sourceMap;
      var format;
      if (options.format && typeof options.format === 'string')
        format = options.format.toLowerCase();
      var relFile = path.relative(dir, file);
      var relModule = relFile.substr(0, relFile.length - 3).replace(/\\/g, '/');
      return asp(fs.lstat)(file).then(function(stats) {
        if (stats.isSymbolicLink())
          return;
        return asp(fs.readFile)(file).then(function(source) {
          source += '';
          return Promise.resolve().then(function() {
            if (!options.shim)
              return;
            var match;
            if (!(match = matchWithWildcard(options.shim, relModule)))
              return;
            var curShim = options.shim[match];
            if (curShim instanceof Array)
              curShim = {deps: curShim};
            curShim.deps = curShim.deps || curShim.imports;
            if (typeof curShim.deps === 'string')
              curShim.deps = [curShim.deps];
            var depStr = '"format global";' + nl;
            if (curShim.deps)
              for (var i = 0; i < curShim.deps.length; i++)
                depStr += '"deps ' + curShim.deps[i] + '";' + nl;
            if (curShim.exports)
              depStr += '"exports ' + curShim.exports + '";' + nl;
            changed = true;
            source = depStr + source;
            return true;
          }).then(function(shimmed) {
            if (shimmed)
              return;
            var detected = detectFormat(source);
            if (detected.meta) {
              format = detected.format;
              return;
            }
            if (format == 'es6')
              format = 'esm';
            if (options.alwaysIncludeFormat || !format || detected.format !== format) {
              changed = true;
              source = '"format ' + (format || detected.format) + '";' + nl + source;
            }
            if (!format)
              format = detected.format;
          }).then(function() {
            if (format === 'esm') {
              source = source.replace(esmDepRegEx, function(statement, start, type, str, singleString, doubleString) {
                var name = singleString || doubleString;
                var mapped = applyMap(name, map, relFile, options.removeJSExtensions);
                if (!mapped)
                  return statement;
                changed = true;
                return statement.replace(new RegExp('"' + name + '"|\'' + name + '\'', 'g'), '\'' + mapped + '\'');
              });
            } else if (format === 'amd') {
              amdDefineRegEx.lastIndex = 0;
              var defineStatement = amdDefineRegEx.exec(source);
              if (defineStatement) {
                if (!defineStatement[2])
                  return;
                var depArray = eval(defineStatement[2]);
                depArray = depArray.map(function(name) {
                  var mapped = applyMap(name, map, relFile, options.removeJSExtensions);
                  if (!mapped)
                    return name;
                  changed = true;
                  return mapped;
                });
                if (changed)
                  source = source.replace(defineStatement[2], JSON.stringify(depArray));
              }
            } else if (format === 'cjs') {
              source = source.replace(cjsRequireRegEx, function(statement, singleString, doubleString) {
                var name = singleString || doubleString;
                name = name.substr(1, name.length - 2);
                var mapped = applyMap(name, map, relFile, options.removeJSExtensions);
                if (!mapped)
                  return statement;
                changed = true;
                return statement.replace(new RegExp('"' + name + '"|\'' + name + '\'', 'g'), '\'' + mapped + '\'');
              });
            }
          }).then(function() {
            if (!source.match(initialCommentRegEx)) {
              source = '\/* *\/ \n' + source;
              changed = true;
            }
            if (changed)
              return asp(fs.writeFile)(file, source);
          }).then(function() {
            if (!options.transpile)
              return;
            var traceur = require('traceur');
            traceur.options.sourceMaps = true;
            traceur.options.modules = 'instantiate';
            try {
              var compiler = new traceur.Compiler({
                moduleName: '',
                modules: 'instantiate'
              });
              source = compiler.compile(source, relFile, path.basename(relFile.replace(/\.js$/, '.src.js')));
              sourceMap = compiler.getSourceMap();
            } catch (e) {
              if (!e.stack)
                compileErrors += +'\n';
              else
                compileErrors += e.stack + '\n' + relFile + ': Unable to transpile ES Module\n';
            }
          }).then(function() {
            if (!options.minify)
              return;
            var uglify = require('uglify-js');
            try {
              var ast = uglify.parse(source, {filename: path.basename(relFile.replace(/\.js$/, '.src.js'))});
              ast.figure_out_scope();
              ast = ast.transform(uglify.Compressor({
                warnings: false,
                evaluate: false
              }));
              ast.figure_out_scope();
              ast.compute_char_frequency();
              ast.mangle_names({except: ['require']});
              var source_map = uglify.SourceMap({
                file: path.basename(relFile),
                orig: sourceMap
              });
              source = ast.print_to_string({
                ascii_only: true,
                comments: function(node, comment) {
                  return comment.line === 1 && comment.col === 0;
                },
                source_map: source_map
              });
              sourceMap = source_map.toString();
            } catch (e) {
              compileErrors += relFile + ': Unable to minify file\n';
            }
          }).then(function() {
            if (!options.minify && !options.transpile)
              return;
            return asp(fs.rename)(file, file.replace(/\.js$/, '.src.js')).then(function() {
              return asp(fs.writeFile)(file, source + '\n//# sourceMappingURL=' + relFile.split('/').pop() + '.map');
            }).then(function() {
              return asp(fs.writeFile)(file + '.map', sourceMap);
            });
          });
        }, function(e) {
          if (e.code === 'EISDIR')
            return;
          else
            throw e;
        });
      }, function(e) {
        if (e.code === 'EISDIR')
          return;
        else
          throw e;
      });
    }));
  }).then(function() {
    return compileErrors;
  });
};
