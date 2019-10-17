let path = require('path');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
  entry: {
    app: './app.js'
  },
  output: {
    path: path.resolve('./dist'),
    chunkFilename: '[name].[chunkhash].js',
    filename: '[name].[chunkhash].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {}
            }
          ]
        })
      }
    ]
  },
  plugins: [new ExtractTextPlugin({ filename: 'style.css' })]
};
