import js from '@eslint/js';
import globals from 'globals';

const cleanedBrowserGlobals = Object.fromEntries(
  Object.entries(globals.browser).filter(([key]) => !key.match(/\s/))
);

export default [
  {
    ignores: ['node_modules/', 'demo/', 'test/test-html/'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...cleanedBrowserGlobals,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { args: 'none' }],
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none' }],
    },
  },
];
