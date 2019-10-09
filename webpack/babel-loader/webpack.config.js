let path = require('path');
module.exports = {
  entry: {
    index: './src/index.js'
  },
  mode: 'development',
  output: {
    path: path.resolve('./dist'),
    filename: 'index.js',
    publicPath: '/',
    chunkFilename: '[name].index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      }
    ]
  }
};
