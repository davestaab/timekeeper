import BootstrapTimeline from '../../timeline/BootstrapTimeline';

export default ngModule => {

    ngModule.component('main', {
        templateUrl: 'app/main/main.html',
        controller: MainController,
    });
}

function MainController ($log, $scope) {
    let $ctrl = this;
    let id = 1;
    $ctrl.categories = [
        'Work',
        'Lunch',
        'Meeting',
    ];
    let chart = BootstrapTimeline('.chart')
        .categories($ctrl.categories)
        .data([])
        .notifyOnUpdate(function (chart) {
            // the chart is outside of Angular,
            // so we need to trigger a digest cycle.
            $scope.$applyAsync(function () {
                $ctrl.times = chart.timesByCategory();
                $ctrl.data = chart.data();
            });
        });
    ;

    $ctrl.addCategory = function(newCategory) {
        if(newCategory){
            $ctrl.categories.push(newCategory);
            $ctrl.newCategory = '';
            chart.categories($ctrl.categories);
        }
    }

    $ctrl.deleteCategory = function(index) {
        $ctrl.categories.splice(index, 1);
        chart.categories($ctrl.categories);
    }

    $ctrl.total = function() {
        let total = 0;
        for(let t in $ctrl.times) {
            total += $ctrl.times[t];
        }
        return total;
    }
}
