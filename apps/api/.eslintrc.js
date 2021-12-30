module.exports = {
    env: {
      node: true,
    },
    extends: [
      'plugin:prettier/recommended',
      'prettier',
    ],
    plugins: ['prettier'],
    rules: {
      "import/no-mutable-exports": 0
    },
    ignorePatterns: [
      '**/*.js',
      '**/*.json',
      'node_modules',
    ],
  };
  