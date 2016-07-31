/* */ 
(function(process) {
  var Promise = require('rsvp').Promise;
  var exec = require('child_process').exec;
  var os = require('os');
  function Pool(count) {
    this.count = count;
    this.queue = [];
    this.promises = new Array(count);
  }
  function run(pool, idx, executionFunction) {
    var p = Promise.resolve().then(executionFunction).then(function() {
      delete pool.promises[idx];
      var next = pool.queue.pop();
      if (next)
        pool.execute(next);
    });
    pool.promises[idx] = p;
    return p;
  }
  function enqueue(pool, executeFunction) {
    return new Promise(function(resolve) {
      pool.queue.push(function() {
        return Promise.resolve().then(executeFunction).then(resolve);
      });
    });
  }
  Pool.prototype.execute = function(executionFunction) {
    var idx = -1;
    for (var i = 0; i < this.count; i++)
      if (!this.promises[i])
        idx = i;
    if (idx !== -1)
      return run(this, idx, executionFunction);
    else
      return enqueue(this, executionFunction);
  };
  if (process.platform === 'win32') {
    var gitPool = new Pool(Math.min(os.cpus().length, 2));
    module.exports = function(command, execOpt, callback) {
      return gitPool.execute(function() {
        return new Promise(function(resolve) {
          exec('git ' + command, execOpt, function(err, stdout, stderr) {
            callback(err, stdout, stderr);
            resolve();
          });
        });
      });
    };
  } else {
    module.exports = function(command, execOpt, callback) {
      exec('git ' + command, execOpt, callback);
    };
  }
})(require('process'));
