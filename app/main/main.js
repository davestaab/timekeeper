import BootstrapTimeline from '../../timeline/BootstrapTimeline';

export default ngModule => {

    ngModule.component('main', {
        templateUrl: 'app/main/main.html',
        controller: MainController,
        bindings: {
            // hero: '='
        }
    });
}

function MainController () {
    console.log('main ctrl hello world');


    let chart = BootstrapTimeline('.chart');


}
