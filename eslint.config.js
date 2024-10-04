import js from '@eslint/js';
import prettier from 'prettier/eslint-config-prettier';

export default [
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
];
