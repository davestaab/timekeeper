import BootstrapTimeline from '../../timeline/BootstrapTimeline';
import moment from 'moment';

export default ngModule => {
    ngModule.component('main', {
        templateUrl: 'app/main/main.html',
        controller: MainController,
    });
}

function MainController ($log, $scope, $localStorage, $window) {
    let $ctrl = this;
    let id = 1;
    let chart;
    let entry;
    const DEFAULT_CATEGORIES = [category('Lunch'), category('Overhead'), category('Work')];
    const SAVE_DATE_FORMAT = 'YYYY-MM-DD';
    const SAVED_DATA = 'SAVED_DATA';

    /****************************************
    *      Controller Attributes           *
    ****************************************/
    // $ctrl.categories = [];
    $ctrl.data;
    $ctrl.times;
    $ctrl.newCategory;
    /****************************************
    *      Controller API                  *
    ****************************************/
    $ctrl.addCategory = addCategory;
    $ctrl.deleteCategory = deleteCategory;
    $ctrl.total = total;
    /****************************************
    *      Lifecycle Hooks                 *
    ****************************************/

    $ctrl.$onInit = function() {
        entry = setupSaving();
        $ctrl.categories = entry.categories;
        chart = BootstrapTimeline('.chart')
            .categories(entry.categories.map(catToName))
            .data(entry.data.map(inflate))
            .notifyOnUpdate(function (chart) {
                // the chart is outside of Angular,
                // so we need to trigger a digest cycle.
                $scope.$applyAsync(function () {

                    $ctrl.times = chart.timesByCategory();
                    $ctrl.data = chart.data();
                    // sync to local storage
                    entry.data = $ctrl.data;
                });
                // $log.debug(chart.debug());
            })
        ;
        // $log.debug(chart.debug());
    };
    $ctrl.$onChanges = function () {}
    $ctrl.$postLink = function () {}
    $ctrl.$onDestroy = function () {}

    /****************************************
    *      API Functions                   *
    ****************************************/
    function addCategory(newCategory) {
        if(newCategory){
            $ctrl.categories.push(category(newCategory));
            $ctrl.newCategory = '';
            chart.categories($ctrl.categories.map(catToName));
            $window.document.getElementById('newCategory').focus();
            // sync to local storage
            entry.categories = $ctrl.categories;
        }
    }

    function deleteCategory(index) {
        $ctrl.categories.splice(index, 1);
        chart.categories($ctrl.categories.map(catToName));
        // sync to local storage
        entry.categories = $ctrl.categories;
    }

    function total() {
        let total = 0;
        for(let t in $ctrl.times) {
            total += $ctrl.times[t];
        }
        return total;
    }
    /****************************************
    *      Private Functions               *
    ****************************************/
    /**
     * Look at local storage and setup any saved data that might exist.
     * If not, create a new entry to save our data
     * @return {[type]} [description]
     */
    function setupSaving() {
        // debugger;
        // delete $localStorage[SAVED_DATA];
        $log.debug('saved data', $localStorage);
        let today = moment().format(SAVE_DATE_FORMAT);
        if(!$localStorage[SAVED_DATA]) {
            $localStorage[SAVED_DATA] = [];
        }
        let allData = $localStorage[SAVED_DATA];
        let found = allData.find(function (d) {
            return d.date === today;
        });
        if(!found){
            found = newEntry(today);
            allData.push(found);
        }
        return found;
    }
    function newEntry(date, categories) {
        categories = categories || DEFAULT_CATEGORIES;
        return {
            date: date,
            categories: categories,
            data: []
        };
    }
    function category(category) {
        return {
            category: category,
            billable: true
        };
    }
    function catToName(d) {
        return d.category;
    }
    /**
     * Inflate the date object from a string (local storage) to a date object
     * @param  {[type]} d [description]
     * @return {[type]}   [description]
     */
    function inflate(d){
        d.time = new Date(d.time);
        return d;
    }
}
