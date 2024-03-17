module.exports = {
  env: {
    es6: true,

    node: true,

    jest: true
  },

  extends: [
    'eslint:recommended',

    'plugin:@typescript-eslint/recommended',

    'airbnb-base'
  ],

  parser: '@typescript-eslint/parser',

  plugins: ['@typescript-eslint'],

  rules: {
    'no-console': 'error',

    'comma-dangle': ['error', 'never'],

    'linebreak-style': 'off',

    'import/extensions': 'off',

    'class-methods-use-this': 'off',

    'import/no-unresolved': 'off'
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx'],

      parser: '@typescript-eslint/parser',

      parserOptions: {
        ecmaVersion: 'latest',

        sourceType: 'module'
      },

      plugins: ['@typescript-eslint'],

      rules: {
        // Add TypeScript-specific rules here
      }
    }
  ],

  ignorePatterns: ['__tests__', 'dist/']
};
