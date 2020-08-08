const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve('src', 'app.js'),
  devtool: 'inline-cheap-source-map',
  output: {
    path: path.resolve('dist'),
    filename: 'cli.js'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },
  stats: 'errors-only',
  target: 'async-node'
};
