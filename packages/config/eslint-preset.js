module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:prettier/recommended',
    'plugin:nuxt/recommended',
    'prettier',
  ],
  plugins: ['prettier'],
  rules: {
    "import/no-mutable-exports": 0
  },
  settings: {
    nuxt: {
      rootDir: [
        'apps/client/',
        'packages/config/',
        'packages/tsconfig/',
      ],
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        project: ['tsconfig.json', 'package/tsconfig.json'],
      },
      typescript: {
        alwaysTryTypes: true,
        project: ['tsconfig.json', 'package/tsconfig.json'],
      },
    },
  },
  ignorePatterns: [
    '**/*.js',
    '**/*.json',
    'node_modules',
    '.turbo',
    '.nuxt',
    'public',
  ],
};
