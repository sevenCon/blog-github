# 前言

随着浏览器的迭代和电脑的升级, 我们的浏览器的兼容问题关注的越来越少了, 兼容这块一直是一个很大的历史包袱, 又是一个非常影响体验的点. 包括代码维护人员的体验, 和客户的体验.

自动给 css 的属性添加浏览器的前缀是在工程化的角度去考虑和解决兼容问题, 为广大的开发群众降低维护和学习门槛, 确实是一个落到实处的开源项目. 搭配现在的单页面打包的工具使用, 开发起来可以说毫无感知.

所以就看看 postcss-loader 的基本使用

> 注意一点, 开始之前需要提及的是, 我使用的是 webpack-3.12.0 版本.

另外, 还有一点需要说明一下的, postcss-loader 是 post-css 的一个 webpack 集成的 loader, 可以在加载 css 的时候,做一些转化的功能, 其中就包括`Autoprefixer`, 自动添加浏览器的前缀, 但是如果说 post-css 只能有这么一个功能, 那么就不值得大家那么推崇了.

在 post-css 里面有很多插件, 也推荐大家以开源贡献的方式, 给社区注入活力, 添加更多更加好用提高效率的功能.
其中包括但不限于,`Autoprefixer`, `cssnano`, `PostCSS Sprites`, `postcss-easy-import`, 等等, [超过 200 个插件, 可以在这里找到介绍](https://github.com/postcss/postcss/blob/master/docs/plugins.md).

所以, 在 webpack 的 postcss-loader 是怎么使用的?

# 基本配置

使用 postcss-loader 之前, 需要定义一些基本的配置文件, 目前的定义的方式有以下几种

## (1) package.json 的 postcss 属性

```js
{
  "postcss": {
    "parser": "sugarss",
    "map": false,
    "plugins": {
      "postcss-plugin": {}
    }
  }
}
```

## (2) .postcssrc.json 或者 .postcssrc.yml

```js
{
  "parser": "sugarss",
  "map": false,
  "plugins": {
    "postcss-plugin": {}
  }
}
```

```js
parser: sugarss
map: false
plugins:
  postcss-plugin: {}
```

## (3) .postcssrc.js (推荐)

最好还是使用 js 后缀的文件配置, 因为可以做一些逻辑

```js
module.exports = ({ env }) => ({
  ...options
  plugins: [
    env === 'production' ? require('postcss-plugin')() : false
  ]
})
```

可以导出一个方法, 方法的参数是一个对象 ctx, 里面包括配置的基本参数
`env`,`parser`默认的一些参数.

> ⚠️ When using an {Array}, make sure to require() each plugin
> 如果是使用数组的方式，需要手动引入插件

# post-css 的配置选项

<h2 align="center">Options</h2>

|               Name                |        Type         |   Default   | Description                |
| :-------------------------------: | :-----------------: | :---------: | :------------------------- |
|          [**`to`**](#to)          |     `{String}`      | `undefined` | Destination File Path      |
|         [**`map`**](#map)         |  `{String|Object}`  |   `false`   | Enable/Disable Source Maps |
|        [**`from`**](#from)        |     `{String}`      | `undefined` | Source File Path           |
|      [**`parser`**](#parser)      | `{String|Function}` |   `false`   | Custom PostCSS Parser      |
|      [**`syntax`**](#syntax)      | `{String|Function}` |   `false`   | Custom PostCSS Syntax      |
| [**`stringifier`**](#stringifier) | `{String|Function}` |   `false`   | Custom PostCSS Stringifier |

使用`postcss-loader`一般我们不需要去重写以上的配置, 使用默认的值就好,在 webpack 里面, `from`和`to`这 2 个属性, 都已经有配置了, 所有这里也不需要设置, 还有就是`map`, 就是定义`Source Maps`方便调试的, 但在开发的过程中, 并不是十分的需要`postcss-loader`, 所以一般我也都不配置`map`属性, 除非在生产环境调试 css 样式.

常见的一个配置文件如下:

```js
// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-url': {},
    // to edit target browsers: use "browserslist" field in package.json
    autoprefixer: {}
  }
};
```

以上一共用了 3 个插件

- autoprefixer
- postcss-url

## autoprefixer

自动添加浏览器前缀,需要在 package.json 里面有定义`browserslist`属性,
生成的时候会匹配特定的浏览器范围

[查询浏览器范围, 在这里可以查到](https://browserl.ist)

```js
//  packeage.json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "ie > 8"
  ]
}
```

浏览器版本的份额 `> 1%`, `最近2个大版本`, `ie > 8` 多个兼容版本是并集的关系.

## postcss-url

这个插件是在编译遇到`background:url(./a.png)`,这种类似的图片资源的时候, 拷贝资源到指定的目录, 当然也可以转化为 base64.
具体的配置详情可以在[这里查看](https://github.com/postcss/postcss-url),

如果在 webapck 里面有对 css 图片资源的打包处理, 比如`file-loader`(`css-loader配置publicPath配合file-loader来拷贝css引入的图片资源`, 详情请看[webpack 学习笔记(2)-ExtractTextWebpackPlugin 的使用](https://github.com/sevenCon/blog-github/issues/19)),那么可以忽略这个插件

`postcss-url`的配置主要是`url`配置

- `url: rebase`, 不对导入的文件做操作,但会改变引入路径
- `url: inline` base64 的形式导入
- `url: copy` 拷贝文件到特定的目录, 需要配合`basePath,assetsPath,useHash` 使用

## `postcss-url`使用`url:rebase`一个例子

```js
// dependencies
const fs = require("fs")
const postcss = require("postcss")
const url = require("postcss-url")

// css to be processed
const css = fs.readFileSync("input.css", "utf8")

// process css
const output = postcss()
    .use(url({
        url: "rebase"
    }))
    .process(css, {
        from: "src/stylesheet/index.css",
        to: "dist/index.css"
    })

// before:
.element {
    background: url('images/sprite.png');
}

// after:
.element {
    /* rebasing path by new destination */
    background: url('../src/stylesheet/images/sprite.png');
}
```

> 总的来说, 这个插件在`webpack`的使用下, 是可有可无的, 因为文件的拷贝, base64 的引入, 其实有专门的`url-loader`去处理. 但是在这里 post-css 也提供了处理 css 图片资源的思路, 如果`url-loader`处理有难度的话, 不妨试试.

# 一个 autoprefixer 的 demo

```js
// package.json
"dependencies": {
    "autoprefixer": "^9.6.1",
    "css-loader": "^3.2.0",
    "extract-text-webpack-plugin": "3",
    "postcss-loader": "^3.0.0",
    "style-loader": "^1.0.0",
    "webpack": "3.12.0"
    },
"browserslist": [
    "> 1%",
    "ie > 8"
]
```

```js
// webpack.config.js

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
```

## 打包结果

![image](https://user-images.githubusercontent.com/13718019/66037319-e63e7a80-e541-11e9-9bd8-870a486fc7fd.png)

![image](https://user-images.githubusercontent.com/13718019/66037336-f0f90f80-e541-11e9-98db-eba6e2d306e1.png)

# 总结

这个篇章主要了解了什么是 post-css, 和利用`post-css`的`autoprefixer`插件去添加 css 属性的前缀, `post-css`除了这个功能之外,还有很多可以探究的功能和插件, 比如一个很有用的插件, `cssnano`可以合并同一个元素的 css 属性, 进行优化 css. 还有`postcss-preset-env`, 可以让我们使用 css 还在提案阶段的新功能, 比如`image-set()`方法, css 的 var 变量等等. 功能非常强大.
