/* */ 
(function(process) {
  const flaggedRespawn = require('../../index');
  flaggedRespawn(['--harmony'], process.argv, function(ready) {
    if (ready) {
      setTimeout(function() {
        process.exit(100);
      }, 100);
    }
  });
})(require('process'));
