# css-lodaer 是怎么打包的?

在 dev 环境下, 把 css 抽取出来 extract 到 style 标签里面
在 pro 环境下, 会抽取公共的样式,成文件

```

const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
  ...
  module: {
    rules: [
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader'],
          publicPath: '../images/'
        })
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              fallback: 'file-loader',
              limit: 8196,
              outputPath: 'images',
              publicPath: 'public/images'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].[contenthash].css',
      allChunks: true
    })
  ]
}
```
