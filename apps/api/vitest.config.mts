import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@gm-vocabulary/api/auth/feature': fileURLToPath(
        new URL('../../libs/api/auth/feature/src/index.ts', import.meta.url),
      ),
      '@gm-vocabulary/api/collections/data-access': fileURLToPath(
        new URL('../../libs/api/collections/data-access/src/index.ts', import.meta.url),
      ),
      '@gm-vocabulary/api/collections/feature': fileURLToPath(
        new URL('../../libs/api/collections/feature/src/index.ts', import.meta.url),
      ),
      '@gm-vocabulary/api/shared/util': fileURLToPath(
        new URL('../../libs/api/shared/util/src/index.ts', import.meta.url),
      ),
      '@gm-vocabulary/api/users/feature': fileURLToPath(
        new URL('../../libs/api/users/feature/src/index.ts', import.meta.url),
      ),
      '@gm-vocabulary/api/words/data-access': fileURLToPath(
        new URL('../../libs/api/words/data-access/src/index.ts', import.meta.url),
      ),
      '@gm-vocabulary/api/words/feature': fileURLToPath(
        new URL('../../libs/api/words/feature/src/index.ts', import.meta.url),
      ),
    },
  },
  root: import.meta.dirname,
  test: {
    name: 'api',
    environment: 'node',
    globals: true,
    watch: false,
    include: ['src/**/*.spec.ts', '../../libs/api/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/apps/api',
    },
  },
});
