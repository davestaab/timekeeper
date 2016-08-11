import BootstrapTimeline from '../../timeline/BootstrapTimeline';

export default ngModule => {

    ngModule.component('main', {
        templateUrl: 'app/main/main.html',
        controller: MainController,
        bindings: {
        }
    });
}

function MainController () {
    let $ctrl = this;
    $ctrl.categories = [
        { name:'Work' },
        { name:'Lunch' },
        { name:'Meeting' },
    ];
    let chart = BootstrapTimeline('.chart')
        .categories($ctrl.categories.map(toName))
        .data([])
    ;

    $ctrl.updateCategories = function() {
        chart.categories($ctrl.categories.map(toName));
    }

    function toName(d) {
        return d.name;
    }
}
