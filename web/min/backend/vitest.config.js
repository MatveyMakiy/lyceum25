import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: [
        'src/tests/**',
        'src/server.js',
        'src/app.js',
        'src/lib/prisma.js',
      ],
    },
  },
});