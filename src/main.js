import Vue from 'vue';
import App from './App';
import '@/assets/styles/main.css';
import './registerServiceWorker';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  render: h => h(App)
}).$mount('#app');
