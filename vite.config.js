import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// base './' keeps the build relocatable (GitHub Pages subpaths, file previews).
export default defineConfig({
  plugins: [vue()],
  base: './',
  server: { port: 5173, strictPort: false, host: '127.0.0.1' },
});
