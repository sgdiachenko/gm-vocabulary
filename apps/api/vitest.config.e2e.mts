import { defineConfig } from 'vitest/config';
import ts from 'typescript';
import unitConfig from './vitest.config.mts';

export default defineConfig({
  ...unitConfig,
  // Nest DI and ValidationPipe require metadata that Vite's default transform omits.
  plugins: [
    {
      name: 'nest-test-metadata',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('.ts') || id.includes('/node_modules/')) return;
        const result = ts.transpileModule(code, {
          fileName: id,
          compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ESNext,
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            sourceMap: true,
          },
        });
        return { code: result.outputText, map: result.sourceMapText };
      },
    },
  ],
  test: {
    ...unitConfig.test,
    name: 'api-e2e',
    setupFiles: ['./test/setup.e2e.ts'],
    include: ['test/**/*.e2e-spec.ts'],
  },
});
