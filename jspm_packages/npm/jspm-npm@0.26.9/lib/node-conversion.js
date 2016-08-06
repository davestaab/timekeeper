/* */ 
(function(Buffer, process) {
  var Promise = require('rsvp').Promise;
  var asp = require('rsvp').denodeify;
  var nodeSemver = require('semver');
  var fs = require('graceful-fs');
  var path = require('path');
  var glob = require('glob');
  var npmResolve = require('resolve');
  var nodeBuiltins = {
    'assert': 'github:jspm/nodelibs-assert@^0.1.0',
    'buffer': 'github:jspm/nodelibs-buffer@^0.1.0',
    'child_process': 'github:jspm/nodelibs-child_process@^0.1.0',
    'cluster': 'github:jspm/nodelibs-cluster@^0.1.0',
    'console': 'github:jspm/nodelibs-console@^0.1.0',
    'constants': 'github:jspm/nodelibs-constants@^0.1.0',
    'crypto': 'github:jspm/nodelibs-crypto@^0.1.0',
    'dgram': 'github:jspm/nodelibs-dgram@^0.1.0',
    'dns': 'github:jspm/nodelibs-dns@^0.1.0',
    'domain': 'github:jspm/nodelibs-domain@^0.1.0',
    'events': 'github:jspm/nodelibs-events@^0.1.1',
    'fs': 'github:jspm/nodelibs-fs@^0.1.0',
    'http': 'github:jspm/nodelibs-http@^1.7.0',
    'https': 'github:jspm/nodelibs-https@^0.1.0',
    'module': 'github:jspm/nodelibs-module@^0.1.0',
    'net': 'github:jspm/nodelibs-net@^0.1.0',
    'os': 'github:jspm/nodelibs-os@^0.1.0',
    'path': 'github:jspm/nodelibs-path@^0.1.0',
    'process': 'github:jspm/nodelibs-process@^0.1.0',
    'punycode': 'github:jspm/nodelibs-punycode@^0.1.0',
    'querystring': 'github:jspm/nodelibs-querystring@^0.1.0',
    'readline': 'github:jspm/nodelibs-readline@^0.1.0',
    'repl': 'github:jspm/nodelibs-repl@^0.1.0',
    'stream': 'github:jspm/nodelibs-stream@^0.1.0',
    'string_decoder': 'github:jspm/nodelibs-string_decoder@^0.1.0',
    'sys': 'github:jspm/nodelibs-util@^0.1.0',
    'timers': 'github:jspm/nodelibs-timers@^0.1.0',
    'tls': 'github:jspm/nodelibs-tls@^0.1.0',
    'tty': 'github:jspm/nodelibs-tty@^0.1.0',
    'url': 'github:jspm/nodelibs-url@^0.1.0',
    'util': 'github:jspm/nodelibs-util@^0.1.0',
    'vm': 'github:jspm/nodelibs-vm@^0.1.0',
    'zlib': 'github:jspm/nodelibs-zlib@^0.1.0'
  };
  var jsonPlugin = exports.jsonPlugin = 'github:systemjs/plugin-json@^0.1.0';
  exports.convertPackage = function(pjson, dir) {
    var packageName = pjson.name;
    var aliases = {};
    if (typeof pjson.browser == 'object') {
      var curAlias;
      var curTarget;
      for (var module in pjson.browser) {
        curAlias = module;
        curTarget = pjson.browser[module];
        if (typeof curTarget != 'string')
          continue;
        if (curAlias.substr(0, 2) != './')
          continue;
        if (curAlias.substr(0, 2) == './')
          curAlias = curAlias.substr(2);
        if (curAlias.substr(curAlias.length - 3, 3) == '.js')
          curAlias = curAlias.substr(0, curAlias.length - 3);
        if (curTarget.substr(curTarget.length - 3, 3) == '.js')
          curTarget = curTarget.substr(0, curTarget.length - 3);
        aliases[curAlias] = curTarget;
      }
    }
    var buildErrors = [];
    var newDeps = {};
    return asp(glob)(dir + path.sep + '**' + path.sep + '*.js').then(function(files) {
      var directoryFiles = [];
      return Promise.all(files.map(function(file) {
        var filename = path.relative(dir, file).replace(/\\/g, '/');
        if (pjson.ignore) {
          if (pjson.ignore.some(function(path) {
            return filename.substr(0, path.length) == path && (filename.substr(path.length, 1) == '/' || filename.substr(path.length, 1) === '');
          }))
            return;
        }
        filename = filename.substr(0, filename.length - 3);
        var source;
        var changed = false;
        return Promise.resolve().then(function() {
          var parts = filename.split('/');
          if (parts.pop() != 'index')
            return;
          var dirName = parts.join(path.sep);
          var dirModule = path.resolve(dir, dirName) + '.js';
          return new Promise(function(resolve, reject) {
            fs.exists(dirModule, resolve);
          }).then(function(exists) {
            if (exists)
              return;
            directoryFiles.push(dirModule);
          });
        }).then(function() {
          return asp(fs.readFile)(file);
        }).then(function(_source) {
          source = _source.toString();
          var meta = source.match(metaRegEx);
          var metadata = {};
          if (meta) {
            var metaParts = meta[0].match(metaPartRegEx);
            for (var i = 0; i < metaParts.length; i++) {
              var len = metaParts[i].length;
              var firstChar = metaParts[i].substr(0, 1);
              if (metaParts[i].substr(len - 1, 1) == ';')
                len--;
              if (firstChar != '"' && firstChar != "'")
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
          if (pjson.format != 'cjs' && !metadata.format)
            return;
          if (metadata.format && metadata.format != 'cjs')
            return;
          if (pjson.shim && pjson.shim[filename])
            return;
          if (source.match(cmdCommentRegEx))
            source = '//' + source;
          var usesBuffer = source.match(bufferRegEx),
              usesProcess = source.match(processRegEx);
          if (pjson.name == 'buffer')
            usesBuffer = false;
          if (pjson.name == 'process')
            usesProcess = false;
          if (usesBuffer || usesProcess) {
            changed = true;
            source = "(function(" + (usesBuffer && 'Buffer' || '') + (usesBuffer && usesProcess && ", " || '') + (usesProcess && 'process' || '') + ") {" + source + "\n})(" + (usesBuffer && "require('buffer').Buffer" || '') + (usesBuffer && usesProcess && ", " || '') + (usesProcess && "require('process')" || '') + ");";
          }
          var baseDir = path.dirname(path.relative(dir, file));
          return require('systemjs-builder/compilers/cjs').remap(source, function(dep) {
            var relPath = path.join(baseDir, dep.replace(/\//g, path.sep)).replace(/\\/g, '/');
            var firstPart = dep.split('/').splice(0, dep.substr(0, 1) == '@' ? 2 : 1).join('/');
            if (firstPart == packageName) {
              var depPath = path.join(dir, dep.replace(firstPart, '').replace(/\//g, path.sep));
              dep = path.relative(path.dirname(file), depPath).replace(/\\/g, '/');
              if (dep.substr(0, 1) != '.')
                dep = './' + dep;
            }
            if (aliases[relPath]) {
              changed = true;
              dep = path.relative(baseDir, aliases[relPath].replace(/\//g, path.sep)).replace(/\\/g, '/');
              if (dep.substr(0, 1) != '.')
                dep = './' + dep;
            } else if (!pjson.dependencies[firstPart] && nodeBuiltins[firstPart]) {
              changed = true;
              if (!filename.match(/^(test|tests|support|example)\//))
                newDeps[firstPart] = nodeBuiltins[firstPart];
              return firstPart;
            } else if (!pjson.dependencies[firstPart]) {
              try {
                var resolved = npmResolve.sync(dep, {
                  basedir: path.dirname(file),
                  extensions: ['.js', '.json']
                });
                if (resolved.substr(0, dir.length) == dir) {
                  dep = path.relative(path.dirname(file), resolved).replace(/\\/g, '/');
                  if (dep.substr(0, 1) != '.')
                    dep = './' + dep;
                  relPath = path.relative(dir, resolved);
                  if (relPath.substr(relPath.length - 3, 3) == '.js')
                    relPath = relPath.substr(0, relPath.length - 3);
                }
              } catch (e) {}
            }
            if (aliases[relPath]) {
              changed = true;
              dep = path.relative(baseDir, aliases[relPath].replace(/\//g, path.sep)).replace(/\\/g, '/');
              if (dep.substr(0, 1) != '.')
                dep = './' + dep;
            }
            if (dep.substr(dep.length - 5, 5) == '.json') {
              changed = true;
              newDeps['systemjs-json'] = jsonPlugin;
              return dep + '!systemjs-json';
            }
            if (dep.substr(dep.length - 1, 1) == '/') {
              changed = true;
              dep = dep.substr(0, dep.length - 1);
            }
            if (dep.substr(dep.length - 3, 3) == '.js' && dep.indexOf('/') != -1) {
              changed = true;
              return dep.substr(0, dep.length - 3);
            }
            return dep;
          }, file).then(function(output) {
            source = output.source;
          });
        }).then(function(output) {
          Object.keys(newDeps).forEach(function(dep) {
            pjson.dependencies[dep] = newDeps[dep];
          });
          if (!changed)
            return;
          return asp(fs.writeFile)(file, source);
        }, function(err) {
          buildErrors.push(err);
        });
      })).then(function() {
        return Promise.all(directoryFiles.map(function(dirFile) {
          var dirName = dirFile.split(path.sep).pop();
          dirName = dirName.substr(0, dirName.length - 3).replace(/\\/g, '/');
          return fs.writeFile(dirFile, "module.exports = require('./" + dirName + "/index');\n");
        }));
      });
    }).then(function() {
      return buildErrors;
    });
  };
  var bufferRegEx = /(?:^|[^$_a-zA-Z\xA0-\uFFFF.])Buffer/;
  var processRegEx = /(?:^|[^$_a-zA-Z\xA0-\uFFFF.])process/;
  var metaRegEx = /^(\s*\/\*.*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)+/;
  var metaPartRegEx = /\/\*.*\*\/|\/\/[^\n]*|"[^"]+"\s*;?|'[^']+'\s*;?/g;
  var cmdCommentRegEx = /^\s*#/;
  var githubRegEx = /^(git(\+[^:]+)?|https):\/\/github.com\/(.+)/;
  var githubHttpRegEx = /^https?:\/\/github\.com\/([^\/]+\/[^\/]+)\/archive\/([^\/]+)\.(tar\.gz|zip)$/;
  var protocolRegEx = /^[^\:\/]+:\/\//;
  var semverRegEx = /^(\d+)(?:\.(\d+)(?:\.(\d+)(?:-([\da-z-]+(?:\.[\da-z-]+)*)(?:\+([\da-z-]+(?:\.[\da-z-]+)*))?)?)?)?$/i;
  function parseDependencies(dependencies, ui) {
    var outDependencies = {};
    var process = function(d) {
      var dep = dependencies[d];
      var match,
          name,
          version = '';
      if ((match = dep.match(githubRegEx))) {
        dep = match[3];
        name = 'github:' + dep.split('#')[0];
        version = dep.split('#')[1] || '*';
        if (version.substr(0, 1) == 'v' && version.substr(1).match(semverRegEx))
          version = version.substr(1);
        if (name.substr(name.length - 4, 4) == '.git')
          name = name.substr(0, name.length - 4);
        ui.log('warn', 'npm dependency `' + name + '@' + version + '` will likely only work if its GitHub repo has %registry: npm% in its package.json');
      } else if ((match = dep.match(githubHttpRegEx))) {
        name = 'github:' + match[1];
        version = match[2];
        if (version.substr(0, 1) == 'v' && version.substr(1).match(semverRegEx))
          version = version.substr(1);
      } else if (dep.match(protocolRegEx))
        throw 'npm dependency format ' + dep + ' not currently supported by jspm. Post an issue if required.';
      else if (dep.split('/').length == 2) {
        name = 'github:' + dep.split('#')[0];
        version = dep.split('#')[1] || '*';
        if (version.substr(0, 1) == 'v' && version.substr(1).match(semverRegEx))
          version = version.substr(1);
      } else {
        name = d;
        version = dep;
      }
      if (!nodeSemver.valid(version)) {
        var range;
        version = version.replace(/, /g, ' ');
        if (!version || version == 'latest' || version == '*')
          version = '*';
        else if (version.indexOf(/[ <>=]/) != -1 || !version.substr(1).match(semverRegEx) || !version.substr(0, 1).match(/[\^\~]/))
          range = nodeSemver.validRange(version);
        if (range == '*')
          version = '*';
        else if (range) {
          if (range.indexOf('||') != -1)
            range = range.split('||').pop();
          var rangeParts = range.split(' ');
          var lowerBound,
              upperBound,
              lEq,
              uEq;
          for (var i = 0; i < rangeParts.length; i++) {
            var part = rangeParts[i];
            var a = part.charAt(0);
            var b = part.charAt(1);
            var v = part;
            if (b == '=')
              v = part.substr(2);
            else if (a == '>' || a == '<' || a == '=')
              v = part.substr(1);
            var gt = a == '>';
            var lt = a == '<';
            if (gt) {
              if (!lowerBound || nodeSemver.gt(lowerBound, v)) {
                lowerBound = v;
                lEq = b == '=';
              }
            } else if (lt) {
              if (!upperBound || nodeSemver.lt(upperBound, v)) {
                upperBound = v;
                uEq = b == '=';
              }
            } else {
              lowerBound = upperBound = (part.substr(0, 1) == '=' ? part.substr(1) : part);
              lEq = uEq = true;
              break;
            }
          }
          if (lowerBound && lowerBound.substr(lowerBound.length - 2, 2) == '-0')
            lowerBound = lowerBound.substr(0, lowerBound.length - 2);
          if (upperBound && upperBound.substr(upperBound.length - 2, 2) == '-0')
            upperBound = upperBound.substr(0, upperBound.length - 2);
          var lowerSemver,
              upperSemver;
          if (lowerBound) {
            lowerSemver = lowerBound.match(semverRegEx);
            lowerSemver[1] = parseInt(lowerSemver[1], 10);
            lowerSemver[2] = parseInt(lowerSemver[2], 10);
            lowerSemver[3] = parseInt(lowerSemver[3], 10);
            if (!lEq) {
              if (!lowerSemver[4])
                lowerSemver[4] = '0';
            }
          }
          if (upperBound) {
            upperSemver = upperBound.match(semverRegEx);
            upperSemver[1] = parseInt(upperSemver[1], 10);
            upperSemver[2] = parseInt(upperSemver[2], 10);
            upperSemver[3] = parseInt(upperSemver[3], 10);
          }
          if (!upperBound && !lowerBound) {
            version = '';
          } else if (!upperBound) {
            version = '*';
          } else if (!lowerBound) {
            if (uEq) {
              version = upperBound;
            } else {
              if (!upperSemver[4]) {
                if (upperSemver[3] > 0) {
                  upperSemver[3]--;
                } else if (upperSemver[2] > 0) {
                  upperSemver[2]--;
                  upperSemver[3] = 0;
                } else if (upperSemver[1] > 0) {
                  upperSemver[1]--;
                  upperSemver[2] = 0;
                  upperSemver[3] = 0;
                }
              } else {
                upperSemver[4] = undefined;
              }
              version = getVersion(upperSemver);
            }
          } else {
            if (uEq)
              version = upperBound;
            else if (upperSemver[2] === 0 && upperSemver[3] === 0 && !upperSemver[4]) {
              if (upperSemver[1] - 1 === 0) {
                version = '0';
              } else {
                if (lowerSemver[1] == upperSemver[1] - 1)
                  version = '^' + getVersion(lowerSemver);
                else
                  version = '^' + (upperSemver[1] - 1);
              }
            } else if (upperSemver[3] === 0 && !upperSemver[4]) {
              if (lowerSemver[2] == upperSemver[2] - 1)
                version = '~' + getVersion(lowerSemver);
              else
                version = '~' + upperSemver[1] + '.' + (upperSemver[2] - 1) + '.0';
            } else
              throw 'Unable to translate npm version ' + version + ' into a jspm range.';
          }
        }
      }
      outDependencies[d] = name + (version ? '@' + version : '');
    };
    for (var d in dependencies)
      process(d);
    return outDependencies;
  }
  function getVersion(semver) {
    return semver[1] + '.' + semver[2] + '.' + semver[3] + (semver[4] ? '-' + semver[4] : '');
  }
  exports.parseDependencies = parseDependencies;
})(require('buffer').Buffer, require('process'));
