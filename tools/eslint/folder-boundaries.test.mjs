import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { Linter } from 'eslint';
import parser from '@typescript-eslint/parser';
import rule from './folder-boundaries.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const front = 'apps/gm-vocabulary/src/app/';
const api = 'apps/api/src/';
const auth = front + 'features/auth/auth.service.ts';
const words = front + 'features/vocabulary/words/words.service.ts';
const collections = front + 'features/vocabulary/collections/word-group.service.ts';
const shared = front + 'shared/forms/select-option.ts';
const authApi = api + 'modules/auth/auth.service.ts';
const entity = api + 'modules/vocabulary/words/word.entity.ts';

function lint(source, target, syntax = 'import') {
  let relative = path.relative(path.dirname(source), target).replace(/\.ts$/, '');
  if (!relative.startsWith('.')) relative = './' + relative;
  const snippets = {
    import: `import { value } from '${relative}';`,
    export: `export * from '${relative}';`,
    dynamic: `const load = () => import('${relative}');`,
    type: `type Value = import('${relative}').Value;`,
  };
  return new Linter().verify(
    snippets[syntax],
    [
      {
        files: ['**/*.ts'],
        languageOptions: { parser },
        plugins: { local: { rules: { boundaries: rule } } },
        rules: { 'local/boundaries': 'error' },
      },
    ],
    { filename: path.join(root, source) },
  );
}

for (const syntax of ['import', 'export', 'dynamic', 'type']) {
  test(`blocks forbidden relative ${syntax}`, () => {
    for (const [source, target] of [
      [words, authApi],
      [authApi, words],
      [shared, auth],
      [auth, words],
      [authApi, entity],
      [api + 'common/example.ts', authApi],
      [api + 'modules/reports/example.ts', entity],
    ]) {
      const messages = lint(source, target, syntax);
      assert.equal(messages.length, 1, JSON.stringify({ source, target, messages }));
      assert.equal(messages[0].ruleId, 'local/boundaries');
    }
  });
}

test('allows vocabulary cooperation, shared helpers and app composition', () => {
  for (const [source, target] of [
    [words, collections],
    [collections, words],
    [auth, shared],
    [front + 'app.ts', auth],
    [api + 'app.module.ts', authApi],
    [entity, api + 'modules/vocabulary/collections/word-collection.entity.ts'],
  ])
    assert.deepEqual(lint(source, target), []);
});

test('blocks obsolete library aliases', () => {
  const linter = new Linter();
  const messages = linter.verify(
    "import { Word } from '@gm-vocabulary/api/words/data-access';",
    [
      {
        plugins: { local: { rules: { boundaries: rule } } },
        rules: { 'local/boundaries': 'error' },
      },
    ],
    { filename: path.join(root, 'test.js') },
  );
  assert.equal(messages[0]?.messageId, 'obsolete');
});
