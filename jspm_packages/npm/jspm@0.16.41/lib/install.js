/* */ 
require('core-js/es6/string');
var config = require('./config');
var Promise = require('rsvp').Promise;
var asp = require('rsvp').denodeify;
var pkg = require('./package');
var semver = require('./semver');
var PackageName = require('./config/package-name');
var ui = require('./ui');
var path = require('path');
var link = require('./link');
var globalConfig = require('./global-config');
var rimraf = require('rimraf');
var alphabetize = require('./common').alphabetize;
var cascadeDelete = require('./common').cascadeDelete;
var hasProperties = require('./common').hasProperties;
var fs = require('graceful-fs');
var primaryRanges = {};
var secondaryRanges = {};
var installedResolves = {};
var installingResolves = {};
var installed;
var installing = {
  baseMap: {},
  depMap: {}
};
exports.install = function(targets, options) {
  if (typeof targets === 'string') {
    var name = targets;
    targets = {};
    targets[name] = typeof options === 'string' ? options : '';
    options = typeof options === 'object' ? options : arguments[2];
  }
  options = options || {};
  return config.load().then(function() {
    installed = installed || config.loader;
    if (options.force)
      config.force = true;
    if (options.link || options.quick)
      options.lock = true;
    var d,
        existingTargets = {};
    if (!options.production) {
      for (d in config.pjson.devDependencies)
        existingTargets[d] = config.pjson.devDependencies[d];
    }
    for (d in config.pjson.dependencies)
      existingTargets[d] = config.pjson.dependencies[d];
    if (targets === true)
      targets = existingTargets;
    else if (targets && options.update)
      for (d in targets) {
        if (!existingTargets[d])
          throw '%' + d + '% is not an existing dependency to update.';
        targets[d] = existingTargets[d];
      }
    targets = pkg.processDeps(targets, globalConfig.config.defaultRegistry);
    return Promise.all(Object.keys(targets).map(function(name) {
      return install(name, targets[name], options);
    })).then(function() {
      return saveInstall();
    }).then(function() {
      if (options.summary !== false)
        showVersions(true);
    });
  });
};
function install(name, target, options, seen) {
  var resolution;
  var dependencyDownloads;
  var existing;
  return Promise.resolve().then(function() {
    if (options.link)
      return Promise.resolve(target);
    return pkg.locate(target);
  }).then(function(located) {
    target = located;
    config.loader.ensureRegistry(located.registry, options.inject);
    if (options.link)
      return link.lookup(target, options.edge);
    if (options.lock && (resolution = getInstalledMatch(target, options.parent, name)))
      return Promise.resolve();
    return pkg.lookup(target, options.edge);
  }).then(function(getLatestMatch) {
    if (!getLatestMatch)
      return storeResolution();
    resolution = getLatestMatch(target.version);
    if (!resolution) {
      if (options.parent)
        throw 'Installing `' + options.parent + '`, no version match for `' + target.exactName + '`';
      else
        throw 'No version match found for `' + target.exactName + '`';
    }
    if (!options.parent && !target.version && !options.link) {
      if (resolution.version.match(semver.semverRegEx))
        target.setVersion('^' + resolution.version);
      else
        target.setVersion(resolution.version);
    } else if (options.edge && !options.parent && !options.link) {
      if (!target.version || !semver.match(target.version, resolution.version)) {
        target.setVersion('^' + resolution.version);
      }
    }
    return loadExistingForkRanges(resolution, name, options.parent, options.inject).then(function() {
      var consolidated = false;
      if (!options.latest)
        resolveForks(installing, name, options.parent, resolution, function(forkVersion, forkRanges, allSecondary) {
          if (allSecondary && forkRanges.every(function(forkRange) {
            return semver.match(forkRange, resolution.version);
          })) {
            consolidated = true;
            return resolution.version;
          }
          if (!consolidated && options.parent && semver.match(target.version, forkVersion)) {
            consolidated = true;
            if (forkVersion !== resolution.version) {
              var newResolution = resolution.copy().setVersion(forkVersion);
              logResolution(installingResolves, resolution, newResolution);
              resolution = newResolution;
            }
          }
        });
      resolveForks(installed, name, options.parent, resolution, function(forkVersion, forkRanges) {
        if (options.latest && semver.compare(forkVersion, resolution.version) === 1)
          return;
        if (forkRanges.every(function(forkRange) {
          return semver.match(forkRange, resolution.version);
        })) {
          consolidated = true;
          return resolution.version;
        }
        if (!consolidated && options.parent && !options.latest) {
          var bestSecondaryRollback = resolution;
          forkRanges.forEach(function(forkRange) {
            var forkLatest = getLatestMatch(forkRange);
            if (semver.compare(bestSecondaryRollback.version, forkLatest.version) === 1)
              bestSecondaryRollback = forkLatest;
          });
          if (semver.compare(bestSecondaryRollback.version, forkVersion) === -1)
            bestSecondaryRollback = getLatestMatch(forkVersion);
          if (semver.match(target.version, bestSecondaryRollback.version)) {
            consolidated = true;
            logResolution(installingResolves, resolution, bestSecondaryRollback);
            resolution = bestSecondaryRollback;
            return bestSecondaryRollback.version;
          }
        }
      });
      storeResolution();
    });
  }).then(function() {
    seen = seen || [];
    if (seen.indexOf(resolution.exactName) !== -1)
      return;
    seen.push(resolution.exactName);
    return Promise.resolve().then(function() {
      if (options.link)
        return link.symlink(resolution, downloadDeps);
      if (options.inject)
        return pkg.inject(resolution, downloadDeps);
      return pkg.download(resolution, options, downloadDeps);
    }).then(function(fresh) {
      resolution.fresh = fresh;
      if (options.parent)
        logInstall(name, target, resolution, options);
      return dependencyDownloads;
    }).then(function() {
      if (!options.parent)
        logInstall(name, target, resolution, options);
    });
  });
  function storeResolution() {
    var curMap;
    if (options.parent) {
      curMap = (existing ? installed : installing).depMap;
      curMap[options.parent] = curMap[options.parent] || {};
      curMap[options.parent][name] = resolution.copy();
    } else {
      curMap = (existing ? installed : installing).baseMap;
      curMap[name] = resolution.copy();
    }
    if (!options.parent) {
      if (!primaryRanges[name] || primaryRanges[name].exactName !== target.exactName)
        primaryRanges[name] = target.copy();
      if (!options.link) {
        if (name in config.pjson.dependencies)
          config.pjson.dependencies[name] = primaryRanges[name];
        else if (name in config.pjson.devDependencies)
          config.pjson.devDependencies[name] = primaryRanges[name];
        else if (!options.dev) {
          config.pjson.dependencies[name] = primaryRanges[name];
        } else {
          config.pjson.devDependencies[name] = primaryRanges[name];
        }
        if (options.override)
          config.pjson.overrides[resolution.exactName] = options.override;
      }
    } else {
      secondaryRanges[options.parent] = secondaryRanges[options.parent] || {};
      if (!secondaryRanges[options.parent][name])
        secondaryRanges[options.parent][name] = target.copy();
      else if (secondaryRanges[options.parent][name] && secondaryRanges[options.parent][name].exactName !== target.exactName)
        ui.log('warn', 'Currently installed dependency ranges of `' + options.parent + '` are not consistent ( %' + secondaryRanges[options.parent][name].exactName + '% should be %' + target.exactName + '%)');
    }
  }
  function downloadDeps(depMap) {
    if (!dependencyDownloads && existing)
      installed.depMap[resolution.exactName] = {};
    dependencyDownloads = (dependencyDownloads || Promise.resolve()).then(function() {
      return Promise.all(Object.keys(depMap).map(function(dep) {
        return install(dep, depMap[dep], {
          latest: options.latest,
          lock: options.lock,
          parent: resolution.exactName,
          inject: options.inject,
          quick: options.quick
        }, seen);
      }));
    });
  }
}
function getInstalledMatch(target, parent, name) {
  if (parent) {
    if (installed.depMap[parent] && installed.depMap[parent][name])
      return installed.depMap[parent][name];
  } else {
    if (installed.baseMap[name])
      return installed.baseMap[name];
  }
  var match;
  function checkMatch(pkg) {
    if (pkg.name !== target.name)
      return;
    if (semver.match(target.version, pkg.version)) {
      if (!match || match && semver.compare(pkg.version, match.version) === 1)
        match = pkg.copy();
    }
  }
  Object.keys(installed.baseMap).forEach(function(name) {
    checkMatch(installed.baseMap[name]);
  });
  Object.keys(installed.depMap).forEach(function(parent) {
    var depMap = installed.depMap[parent];
    Object.keys(depMap).forEach(function(name) {
      checkMatch(depMap[name]);
    });
  });
  return match;
}
function saveInstall() {
  return Promise.resolve().then(function() {
    Object.keys(installing.baseMap).forEach(function(p) {
      installed.baseMap[p] = installing.baseMap[p];
    });
    Object.keys(installing.depMap).forEach(function(p) {
      installed.depMap[p] = installing.depMap[p];
    });
    return clean();
  }).then(function() {
    if (hasProperties(installedResolves)) {
      ui.log('');
      ui.log('info', 'The following existing package versions were altered by install deduping:');
      ui.log('');
      Object.keys(installedResolves).forEach(function(pkg) {
        var pkgName = new PackageName(pkg);
        ui.log('info', '  %' + pkgName.package + '% ' + getUpdateRangeText(pkgName, new PackageName(installedResolves[pkg])));
      });
      ui.log('');
      installedResolves = {};
      ui.log('info', 'To keep existing dependencies locked during install, use the %--lock% option.');
    }
    if (hasProperties(installingResolves)) {
      ui.log('');
      ui.log('info', 'The following new package versions were substituted by install deduping:');
      ui.log('');
      Object.keys(installingResolves).forEach(function(pkg) {
        var pkgName = new PackageName(pkg);
        ui.log('info', '  %' + pkgName.package + '% ' + getUpdateRangeText(pkgName, new PackageName(installingResolves[pkg])));
      });
      ui.log('');
      installingResolves = {};
    }
    return config.save();
  });
}
var logged = {};
function logInstall(name, target, resolution, options) {
  if (logged[target.exactName + '=' + resolution.exactName])
    return;
  if (options.parent && resolution.fresh)
    return;
  logged[target.exactName + '=' + resolution.exactName] = true;
  var verb;
  if (options.inject)
    verb = 'Injected';
  else if (!resolution.fresh) {
    if (!options.link)
      verb = 'Installed';
    else
      verb = 'Linked';
  } else {
    if (options.quick)
      return;
    if (!options.link)
      verb = 'Up to date -';
    else
      verb = 'Already linked -';
  }
  if (options.parent)
    ui.log('ok', verb + ' `' + target.exactName + '` (' + resolution.version + ')');
  else
    ui.log('ok', verb + ' %' + name + '% as `' + target.exactName + '` (' + resolution.version + ')');
}
function getUpdateRangeText(existing, update) {
  if (existing.name === update.name)
    return '`' + existing.version + '` -> `' + update.version + '`';
  else
    return '`' + existing.exactName + '` -> `' + update.exactName + '`';
}
function doResolution(tree, from, to) {
  if (from.exactName === to.exactName)
    return;
  logResolution(tree === installed ? installedResolves : installingResolves, from, to);
  Object.keys(tree.baseMap).forEach(function(dep) {
    if (tree.baseMap[dep].exactName === from.exactName)
      tree.baseMap[dep] = to.copy();
  });
  Object.keys(tree.depMap).forEach(function(parent) {
    var curMap = tree.depMap[parent];
    Object.keys(curMap).forEach(function(dep) {
      if (curMap[dep].exactName === from.exactName)
        curMap[dep] = to.copy();
    });
  });
}
function logResolution(resolveLog, from, to) {
  resolveLog[from.exactName] = to.exactName;
  Object.keys(resolveLog).forEach(function(resolveFrom) {
    if (resolveLog[resolveFrom] === from.exactName)
      resolveLog[resolveFrom] = to.exactName;
  });
}
function loadExistingForkRanges(resolution, name, parentName, inject) {
  var tree = installed;
  return Promise.all(Object.keys(tree.baseMap).map(function(dep) {
    if (!parentName && dep === name)
      return;
    var primary = tree.baseMap[dep];
    if (primary.name !== resolution.name)
      return;
    return loadExistingRange(dep, null, inject);
  })).then(function() {
    return Promise.all(Object.keys(tree.depMap).map(function(parent) {
      var curDepMap = tree.depMap[parent];
      return Promise.all(Object.keys(curDepMap).map(function(dep) {
        if (parent === parentName && dep === name)
          return;
        var secondary = curDepMap[dep];
        if (secondary.name !== resolution.name)
          return;
        return loadExistingRange(dep, parent, inject);
      }));
    }));
  });
}
function visitForkRanges(tree, resolution, name, parentName, visit) {
  Object.keys(tree.baseMap).forEach(function(dep) {
    var primary = tree.baseMap[dep];
    if (primary.name !== resolution.name)
      return;
    visit(dep, null, primary, primaryRanges[dep]);
  });
  Object.keys(tree.depMap).forEach(function(parent) {
    var curDepMap = tree.depMap[parent];
    Object.keys(curDepMap).forEach(function(dep) {
      var secondary = curDepMap[dep];
      if (secondary.name !== resolution.name)
        return;
      if (dep === name && parent === parentName)
        return;
      if (!secondaryRanges[parent])
        return;
      visit(dep, parent, secondary, secondaryRanges[parent][dep]);
    });
  });
}
function resolveForks(tree, name, parentName, resolution, resolve) {
  var forks = {};
  var forkVersions = [];
  visitForkRanges(tree, resolution, name, parentName, function(dep, parent, resolved, range) {
    if (!range)
      return;
    if (range.name !== resolved.name || !semver.match(range.version, resolved.version))
      return;
    var forkObj = forks[resolved.version];
    if (!forkObj) {
      forkObj = forks[resolved.version] = {
        ranges: [],
        allSecondary: true
      };
      forkVersions.push(resolved.version);
    }
    if (!parent)
      forkObj.allSecondary = false;
    forkObj.ranges.push(range.version);
  });
  forkVersions.sort(semver.compare).reverse().forEach(function(forkVersion) {
    var forkObj = forks[forkVersion];
    var newVersion = resolve(forkVersion, forkObj.ranges, forkObj.allSecondary);
    if (!newVersion || newVersion === forkVersion)
      return;
    var from = resolution.copy().setVersion(forkVersion);
    var to = resolution.copy().setVersion(newVersion);
    doResolution(tree, from, to);
  });
}
var secondaryDepsPromises = {};
function loadExistingRange(name, parent, inject) {
  if (parent && secondaryRanges[parent] && secondaryRanges[parent][name])
    return;
  else if (!parent && primaryRanges[name])
    return;
  var _target;
  return Promise.resolve().then(function() {
    if (!parent)
      return config.pjson.dependencies[name] || config.pjson.devDependencies[name];
    return Promise.resolve().then(function() {
      if (secondaryDepsPromises[parent])
        return secondaryDepsPromises[parent];
      return Promise.resolve().then(function() {
        var parentPkg = new PackageName(parent);
        return (secondaryDepsPromises[parent] = new Promise(function(resolve, reject) {
          if (inject)
            return pkg.inject(parentPkg, resolve).catch(reject);
          if (config.deps[parentPkg.exactName])
            return resolve();
          pkg.download(parentPkg, {}, resolve).then(resolve, reject);
        }).then(function(depMap) {
          if (depMap)
            return depMap;
          return config.deps[new PackageName(parent).exactName];
        }));
      });
    }).then(function(deps) {
      return deps[name];
    });
  }).then(function(target) {
    if (!target) {
      if (parent && installed.depMap[parent] && installed.depMap[parent].name) {
        delete installed.depMap[parent].name;
        ui.log('warn', '%' + parent + '% dependency %' + name + '% was removed from the config file to reflect the installed package.');
      } else if (!parent) {
        ui.log('warn', '%' + name + '% is installed in the config file, but is not a dependency in the package.json. It is advisable to add it to the package.json file.');
      }
      return;
    }
    _target = target.copy();
    return pkg.locate(_target).then(function(located) {
      if (parent) {
        secondaryRanges[parent] = secondaryRanges[parent] || {};
        secondaryRanges[parent][name] = located;
      } else {
        primaryRanges[name] = located;
      }
    });
  });
}
function showInstallGraph(pkg) {
  installed = installed || config.loader;
  pkg = new PackageName(pkg);
  var lastParent;
  var found;
  return loadExistingForkRanges(pkg, config.loader.local).then(function() {
    ui.log('info', '\nInstalled versions of %' + pkg.name + '%');
    visitForkRanges(installed, pkg, null, null, function(name, parent, resolved, range) {
      found = true;
      if (range.version === '')
        range.version = '*';
      var rangeVersion = range.name === resolved.name ? range.version : range.exactName;
      if (range.version === '*')
        range.version = '';
      if (!parent)
        ui.log('info', '\n       %' + name + '% `' + resolved.version + '` (' + rangeVersion + ')');
      else {
        if (lastParent !== parent) {
          ui.log('info', '\n  ' + parent);
          lastParent = parent;
        }
        ui.log('info', '    ' + name + ' `' + resolved.version + '` (' + rangeVersion + ')');
      }
    });
    if (!found)
      ui.log('warn', 'Package `' + pkg.name + '` not found.');
    ui.log('');
  });
}
exports.showInstallGraph = showInstallGraph;
function showVersions(forks) {
  installed = installed || config.loader;
  var versions = {};
  var haveLinked = false;
  var linkedVersions = {};
  function addDep(dep) {
    var vList = versions[dep.name] = versions[dep.name] || [];
    var version = dep.version;
    try {
      if (fs.readlinkSync(dep.getPath()))
        linkedVersions[dep.exactName] = true;
    } catch (e) {}
    if (vList.indexOf(version) === -1)
      vList.push(version);
  }
  Object.keys(installed.baseMap).forEach(function(dep) {
    addDep(installed.baseMap[dep]);
  });
  Object.keys(installed.depMap).forEach(function(parent) {
    var curMap = installed.depMap[parent];
    Object.keys(curMap).forEach(function(dep) {
      addDep(curMap[dep]);
    });
  });
  versions = alphabetize(versions);
  var vLen = Object.keys(versions).map(function(dep) {
    return dep.length;
  }).reduce(function(a, b) {
    return Math.max(a, b);
  }, 0);
  var shownIntro = false;
  Object.keys(versions).forEach(function(dep) {
    var vList = versions[dep].sort(semver.compare).map(function(version) {
      if (linkedVersions[dep + '@' + version]) {
        haveLinked = true;
        return '%' + version + '%';
      } else
        return '`' + version + '`';
    });
    if (forks && vList.length === 1)
      return;
    if (!shownIntro) {
      ui.log('info', 'Installed ' + (forks ? 'Forks' : 'Versions') + '\n');
      shownIntro = true;
    }
    var padding = vLen - dep.length;
    var paddingString = '';
    while (padding--)
      paddingString += ' ';
    ui.log('info', '  ' + paddingString + '%' + dep + '% ' + vList.join(' '));
  });
  if (haveLinked) {
    ui.log('info', '\nBold versions are linked. To unlink use %jspm install --unlink [name]%.');
  }
  if (shownIntro) {
    ui.log('info', '\nTo inspect individual package constraints, use %jspm inspect registry:name%.\n');
  } else if (forks) {
    ui.log('ok', 'Install tree has no forks.');
  }
}
exports.showVersions = showVersions;
function clean() {
  var packageList = [];
  return config.load().then(function() {
    Object.keys(config.loader.baseMap).forEach(function(dep) {
      getDependentPackages(config.loader.baseMap[dep].exactName, packageList);
    });
    Object.keys(config.loader.depMap).forEach(function(dep) {
      if (packageList.indexOf(dep) === -1) {
        ui.log('info', 'Clearing configuration for `' + dep + '`');
        delete config.loader.depMap[dep];
      }
    });
    var usedOverrides = [];
    packageList.forEach(function(pkgName) {
      var pkgVersion = pkgName.split('@').pop();
      pkgName = pkgName.substr(0, pkgName.length - pkgVersion.length - 1);
      var overrideVersion = Object.keys(config.pjson.overrides).filter(function(overrideName) {
        return overrideName.startsWith(pkgName + '@');
      }).map(function(overrideName) {
        return overrideName.split('@').pop();
      }).filter(function(overrideVersion) {
        return semver.match('^' + overrideVersion, pkgVersion);
      }).sort(semver.compare).pop();
      if (overrideVersion)
        usedOverrides.push(pkgName + '@' + overrideVersion);
    });
    Object.keys(config.pjson.overrides).forEach(function(overrideName) {
      if (usedOverrides.indexOf(overrideName) == -1) {
        ui.log('info', 'Removing unused package.json override `' + overrideName + '`');
        delete config.pjson.overrides[overrideName];
      }
    });
  }).then(function() {
    return asp(fs.lstat)(config.pjson.packages).catch(function(e) {
      if (e.code == 'ENOENT')
        return;
      throw e;
    }).then(function(stats) {
      if (!stats || stats.isSymbolicLink())
        return;
      Object.keys(config.deps).forEach(function(dep) {
        if (packageList.indexOf(dep) == -1)
          delete config.deps[dep];
      });
      return readDirWithDepth(config.pjson.packages, function(dirname) {
        if (dirname.split(path.sep).pop().indexOf('@') <= 0)
          return true;
      }).then(function(packageDirs) {
        return Promise.all(packageDirs.filter(function(dir) {
          var exactName = path.relative(config.pjson.packages, dir).replace(path.sep, ':').replace(/\\/g, '/');
          var remove = packageList.indexOf(exactName) === -1;
          if (remove)
            ui.log('info', 'Removing package files for `' + exactName + '`');
          return remove;
        }).map(function(dir) {
          return asp(rimraf)(dir).then(function() {
            var filename = dir + '.js';
            return new Promise(function(resolve) {
              fs.exists(filename, resolve);
            }).then(function(exists) {
              if (exists)
                return asp(fs.unlink)(filename);
            });
          }).then(function() {
            return cascadeDelete(dir);
          });
        }));
      });
    });
  }).then(function() {
    return config.save();
  });
}
exports.clean = clean;
function readDirWithDepth(dir, depthCheck) {
  var flatDirs = [];
  return asp(fs.readdir)(dir).then(function(files) {
    if (!files)
      return [];
    return Promise.all(files.map(function(file) {
      var filepath = path.resolve(dir, file);
      return asp(fs.lstat)(filepath).then(function(fileInfo) {
        if (!fileInfo.isDirectory())
          return;
        if (!depthCheck(filepath))
          return flatDirs.push(filepath);
        return readDirWithDepth(filepath, depthCheck).then(function(items) {
          items.forEach(function(item) {
            flatDirs.push(item);
          });
        });
      });
    }));
  }).then(function() {
    return flatDirs;
  });
}
function getDependentPackages(pkg, packages) {
  packages.push(pkg);
  var depMap = config.loader.depMap[pkg];
  if (!depMap)
    return;
  Object.keys(depMap).forEach(function(dep) {
    var curPkg = depMap[dep].exactName;
    if (packages.indexOf(curPkg) !== -1)
      return;
    getDependentPackages(curPkg, packages);
  });
  return packages;
}
exports.uninstall = function(names) {
  if (!(names instanceof Array))
    names = [names];
  return config.load().then(function() {
    installed = installed || config.loader;
    names.forEach(function(name) {
      if (!config.pjson.dependencies[name] && !config.pjson.devDependencies[name])
        ui.log('warn', 'Dependency %' + name + '% is not an existing primary install.');
      delete config.pjson.dependencies[name];
      delete config.pjson.devDependencies[name];
      delete installed.baseMap[name];
    });
    return clean();
  });
};
exports.resolveOnly = function(pkg) {
  pkg = new PackageName(pkg);
  if (!pkg.version || !pkg.registry) {
    ui.log('warn', 'Resolve --only must take an exact package of the form `registry:pkg@version`.');
    return Promise.reject();
  }
  var didSomething = false;
  return config.load().then(function() {
    Object.keys(config.loader.baseMap).forEach(function(name) {
      var curPkg = config.loader.baseMap[name];
      if (curPkg.registry === pkg.registry && curPkg.package === pkg.package && curPkg.version !== pkg.version) {
        didSomething = true;
        ui.log('info', 'Primary install ' + getUpdateRangeText(curPkg, pkg));
        config.loader.baseMap[name] = pkg.copy();
      }
    });
    Object.keys(config.loader.depMap).forEach(function(parent) {
      var curMap = config.loader.depMap[parent];
      Object.keys(curMap).forEach(function(name) {
        var curPkg = curMap[name];
        if (curPkg.registry === pkg.registry && curPkg.package === pkg.package && curPkg.version !== pkg.version) {
          didSomething = true;
          ui.log('info', 'In %' + parent + '% ' + getUpdateRangeText(curPkg, pkg));
          curMap[name] = pkg.copy();
        }
      });
    });
    return config.save();
  }).then(function() {
    if (didSomething)
      ui.log('ok', 'Resolution to only use `' + pkg.exactName + '` completed successfully.');
    else
      ui.log('ok', '`' + pkg.exactName + '` is already the only version of the package in use.');
  });
};
