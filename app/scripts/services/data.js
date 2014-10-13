(function () {
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
})();