import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../', import.meta.url));
const config = ts.readConfigFile(path.join(root, 'tsconfig.base.json'), ts.sys.readFile);
const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const frontend = 'apps/gm-vocabulary/src/';
const backend = 'apps/api/src/';

export default {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      boundary: '{{reason}}',
      obsolete: 'Use an app-local import; library aliases were removed.',
    },
  },
  create(context) {
    const source = path.relative(root, context.filename).replaceAll(path.sep, '/');
    function check(node) {
      const specifier = node.source ?? node.argument;
      const value = specifier?.value;
      if (typeof value !== 'string') return;
      if (value.startsWith('@gm-vocabulary/')) {
        context.report({ node: specifier, messageId: 'obsolete' });
        return;
      }
      // TypeScript resolves configured aliases as well as ordinary relative imports.
      const resolved = ts.resolveModuleName(
        value,
        context.filename,
        options,
        ts.sys,
      ).resolvedModule;
      const target = path
        .relative(
          root,
          resolved?.resolvedFileName ?? path.resolve(path.dirname(context.filename), value),
        )
        .replaceAll(path.sep, '/');
      let reason;
      if (
        (source.startsWith(frontend) && target.startsWith(backend)) ||
        (source.startsWith(backend) && target.startsWith(frontend))
      ) {
        reason = 'Frontend and backend cannot import each other.';
      } else if (
        source.startsWith(frontend + 'app/shared/') &&
        target.startsWith(frontend + 'app/features/')
      ) {
        reason = 'Shared UI/forms cannot depend on features.';
      } else if (
        source.startsWith(frontend + 'app/features/auth/') &&
        target.startsWith(frontend + 'app/features/vocabulary/')
      ) {
        reason = 'Auth cannot depend on vocabulary.';
      } else if (
        source.startsWith(backend + 'modules/auth/') &&
        target.startsWith(backend + 'modules/vocabulary/')
      ) {
        reason = 'Auth cannot depend on vocabulary.';
      } else if (
        source.startsWith(backend + 'common/') &&
        target.startsWith(backend + 'modules/')
      ) {
        reason = 'Common API helpers cannot depend on domain modules.';
      } else if (
        source.startsWith(backend + 'modules/') &&
        !source.startsWith(backend + 'modules/vocabulary/') &&
        target.startsWith(backend + 'modules/vocabulary/') &&
        target.endsWith('.entity.ts')
      ) {
        reason = 'Vocabulary persistence belongs inside vocabulary.';
      }
      if (reason) context.report({ node: specifier, messageId: 'boundary', data: { reason } });
    }
    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
      ImportExpression: check,
      TSImportType(node) {
        check({ argument: node.argument?.literal ?? node.argument });
      },
    };
  },
};
