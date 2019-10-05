# 前言

`ExtractTextWebpackPlugin`是用来提取公共代码的插件.
比方说把 css 的代码提取到一个文件, 方便单独缓存, css 代码独立加载, 异步加载的模块等等. 但是实际在使用的过程中, 有些疑惑的地方.

- `new ExtractTextWebpackPlugin({allChunk:true})`里面的`allChunk`作用是什么?
- `ExtractTextPlugin.extract`里面的`fallback`什么时候生效?
- `css`或者`less`里面, 碰到`import "./a/v/c.less"`, `background:url(./../a.png)`应该怎么配置打包的路径?
  自己对于这几个问题理解不是很到位.

# 安装`ExtractTextWebpackPlugin`

ExtractTextWebpackPlugin 对 webpack 的版本很敏感, 注意安装的版本.

```
# for webpack 4
npm install –save-dev extract-text-webpack-plugin@next
# for webpack 3
npm install --save-dev extract-text-webpack-plugin
# for webpack 2
npm install --save-dev extract-text-webpack-plugin@2.1.2
# for webpack 1
npm install --save-dev extract-text-webpack-plugin@1.0.1
```

# css 样式提取 ExtractTextWebpackPlugin 基本的配置

这里就简单的说下配置

### wbepack 4.0 以下用`ExtractTextWebpackPlugin`提取 css

webpack4.0 不再使用`ExtractTextWebpackPlugin`来提取公共的 css,而是使用`mini-css-extract-plugin`来提取, 但是 webpack4 的版本要用的话也可以`npm install –save-dev extract-text-webpack-plugin@next`, 需要安装 4.0 版本的`ExtractTextWebpackPlugin`.

> 我当前使用的版本是 webpack-3.12.0

```
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader",
          publicPath:"/less/"
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("styles.css"),
  ]
}
```

##### `ExtractTextPlugin.extract`的一些参数:

- **fallback**: 这个参数是在提取 css 失败的时候,使用的 loader, 异步加载的组件, 通常是包括 css, 而这个 css 的代码是通过`less`转化而来的, 如果该文件的没有提取到单独的`css`文件, 那么就会用`style-loader`处理.
- **use**: 用到的`loader`, 可以是数组, 转化顺序从后往前.所以这样是允许的`use:['css-lodaer','less-loader']`.
- **publicPath**:"/less/", 这是 css 文件路径里面的相对路径部分 , 比如 源码`background:url(./1.jpg)`,打包出来的 css 则是`background:url(./less/[contenthash].jpg)`.

### 实例

在`allChunks:false`的情况下, 公共的代码提取,使用了`fallback:style-loader`来处理没有成功提取的样式.

### webpack.config.js 的配置代码

![image](https://user-images.githubusercontent.com/13718019/65879693-f3812b00-e3c2-11e9-8347-2c27ebd46741.png)

### index.js 入口的 da 打包代码

![image](https://user-images.githubusercontent.com/13718019/65879726-0ac01880-e3c3-11e9-9b45-01873f5117e6.png)

### 打包的结果 allChunks:false

![image](https://user-images.githubusercontent.com/13718019/65879851-52df3b00-e3c3-11e9-8026-700e509d51f7.png)
![image](https://user-images.githubusercontent.com/13718019/65879908-71453680-e3c3-11e9-953a-d2a644f6bdf9.png)

### 打包的结果 allChunks:true

![image](https://user-images.githubusercontent.com/13718019/65880387-50311580-e3c4-11e9-9440-962527123ca2.png)

### 小结

> 所以`allChunks:false`为默认值, 默认是从 entry 的入口提取代码,但是不会提取异步加载的代码, `allChunks:true`则是提取所有模块的代码(包括异步加载的模块),到一个文件里面. `fallback`则是在异步代码加载的 css 代码没有被提取的情况下, 以`style-loader`的情况去加载异步组件的样式.

### 提取公共的 css 的插件书写方式

```
new ExtractTextPlugin({
    fileName:"[name].css", // [contenthash], [name], [hash]都是允许的
    allChunks:true // 是否从所有的chunk中提取
})
```

- allChunks: true, 表示是否从所有的 chunk 中提取代码(意味着异步加载的代码也会被提取).

> CommonsChunkPlugin 的使用是提取多个 entry 的公共代码部分.当提取的代码携带`ExtractTextPlugin.extract`部分的话, 必须设置`allChunks:true`;

### url()

在 css 书写的时候, 经常会携带`background:url(...)`的书写方式, 如果打包输出的图片资源位置修改的时候, 这个时候,应该怎么去配置?

在`css-loader`里面有一个配置

```
{
    test: /\.css$/,
    use: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: [{
            loader: "css-loader",
            options:{ url:true }
        }],
        publicPath:"/less/"
    })
}
```

`url:true`是默认值, 表示在`less`, `css`的代码书写中, 类似以下的写法, 都会自动转化为相对的路径. 除非是类似带`cdn`的绝对路径的除外.

```
import 'style.css' => require("./style.css");
background:url(a.png); => rquire("./a.png");
background:url(http://cnd.quanlincong.com/a.png); => rquire("http://cnd.quanlincong.com/a.png");
```

如果不希望代码的路径有任何变化的转化的话, 可以设置

```
url:false
```

禁止 css 资源转化的时候自动转化.

一般的情况下, 在 css 样式里面的引入的图片, 我想要打包到特定的路径, 比如放到一个目录里面`assets`

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
              publicPath: 'images'
            }
          }
        ]
      }
    ]
  },
  ...
}
```

这个时候需要配置`url-loader`, 在图片合适的大小情况下, 打包成 base64, 超出特定的大小, 使用`fallback`配置的`loader`来处理,如果不写默认也是`file-loader`.

关于这个`url-loader`的使用

> url-loader 其实就是 base64 + filr-loader 的处理, 但是 file-loader 的插件需要自己额外安装.

- `fallback: 'file-loader'`代表在文件大小超出 8196 bytes 后, 使用的`file-loader`来加载资源, 此外后面的`outputPath`,`publicPath`配置都是给`file-loader`使用的.
  webpack 在介绍这里的时候原话是这样的

  > The fallback loader will receive the same configuration options as url-loader.
  > 意思就是`url-loader`的配置会传到`file-loader`里面, 所以`file-loader`的配置直接在里面 options 里面写.

- `outputPath:'images'`, 意味这打包的图片资源都输出到`./images`路径下
- `publicPath:'images'`, 定义引入图片的时候的路径前缀, 意味着通过`extract-text-webpack-plugin`提取的 css 代码的引入的图片资源, 如果`extract-text-webpack-plugin`里面定义了`publicPath`, 会被`file-loader`里面`publicPath`覆盖; 如果`file-loader`没有定义`publicPath`, 那么普通的图片资源引入的路径为`[outputPath]/filename.png`, 如果在`extract-text-webpack-plugin`定义了`publicPath`, 那么提取出来的图片样式引入的路径则是`[publicPath]/[outputPath]/filename.png`

### `extract-text-webpack-plugin和file-loader的publicPath`例子

### file-loader 没有配置`publicPath`, 使用 extract-text 插件的`publicPath`

![image](https://user-images.githubusercontent.com/13718019/65931446-4519cc00-e43c-11e9-865b-668c0e4d5700.png)

### 结果 1,没有配置`file-loader`的 publicPath

![image](https://user-images.githubusercontent.com/13718019/65931481-71354d00-e43c-11e9-853c-ec18444f7168.png)

### 结果 2,配置了`file-loader`的 publicPath

![image](https://user-images.githubusercontent.com/13718019/65931503-87dba400-e43c-11e9-8329-aae78f988d29.png)

# 结束

到这里, 终于弄懂了前言说的 3 个问题

- `extract-text-webpack-plugin`的`allChunk:true`, 是提取所有的`chunk`的 css, 包括异步加载的 css
- `fallback`什么时候什么生效? 在异步加载 css 的情况下, 没有成功提取 css 的时候, 会使用`fallback:'style-loader'来处理样式.
- 在 css 里面引用相对的图片资源, 优先使用`extract-text-webpack-plugin`的`publicPath`来添加前缀路径进行加载. 同时如果设置`file-loader`的话, 注意 publicPath 的路径会覆盖`extract-text-webpack-plugin`的`publicPath`;

> https://webpack.js.org/plugins/extract-text-webpack-plugin/#root > https://webpack.js.org/plugins/mini-css-extract-plugin/
