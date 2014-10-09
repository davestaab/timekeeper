(function(){
	'use strict';

	/**
	 * @ngdoc service
	 * @name timekeeperApp.dateFormatConst
	 * @description
	 * # dateFormatConst
	 * Constant in the timekeeperApp.
	 */
	angular.module('timekeeperApp')
	  .constant('dateFormat', '%Y-%m-%d')
	  .constant('dateTimeFormat', '%Y-%m-%d %I:%M')
	  .constant('dateKeyFormat', '%Y%m%d%I%M')
	  ;

})();
