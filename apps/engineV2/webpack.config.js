// eslint-disable-next-line @typescript-eslint/no-var-requires
var path = require("path");

module.exports = {
  entry: {
    orchestrator: './orchestrator/index.ts',
    timerStarter: './timerStarter/index.ts',
    updateGame: './updateGame/index.ts',
    updateCompetition: './updateCompetition/index.ts',
    getUpcomingGame: './getUpcomingGame/index.ts',
    evaluateBets: './evaluateBets/index.ts',
    getGroups: './getGroups/index.ts',
  },
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
    filename: "[name]/index.js",
    libraryTarget: 'commonjs'
  },
};