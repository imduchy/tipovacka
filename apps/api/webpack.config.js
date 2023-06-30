const path = require('node:path');

module.exports = {
  entry: ['./index.ts'],
  mode: 'production',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!@aws-sdk\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    node: '16',
                  },
                },
              ],
            ],
            plugins: [
              '@babel/plugin-transform-optional-chaining',
              '@babel/plugin-transform-spread',
              '@babel/plugin-transform-nullish-coalescing-operator',
              '@babel/plugin-transform-classes',
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
};
