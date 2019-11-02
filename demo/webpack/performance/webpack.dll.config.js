let path = require('path');
let webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    vue_vendor: ['vue', 'lodash']
  },
  output: {
    filename: '[name].dll.js',
    path: path.resolve('./dist'),
    libraryTarget: 'var',
    library: '[name]_dll'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_dll',
      path: path.resolve('./dist/[name].manifest.json')
    })
  ]
};
