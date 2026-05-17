import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      reporter: ['text', 'html'],
      include: [
        'src/middleware/**/*.js',
        'src/controllers/users.controller.js',
        'src/controllers/admin.controller.js',
        'src/controllers/comments.controller.js',
        'src/controllers/likes.controller.js',
      ],
      exclude: [
        'src/tests/**',
        'src/server.js',
        'src/app.js',
        'src/lib/prisma.js',
        'src/routes/**',
      ],
    },
  },
});
