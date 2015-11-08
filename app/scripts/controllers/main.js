(function() {
	'use strict';

	/**
	 * @ngdoc function
	 * @name timekeeperApp.controller:MainCtrl
	 * @description
	 * # MainCtrl
	 * Controller of the timekeeperApp
	 */
	angular.module('timekeeperApp')
	  .controller('MainCtrl', ['$scope', 'dataService', '$log', function ($scope, dataService, $log) {
	    $scope.service = dataService;
	  }]);

})();
