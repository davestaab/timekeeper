/* */ 
require('../paging/index');
require('../tabindex/index');
require('../../template/pagination/pagination.html');
require('./pagination');
var MODULE_NAME = 'ui.bootstrap.module.pagination';
angular.module(MODULE_NAME, ['ui.bootstrap.pagination', 'uib/template/pagination/pagination.html']);
module.exports = MODULE_NAME;
