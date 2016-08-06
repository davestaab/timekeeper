export default ngModule => {

    ngModule.component('main', {
        template: '<h1>main</h1>',
        controller: MainController,
        bindings: {
            // hero: '='
        }
    });
}

function MainController () {
    console.log('main hello world');
}
