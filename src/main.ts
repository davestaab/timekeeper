import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './index.css';

// Vue.config.productionTip = false;

const app = createApp(App);
app.use(createPinia());
app.mount('#app');
