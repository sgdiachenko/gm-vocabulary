import baseConfig from '../../eslint.config.js';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/prefer-inject': 'off',
    },
  },
];
