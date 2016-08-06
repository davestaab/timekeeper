/* */ 
(function(process) {
  var Promise = require('rsvp').Promise;
  var chalk = require('chalk');
  var apiResolver;
  var logging = true;
  var logBuffer = '';
  var errBuffer = '';
  var logged = false;
  var cli = module.exports;
  var ui = exports;
  ui.logLevel = 3;
  var logTypes = ['err', 'warn', 'ok', 'info', 'debug'];
  process.on('exit', function() {
    if (!apiResolver) {
      if (logBuffer)
        process.stdout.write(logBuffer);
      if (errBuffer)
        process.stderr.write(errBuffer);
    }
  });
  exports.setResolver = function(resolver) {
    apiResolver = resolver;
  };
  var useDefaults;
  exports.useDefaults = function(_useDefaults) {
    if (_useDefaults === undefined)
      _useDefaults = true;
    useDefaults = _useDefaults;
  };
  exports.setLogLevel = function(level) {
    if (!level)
      return;
    var levelIndex = logTypes.indexOf(level);
    if (levelIndex == -1)
      ui.log('warn', 'Unknown log level: ' + level);
    else
      ui.logLevel = levelIndex;
  };
  var format = exports.format = {
    q: function(msg, opt) {
      return moduleMsg(msg) + '' + (opt ? ' [' + opt + ']' : '') + ':';
    },
    err: function(msg) {
      return '\n' + chalk.red.bold('err  ') + moduleMsg(msg);
    },
    info: function(msg) {
      return '     ' + moduleMsg(msg);
    },
    warn: function(msg) {
      return '\n' + chalk.yellow.bold('warn ') + moduleMsg(msg);
    },
    ok: function(msg) {
      return chalk.green.bold('ok   ') + moduleMsg(msg);
    }
  };
  exports.log = function(type, msg) {
    if (apiResolver)
      return apiResolver.emit('log', type, msg);
    logged = true;
    if (arguments.length === 1) {
      msg = type;
      type = null;
    }
    msg = msg || '';
    if (type)
      msg = format[type](msg.toString());
    var logLevel = logTypes.indexOf(type);
    if (logLevel == -1)
      logLevel = 3;
    if (logLevel <= ui.logLevel) {
      if (logging) {
        if (type != 'err')
          console.log(msg);
        else
          console.error(msg);
      } else {
        if (type != 'err')
          logBuffer += msg + '\n';
        else
          errBuffer += msg + '\n';
      }
    }
  };
  function moduleMsg(msg) {
    return msg.replace(/(\s|\`|^)%([^%\n]+)%/g, '$1' + chalk.bold('$2')).replace(/(\s|^)\`([^\`\n]+)\`/g, '$1' + chalk.cyan('$2')).replace(/\n\r?( {0,4}\w)/g, '\n     $1');
  }
  var inputQueue = [];
  var confirm = exports.confirm = function(msg, def) {
    if (useDefaults) {
      if (def !== true && def !== false)
        def = true;
      process.stdout.write(format.q(msg) + (def ? 'Yes' : 'No') + '\n');
      return Promise.resolve(def);
    }
    if (apiResolver)
      return new Promise(function(resolve) {
        apiResolver.emit('prompt', {
          type: 'confirm',
          message: msg,
          default: def
        }, function(answer) {
          resolve(answer);
        });
      });
    var defText = 'y/n';
    if (def === true)
      defText = 'yes';
    else if (def === false)
      defText = 'no';
    else
      def = undefined;
    var p = cli.input(msg, defText);
    return p.then(function(reply) {
      if (reply.match(/\b(no|n)\b/i))
        return false;
      else if (reply.match(/\b(yes|y\b)/i))
        return true;
      else if (def !== undefined)
        return def;
      else
        return confirm(msg, def);
    });
  };
  exports.input = function(msg, def, disableOutput, queue) {
    if (useDefaults) {
      process.stdout.write(format.q(msg) + def + '\n');
      return Promise.resolve(def);
    }
    if (apiResolver)
      return new Promise(function(resolve) {
        apiResolver.emit('prompt', {
          type: 'input',
          message: msg,
          default: def
        }, function(answer) {
          resolve(answer.input);
        });
      });
    if (arguments.length === 2)
      disableOutput = false;
    return new Promise(function(resolve, reject) {
      if (!logging && !queue)
        return inputQueue.push({
          args: [msg, def, disableOutput, true],
          resolve: resolve,
          reject: reject
        });
      if (logging && logged)
        process.stdout.write('\n');
      logging = false;
      process.stdout.write(format.q(msg, def));
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      if (disableOutput && process.stdin.isTTY)
        process.stdin.setRawMode(disableOutput);
      var inputVal = '';
      process.stdin.on('data', function(chunk) {
        var lastChar = chunk.substr(chunk.length - 1, 1);
        if (lastChar === '\n' || lastChar === '\r' || lastChar === '\u0004') {
          if (disableOutput && process.stdin.isTTY)
            process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeAllListeners('data');
          inputVal += chunk.substr(0, chunk.length - 1);
          if (disableOutput)
            process.stdout.write('\n');
          var next = inputQueue.shift();
          if (next)
            cli.input.apply(null, next.args).then(next.resolve, next.reject);
          else {
            process.stdout.write(logBuffer);
            process.stderr.write(errBuffer);
            logBuffer = '';
            errBuffer = '';
            logging = true;
            logged = false;
          }
          resolve(inputVal.trim() || def);
        }
        inputVal += chunk;
      });
    });
  };
})(require('process'));
