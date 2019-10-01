let path = require('path');

let config = {
  mode: 'development',
  entry: {
    index: './index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[chunkhash].bundle.js',
    chunkFilename: '[name].[chunkhash].bundle.js',
    publicPath: '/'
  }
  // optimization: {
  //   // splitChunks: {
  //   //   chunks: 'all'
  //   // },
  //   runtimeChunk: true
  // }
};

module.exports = config;
