/* */ 
require('../position/index-nocss');
require('../stackedMap/index');
require('../../template/tooltip/tooltip-popup.html');
require('../../template/tooltip/tooltip-html-popup.html');
require('../../template/tooltip/tooltip-template-popup.html');
require('./tooltip');
var MODULE_NAME = 'ui.bootstrap.module.tooltip';
angular.module(MODULE_NAME, ['ui.bootstrap.tooltip', 'uib/template/tooltip/tooltip-popup.html', 'uib/template/tooltip/tooltip-html-popup.html', 'uib/template/tooltip/tooltip-template-popup.html']);
module.exports = MODULE_NAME;
