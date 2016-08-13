import BootstrapTimeline from '../../timeline/BootstrapTimeline';

export default ngModule => {

    ngModule.component('main', {
        templateUrl: 'app/main/main.html',
        controller: MainController,
    });
}

function MainController () {
    let $ctrl = this;
    let id = 1;
    $ctrl.categories = [
        'Work'   ,
        'Lunch',
        'Meeting',
    ];
    let chart = BootstrapTimeline('.chart')
        .categories($ctrl.categories)
        .data([])
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
}
