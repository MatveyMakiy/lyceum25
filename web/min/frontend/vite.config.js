import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/pages/**', 'src/mock/**', 'src/main.js'],
    },
  },
});
