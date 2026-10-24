import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// base './' keeps the build relocatable (GitHub Pages subpaths, file previews).
// `test` is read by Vitest (npm test): tests sit beside the code they cover as *.test.js and run
// in jsdom, which gives them localStorage and browser history.
export default defineConfig({
  plugins: [vue()],
  base: './',
  server: { port: 5173, strictPort: false, host: '127.0.0.1' },
  test: { environment: 'jsdom', include: ['src/**/*.test.js'] },
});
