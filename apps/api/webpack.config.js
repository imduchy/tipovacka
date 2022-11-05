var path = require("path");
var nodeExternals = require('webpack-node-externals');

// var webpack = require('webpack');
// var ContextReplacementPlugin = webpack.ContextReplacementPlugin

module.exports = {
  entry: ["./index.ts"],
  mode: "production",
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
    ],
  },
  // externals: [nodeExternals()],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js"
  },
};