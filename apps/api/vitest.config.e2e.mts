import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  test: {
    name: 'api-e2e',
    environment: 'node',
    globals: true,
    include: ['test/**/*.e2e-spec.ts'],
  },
});
