var path = require("path");
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
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js"
  },
};