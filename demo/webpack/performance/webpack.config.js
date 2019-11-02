let path = require('path');
let htmlWebpackPlugin = require('html-webpack-plugin');
let htmlIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
let webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HappyPack = require('happypack');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const TerserPlugin = require('terser-webpack-plugin');
// dll 的前缀地址
// webpack-dev-server 开发环境下 dll的库地址为 ./dist/xxxx
// 生成环境的dll库地址为 ./xxx
// 因为webpack-dev-server的服务器的根目录是个内存的隐射地址, 不再项目下的./dist/
const DLL_PREFIX = process.env.NODE_ENV != 'production' ? './dist/' : '';

module.exports = {
  mode: 'production',
  entry: {
    index: path.resolve('src/index.js')
  },
  optimization: {
    minimizer: [
      // new ParallelUglifyPlugin({
      //   cacheDir: '.cache/',
      //   uglifyJS: {
      //     compress: {
      //       drop_console: true,
      //       collapse_vars: true,
      //       reduce_vars: true
      //     }
      //   }
      // })

      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: false,
        // Must be set to true if using source-maps in production
        terserOptions: {}
      })
    ]
  },
  output: {
    path: path.resolve('dist'),
    publicPath: '/',
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js'
  },
  devServer: {
    host: '127.0.0.1',
    port: '8088'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'vue-loader'
          }
        ]
      },
      {
        test: /\.js/,
        use: ['happypack/loader?id=js']
      }
    ]
  },
  plugins: [
    new HappyPack({
      id: 'js',
      loaders: ['babel-loader?exclude=/(node_modules)/&cacheDirectory']
    }),

    new webpack.DllReferencePlugin({
      manifest: require('./dist/vue_vendor.manifest.json')
    }),
    new htmlWebpackPlugin({
      template: path.resolve('./index.html')
    }),
    new htmlIncludeAssetsPlugin({
      assets: [`${DLL_PREFIX}./vue_vendor.dll.js`],
      // 这里是相对于打包资源index.html的地址,所以不能再dev下引入
      append: false
    }),
    new VueLoaderPlugin()
  ]
};
