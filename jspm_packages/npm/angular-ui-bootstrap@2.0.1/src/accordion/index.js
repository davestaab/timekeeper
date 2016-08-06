/* */ 
require('../collapse/index');
require('../tabindex/index');
require('../../template/accordion/accordion-group.html');
require('../../template/accordion/accordion.html');
require('./accordion');
var MODULE_NAME = 'ui.bootstrap.module.accordion';
angular.module(MODULE_NAME, ['ui.bootstrap.accordion', 'uib/template/accordion/accordion.html', 'uib/template/accordion/accordion-group.html']);
module.exports = MODULE_NAME;
