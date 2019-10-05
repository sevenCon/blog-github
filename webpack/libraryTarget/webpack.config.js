let path = require('path');
let webpackMerge = require('webpack-merge');

let baseConfig = {
  entry: {
    index: './index.js'
  },
  output: {
    filename: '[name].[chunkhash].js',
    publicPath: '/',
    chunkFilename: '[name].[chunkhash].js',
    library: 'myLib'
  }
};

let libraryTarget = ['var', 'assign', 'this', 'global', 'window', 'umd', 'commonjs', 'commonjs2', 'amd', 'jsonp'].map(lt => {
  let base = webpackMerge(baseConfig, {
    output: {
      path: path.resolve('./' + '/dist/' + lt),
      libraryTarget: lt
    }
  });
  return base;
});

module.exports = libraryTarget;
