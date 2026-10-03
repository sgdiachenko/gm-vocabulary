import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'api-express',
    environment: 'node',
    include: ['apps/api-express/test/**/*.test.js'],
  },
});
