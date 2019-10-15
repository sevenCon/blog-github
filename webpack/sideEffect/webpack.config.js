let path = require('path');
module.exports = {
  // mode: 'development',
  mode: 'production',
  entry: {
    index: './src/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve('./dist'),
    chunkFilename: '[name].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        use: 'babel-loader'
      }
    ]
  }
};
