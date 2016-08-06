/* */ 
(function(process) {
  const flaggedRespawn = require('../../index');
  const v8flags = require('v8flags').fetch();
  flaggedRespawn(v8flags, process.argv, function(ready, child) {
    if (ready) {
      console.log('Running!');
    } else {
      console.log('Special flags found, respawning.');
    }
    if (child.pid !== process.pid) {
      console.log('Respawned to PID:', child.pid);
    }
  });
})(require('process'));
