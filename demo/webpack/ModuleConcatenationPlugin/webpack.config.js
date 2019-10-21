let path = require('path');
let webpack = require('webpack');
module.exports = {
  entry: {
    index: path.resolve('./src/index.js')
  },
  output: {
    path: path.resolve('./dist'),
    filename: '[name].js',
    chunkFilename: '[name].[chunkhash].js',
    publicPath: '/'
  },
  stats: {
    // Examine all modules
    maxModules: Infinity,
    // Display bailout reasons
    optimizationBailout: true
  },
  plugins: [new webpack.optimize.ModuleConcatenationPlugin()]
};
