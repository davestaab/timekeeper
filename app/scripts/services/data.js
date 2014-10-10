(function() {
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
	    	addDay: addDay,
	    	addTime: addTime,
	    	deleteTime: deleteTime,
	    	currentDay: null,
	    	updateCount: 0 // is incremented everytime the data is updated
	    };

	    /**
			dateStr: yyyy-mm-dd date string
	    */ 
	    function addDay(dateStr) {
	    	var date = dateTimeFormatter.parse(dateStr + ' 01:00');
	    	var key = dateKeyFormatter(date);
	    	$log.debug("date key: ", key);
	    	var day = service.data.reduce(function(memo, e, i){
	    		if(memo !== null) return memo;
	    		return e.dateKey === key ? e : null;
	    	}, null);
	    	$log.debug('found day', day);
	    	if(day === null) {
	    		day = createDay(key, dateStr);
	    	}
	    	$log.debug('returning day', day);
	    	service.data.push(day);
	    	service.currentDay = day;
	    	// sort data list
	    	return day;
	    }

	    /**
		 * adds the gives time & category to the current day
	     */
	    function addTime(startTime, category) {
	    	service.currentDay.timeEntries.push(createTimeEntry(service.currentDay, startTime, category));
	    	service.updateCount++;
	    }

	    function deleteTime(item) {
	    	var i = service.data.indexOf(item);
	    	if(i > -1) {
	    		service.data.indexOf.splice(i, 1);
	    	}
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
	    		index: currentDay.categories.indexOf(category),
	    		category: category
	    	};
	    }
	    
	    // create test data
		addDay('2014-10-08');
	    ['8:00', '12:00', '13:00', '17:00'].map(function(e, i) {
	    	addTime(e, service.currentDay.categories[i]);
	    });

	    return service;

	  }]);
})();