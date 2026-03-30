import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

const browserGlobals = {
  Blob: 'readonly',
  DOMParser: 'readonly',
  FileReader: 'readonly',
  HTMLAnchorElement: 'readonly',
  MessageChannel: 'readonly',
  MouseEvent: 'readonly',
  NodeFilter: 'readonly',
  SVGElement: 'readonly',
  URL: 'readonly',
  XMLSerializer: 'readonly',
  btoa: 'readonly',
  chrome: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  navigator: 'readonly',
  open: 'readonly',
  setImmediate: 'readonly',
  setTimeout: 'readonly',
  self: 'readonly',
  window: 'readonly',
};

const nodeGlobals = {
  __dirname: 'readonly',
  console: 'readonly',
  global: 'readonly',
  process: 'readonly',
};

export default [
  {
    ignores: ['dist/**'],
  },
  js.configs.recommended,
  prettier,

  {
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'arrow-body-style': [2, 'as-needed'],
      'no-console': 0,
    },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: browserGlobals,
    },
  },
  {
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: nodeGlobals,
    },
  },
];
