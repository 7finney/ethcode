module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: 'standard-with-typescript',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  ignorePatterns: ['/build/*', '/node_modules/*'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'space-before-function-paren': 'off'
  }
}
