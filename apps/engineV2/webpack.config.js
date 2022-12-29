// eslint-disable-next-line @typescript-eslint/no-var-requires
var path = require("path");

module.exports = {
  entry: {
    Orchestrator: './orchestrator/index.ts',
    TimerStarter: './timerStarter/index.ts',
    UpdateGame: './updateGame/index.ts',
    // UpdateCompetition: './UpdateCompetition/index.ts',
    // GetUpcomingGame: './GetUpcomingGame/index.ts',
    EvaluateBets: './evaluateBets/index.ts'
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