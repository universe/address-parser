module.exports = {
  parser: '@typescript-eslint/parser',  // Specifies the ESLint parser
  ignorePatterns: [
    'node_modules/**',
    '/node_modules/',
    'node_modules',
    '**/node_modules/**',
    'node_modules/microevent.ts/**',
    'dist',
    'types-local',
    'graphql.ts',
    'packages/@universe/aether/cjs/**',
    'packages/@universe/aether/esm/**',
    'packages/@universe/campaign/esm/**',
  ],
  extends: [
    'preact',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,  // Allows for the parsing of modern ECMAScript features
    sourceType: 'module',  // Allows for the use of imports
    ecmaFeatures: {
      jsx: true,  // Allows for the parsing of JSX
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['simple-import-sort'],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/no-unused-expressions': 'off',
    'sort-imports': 'off',
    'import/order': 'off',
    'import/no-named-default': 'off',
    semi: [ 'error', 'always' ],
    'jsx-quotes': [ 'error', 'prefer-double' ],
    'react/jsx-curly-brace-presence': [ 'error', { props: "never", children: "never" }],
    'max-len': [ 'error', { code: 180, tabWidth: 2 }],
    'no-multiple-empty-lines': [ 'error', { max: 1 }],
    'no-var': ['error'],
    'space-before-function-paren': [ 'error', 'never' ],
    'no-return-assign': 'off',
    'no-unused-expressions': 'off',
    'brace-style': [ 'error', 'stroustrup', { allowSingleLine: true }],
    'comma-dangle': [ 'error', 'always-multiline' ],
    "array-bracket-spacing": [ "error", "always", { singleValue: false, objectsInArrays: false, arraysInArrays: false }],
    'object-curly-spacing': [ 'error', 'always' ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [ 'error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],

    // TODO: Fully enable these rules.
    // '@typescript-eslint/interface-name-prefix': 'off',
    // '@typescript-eslint/explicit-function-return-type': 'off',
    // '@typescript-eslint/explicit-module-boundary-types': 'off',
    // "react-hooks/rules-of-hooks": "off",
    // "react-hooks/exhaustive-deps": "warn",
    // "react/no-deprecated": "warn",
  },
};
