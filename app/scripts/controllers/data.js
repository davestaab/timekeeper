(function () {
  'use strict';

  /**
   * @ngdoc function
   * @name timekeeperApp.controller:DataCtrl
   * @description
   * # DataCtrl
   * Controller of the timekeeperApp
   */
  angular.module('timekeeperApp')
    .controller('DataCtrl', ['$scope', 'dataService', '$log', function ($scope, dataService, $log) {
      $scope.service = dataService;
      $scope.addTime = function () {
        // dataService.data
        $log.debug('add time scope: ', $scope);
        dataService.addTime($scope.time, $scope.category);
      };
      $scope.deleteTime = function (item) {
        dataService.deleteTime(item);
      };
      $scope.addCategory = function () {
        if ($scope.newCategory !== '' && angular.isDefined($scope.newCategory)) {
          dataService.currentDay.categories.push($scope.newCategory);
          dataService.updateCount++;
          $scope.newCategory = '';
        }
      };
    }]);

})();
