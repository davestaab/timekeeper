import BootstrapTimeline from '../../timeline/BootstrapTimeline';

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
    /****************************************
    *      Controller Attributes           *
    ****************************************/
    $ctrl.categories = [];
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

}
