/* */ 
require('../position/index-nocss');
require('../stackedMap/index');
require('../../template/modal/window.html');
require('./modal');
var MODULE_NAME = 'ui.bootstrap.module.modal';
angular.module(MODULE_NAME, ['ui.bootstrap.modal', 'uib/template/modal/window.html']);
module.exports = MODULE_NAME;
