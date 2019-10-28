let path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  devtool: 'inline-source-map',
  mode: 'development',
  devServer: {
    host: '127.0.0.1',
    port: 8080,
    open: true
  },
  entry: {
    index: path.resolve('src/index.js')
  },
  output: {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
    publicPath: '/',
    path: path.resolve('dist')
  },
  module: {
    rules: [
      {
        test: /.js$/,
        use: ['babel-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    })
  ]
};
