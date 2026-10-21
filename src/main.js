import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useTokensStore } from './stores/tokens';
import './assets/styles.css';

const app = createApp(App).use(createPinia()).use(router);
useTokensStore();   // applies any saved type-token overrides to :root before the first paint
app.mount('#app');
