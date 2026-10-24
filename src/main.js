import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useTokensStore } from './stores/tokens';
import { useColorsStore } from './stores/colors';
import './assets/styles.css';

const app = createApp(App).use(createPinia()).use(router);
useTokensStore();   // read the stylesheet's token defaults before anything can override them
useColorsStore();
app.mount('#app');
