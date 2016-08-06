/* */ 
require('../datepicker/index-nocss');
require('../position/index-nocss');
require('../../template/datepickerPopup/popup.html');
require('./popup');
var MODULE_NAME = 'ui.bootstrap.module.datepickerPopup';
angular.module(MODULE_NAME, ['ui.bootstrap.datepickerPopup', 'uib/template/datepickerPopup/popup.html', 'ui.bootstrap.module.datepicker']);
module.exports = MODULE_NAME;
