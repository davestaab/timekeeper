(function() {
  'use strict';

  /**
   * @ngdoc directive
   * @name timekeeperApp.directive:timeChart
   * @description
   * # timeChart
   */
  angular.module('timekeeperApp')
    .directive('timeChart', ['$log', function($log) {
      return {
        restrict: 'E',
        scope: {},
        link: function postLink(scope, element, attrs) {
          // $log.debug("scope is", scope);
          var chart = timeSeriesChart()
            .x(function(d) {
              return d.date;
            })
            .y(function(d) {
              return d.category;
            });
          var chartEl = d3.select(element[0]);

          $log.debug('debug yscale', chart.debug());

          scope.$watch('refresh', function(newVal, oldVal) {
            $log.debug('chart day:', newVal);
            chart.categories(scope.day.categories);
            chartEl
              .datum(scope.day.timeEntries)
              .call(chart);
          });
        }
      };
    }]);
})();
