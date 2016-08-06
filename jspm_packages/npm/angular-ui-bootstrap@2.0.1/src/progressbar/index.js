/* */ 
require('../../template/progressbar/progressbar.html');
require('../../template/progressbar/progress.html');
require('../../template/progressbar/bar.html');
require('./progressbar');
var MODULE_NAME = 'ui.bootstrap.module.progressbar';
angular.module(MODULE_NAME, ['ui.bootstrap.progressbar', 'uib/template/progressbar/progressbar.html', 'uib/template/progressbar/progress.html', 'uib/template/progressbar/bar.html']);
module.exports = MODULE_NAME;
