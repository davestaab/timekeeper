(function() {
	'use strict';

	angular.module('timekeeperApp', ['ngRoute'])
	.config(['$routeProvider', function($routeProvider) {
		
	}]); 


})();;(function () {
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
;(function() {
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
;(function() {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name timekeeperApp.directive:timeChart
	 * @description
	 * # timeChart
	 */
	angular.module('timekeeperApp')
	  .directive('timeChart', ['$log', function ($log) {
	    return {
	      template: '<div id="chart"></div>',
	      restrict: 'E',
	      scope: {
	      	day: '=',
	      	refresh: '='
	      },
	      link: function postLink(scope, element, attrs) {
	      	// $log.debug("scope is", scope);
	      	var chart = timeSeriesChart()
	    			.x(function(d) { return d.date; })
	    			.y(function(d) { return d.category; });
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
;(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name timekeeperApp.data
   * @description
   * # dataService maintains all data for the app
   * Service in the timekeeperApp.
   */
  angular.module('timekeeperApp')
    .service('dataService', ['dateTimeFormat', 'dateFormat', '$log', 'dateKeyFormat', function data(dateTimeFormat, dateFormat, $log, dateKeyFormat) {
      var dateFormatter = d3.time.format(dateFormat);
      var dateKeyFormatter = d3.time.format(dateKeyFormat);
      var dateTimeFormatter = d3.time.format(dateTimeFormat);

      var service = {
        data: [],
        // addDay: addDay,
        addTime: addTime,
        deleteTime: deleteTime,
        currentDay: null,
        next: next,
        today: today,
        previous: previous,
        updateCount: 0 // is incremented everytime the data is updated
      };

      /**
       dateStr: yyyy-mm-dd date string
       */
      function addDay(dateStr) {
        var date = dateTimeFormatter.parse(dateStr + ' 01:00');
        var key = dateKeyFormatter(date);
        $log.debug("date key: ", key);
        var day = service.data.reduce(function (memo, e, i) {
          if (memo !== null) return memo;
          return e.dateKey === key ? e : null;
        }, null);
        $log.debug('found day', day);
        if (day === null) {
          day = createDay(key, dateStr);
          service.data.push(day);
        }
        $log.debug('returning day', day);
        service.currentDay = day;
        // sort data list
        return day;
      }

      /**
       * dateStr: YYYY-MM-DD string format
       */
      function find(dateStr) {
        var foundDay = service.data.reduce(function(memo, e, i) {
          if(memo === null) {
            return e.dateStr === dateStr ? e : null;
          }
          return memo;
        }, null);


        $log.debug("found a day: ", foundDay);
        if(foundDay === null) {
          foundDay = createDay(moment(dateStr).format('YYYYMMDD'), dateStr);
        } 
        return foundDay;
      }

      /**
       * find the next day in the list or display a new day if it doesn't exist
       */ 
      function next() {
        var day = service.currentDay.dateStr;
        day = moment(day).add(1, 'd').format('YYYY-MM-DD');
        var foundDay = find(day);
        service.currentDay = foundDay;
        service.updateCount++;
      }

      /*
       * Sets the timeline to the current day 
       */
      function today() {
        var day = moment().format('YYYY-MM-DD');
        var foundDay = find(day);
        service.currentDay = foundDay;
        service.updateCount++;
      }

      function previous() {
        var day = service.currentDay.dateStr;
        day = moment(day).add(-1, 'd').format('YYYY-MM-DD');
        var foundDay = find(day);
        service.currentDay = foundDay;
        service.updateCount++; 
      }

      /**
       * adds the gives time & category to the current day
       */
      function addTime(startTime, category) {
        service.currentDay.timeEntries.push(createTimeEntry(service.currentDay, startTime, category));
        service.currentDay.timeEntries.sort(sortTimeEntries);
        service.updateCount++;
      }

      function deleteTime(index) {
        service.currentDay.timeEntries.splice(index, 1);
        service.updateCount++;
      }


      function createDay(key, dateStr) {
        return {
          dateKey: key,
          dateStr: dateStr,
          timeEntries: [],
          categories: ['project1', 'lunch', 'project2', 'support']
        };
      }

      function createTimeEntry(currentDay, startTimeStr, category) {
        var date = dateTimeFormatter.parse(currentDay.dateStr + ' ' + startTimeStr);
        return {
          date: date,
          category: category
        };
      }

      // create test data
      addDay(moment().format('YYYY-MM-DD'));
      ['8:00', '12:00', '13:00', '17:00'].map(function (e, i) {
        addTime(e, service.currentDay.categories[i]);
      });

      function sortTimeEntries(a,b) {
        console.log("sorting a, b", a, b);
        return a.date.getTime() - b.date.getTime();
      }

     
      return service;

    }]);
})();;(function(){
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
;function timeSeriesChart() {
  var margin = {top: 50, right: 50, bottom: 50, left: 75},
      width = 760,
      height = 200,
      duration = 500, 
      ease = 'cubic-out',
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.time.scale(),
      // yScale = d3.scale.linear(),
      categories = ['red','blue','one','two'],
      yScale = d3.scale.ordinal(),
      // catScale = d3.scale.ordinal(),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(8),
      yAxis = d3.svg.axis().scale(yScale).orient("left"),
      // area = d3.svg.area().x(X).y1(Y),
      line = d3.svg.line().x(X).y(Y).interpolate('step-after');

  function chart(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      // Update the x-scale.
      xScale
          .domain(d3.extent(data, function(d) { return d[0]; }))
          .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      yScale
          .domain(categories)
          .rangePoints([height - margin.top - margin.bottom, 0], 1);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");
      // gEnter.append("path").attr("class", "area");
      gEnter.append("path").attr("class", "line");
      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");

      // Update the outer dimensions.
      svg.attr("width", width)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the area path.
      // g.select(".area")
      //     .attr("d", area.y0(yScale.range()[0]));

      // Update the line path.
      g.select(".line")
          .attr("d", line);

      // Update the x-axis.
      svg
          .select(".x.axis")
          .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
          .transition()
          .duration(duration)
          .ease(ease)
          .call(xAxis);

      // update y axis
      svg.select(".y.axis")
        .transition()
        .duration(duration)
        .ease(ease)
        .call(yAxis);
    });
  }

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.categories = function(_) {
    if (!arguments.length) return categories;
    categories= _;
    return chart;
  };

  chart.debug = function() {
    return {
      yScale: yScale
    };
  };

  return chart;
}