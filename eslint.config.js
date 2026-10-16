// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import nx from '@nx/eslint-plugin';
import folderBoundaries from './tools/eslint/folder-boundaries.mjs';

export default defineConfig([
  {
    plugins: {
      '@nx': nx,
      local: { rules: { 'folder-boundaries': folderBoundaries } },
    },
  },
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended, tseslint.configs.stylistic],
    rules: {
      'local/folder-boundaries': 'error',
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            { sourceTag: 'scope:gm-vocabulary', onlyDependOnLibsWithTags: ['scope:gm-vocabulary'] },
            { sourceTag: 'scope:api', onlyDependOnLibsWithTags: ['scope:api'] },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/gm-vocabulary/**/*.ts'],
    extends: [angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'gm',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'gm',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['apps/gm-vocabulary/**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
