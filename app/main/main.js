import BootstrapTimeline from '../../timeline/BootstrapTimeline';
import moment from 'moment';

export default ngModule => {

    ngModule.component('main', {
        templateUrl: 'app/main/main.html',
        controller: MainController,
    });
}

function MainController ($log, $scope, $localStorage) {
    let $ctrl = this;
    let id = 1;
    let chart;
    const DEFAULT_CATEGORIES = ['Lunch', 'Overhead', 'Work'];
    const SAVE_DATE_FORMAT = 'YYYY-MM-DD';
    /****************************************
    *      Controller Attributes           *
    ****************************************/
    $ctrl.categories = DEFAULT_CATEGORIES;
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
        chart = BootstrapTimeline('.chart')
            .categories($ctrl.categories)
            .data([])
            .notifyOnUpdate(function (chart) {
                // the chart is outside of Angular,
                // so we need to trigger a digest cycle.
                $scope.$applyAsync(function () {
                    $ctrl.times = chart.timesByCategory();
                    $ctrl.data = chart.data();
                });
            })
        ;
    };
    $ctrl.$onChanges = function () {}
    $ctrl.$postLink = function () {}
    $ctrl.$onDestroy = function () {}

    /****************************************
    *      API Functions                   *
    ****************************************/
    function addCategory(newCategory) {
        if(newCategory){
            $ctrl.categories.push(newCategory);
            $ctrl.newCategory = '';
            chart.categories($ctrl.categories);
        }
    }

    function deleteCategory(index) {
        $ctrl.categories.splice(index, 1);
        chart.categories($ctrl.categories);
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
        // $localStorage.
    }
    function createSaveFormat(categories, data) {
        return {
            name: moment().format(SAVE_DATE_FORMAT),
            categories: categories,
            data: data
        };
    }
}
