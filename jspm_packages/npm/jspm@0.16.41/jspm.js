/* */ 
(function(process) {
  var Liftoff = require('liftoff');
  var path = require('path');
  var jspmCLI = new Liftoff({
    name: 'jspm',
    configName: 'package',
    extensions: {'.json': null}
  });
  jspmCLI.launch({}, function(env) {
    process.env.jspmConfigPath = env.configPath || '';
    process.env.globalJspm = !env.modulePath;
    if (env.modulePath)
      require(path.resolve(env.modulePath, '../cli'));
    else
      require('./cli');
  });
})(require('process'));
