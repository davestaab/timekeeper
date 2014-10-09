(function() {
	'use strict';

	/**
	 * @ngdoc function
	 * @name timekeeperApp.controller:DataCtrl
	 * @description
	 * # DataCtrl
	 * Controller of the timekeeperApp
	 */
	angular.module('timekeeperApp')
	  .controller('DataCtrl', ['$scope', 'dataService', function ($scope, dataService) {
	    $scope.msg= 'hello data world';
	    $scope.service = dataService;
	  }]);

})();
