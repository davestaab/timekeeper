/* */ 
(function(process) {
  var ui = require('./ui');
  var fs = require('graceful-fs');
  var path = require('path');
  var HOME = require('./config').HOME;
  var lockFile = require('proper-lockfile');
  var dprepend = require('./common').dprepend;
  var readJSONSync = require('./common').readJSONSync;
  var stringify = require('./common').stringify;
  exports.registries = [];
  var globalConfigFile = HOME + path.sep + '.jspm' + path.sep + 'config';
  if (process.env.USERPROFILE && HOME !== process.env.USERPROFILE && !fs.existsSync(path.join(HOME, '.jspm')) && fs.existsSync(path.join(process.env.USERPROFILE, '.jspm'))) {
    var OLD_HOME = process.env.USERPROFILE;
    var from = path.join(OLD_HOME, '.jspm');
    var to = path.join(HOME, '.jspm');
    ui.log('info', 'Migrating global jspm folder from `' + from + '` to `' + to + '`...');
    try {
      ui.log('info', 'Copying configuration...');
      var oldConfig = fs.readFileSync(path.resolve(from, 'config'));
      fs.mkdirSync(to);
      fs.writeFileSync(path.resolve(to, 'config'), oldConfig);
      ui.log('ok', 'Migration successful. Note that linked packages will need to be relinked.');
    } catch (e) {
      ui.log('err', 'Error migrating to new jspm folder\n' + (e && e.stack || e));
    }
  }
  lock();
  exports.config = readJSONSync(globalConfigFile);
  if (!exports.config.defaultRegistry && exports.config.registry)
    exports.config.defaultRegistry = exports.config.registry;
  if (!exports.config.registries && exports.config.endpoints)
    exports.config.registries = exports.config.endpoints;
  if (exports.config.github) {
    dprepend(exports.config.registries.github, exports.config.github);
    delete exports.config.github;
  }
  dprepend(exports.config, {
    defaultTranspiler: 'babel',
    defaultRegistry: 'jspm',
    strictSSL: true,
    registries: {
      github: {
        handler: 'jspm-github',
        remote: 'https://github.jspm.io'
      },
      npm: {
        handler: 'jspm-npm',
        remote: 'https://npm.jspm.io'
      },
      jspm: {
        handler: 'jspm-registry',
        remote: 'https://registry.jspm.io'
      }
    }
  });
  try {
    if (HOME)
      save();
  } catch (ex) {
    console.error('Unable to initialize JSPM home configuration folder!');
  }
  unlock();
  function save() {
    try {
      fs.mkdirSync(HOME + path.sep + '.jspm');
    } catch (e) {
      if (e.code !== 'EEXIST')
        throw 'Unable to create jspm system folder\n' + e.stack;
    }
    try {
      lock();
      var existing = readJSONSync(globalConfigFile);
      if (JSON.stringify(existing) != JSON.stringify(exports.config)) {
        fs.writeFileSync(globalConfigFile, stringify(exports.config));
      }
    } catch (e) {
      throw 'Unable to write global configuration file\n' + e.stack;
    } finally {
      unlock();
    }
  }
  exports.save = save;
  exports.set = function(name, val) {
    var nameParts = name.split('.');
    var config = exports.config;
    var part;
    while (nameParts.length > 1) {
      part = nameParts.shift();
      config[part] = typeof config[part] === 'object' ? config[part] : {};
      config = config[part];
    }
    if (val !== undefined) {
      config[nameParts[0]] = val;
    } else {
      delete config[nameParts[0]];
    }
    save();
  };
  var _unlock;
  function lock() {
    if (!_unlock) {
      try {
        _unlock = lockFile.lockSync(globalConfigFile, {
          retries: {
            retries: 10,
            minTimeout: 20,
            maxTimeout: 300,
            randomize: true
          },
          realpath: false
        });
      } catch (e) {
        if (e.code === 'ELOCKED')
          throw 'Unable to lock global config file %' + globalConfigFile + '%, not overwriting';
      }
    }
  }
  function unlock() {
    if (_unlock) {
      _unlock();
      _unlock = undefined;
    }
  }
  process.once('SIGINT', function() {
    process.exit(1);
  }).once('SIGTERM', function() {
    process.exit(1);
  });
})(require('process'));
