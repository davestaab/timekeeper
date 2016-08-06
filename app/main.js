import BootstrapTimeline from '../timeline/BootstrapTimeline';

let chart = BootstrapTimeline('.chart');

let categories = chart.categories();
// debugger;
document.getElementById('categories').value = categories;
