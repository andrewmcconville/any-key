import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useTokensStore } from './stores/tokens';
import { useColorsStore } from './stores/colors';
import './assets/styles.css';

const app = createApp(App).use(createPinia()).use(router);
useTokensStore();   // apply any saved type-token and colour overrides to :root before the first paint
useColorsStore();
app.mount('#app');
