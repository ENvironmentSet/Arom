const { resolve } = require('path');

module.exports = {
  mode: 'development',
  target: 'async-node',
  entry: resolve('src', 'app.js'),
  output: {
    path: resolve('dist'),
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
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  },
  externals: {
    'java': 'require("java")'
  },
  devtool: 'inline-cheap-source-map',
  stats: 'errors-only'
};
