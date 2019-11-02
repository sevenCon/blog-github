# 前言

webpack 是个很好很好的工具, 前端作为面对资源比较多的一个工种, 为了整理和对接各种各样的资源, 样式资源,脚本资源, 超文本标记语言 html,svg, 图片展示资源, 字体等等, 提升用户的体验, 提升开发效率, 对前端的开发流程的痛点, 进行了各种工具的聚合和利用, webpack 确实在这方面是前端一个标志性的工具,

webpack 里面的许多功能是社区共同努力的结果, 但是为了我们苦逼的前端程序员 的开发,调试,部署提供了太多太多的便利了.

webpack 目前进行到了 webpack5.0 的版本开发, 但是在 HMR, Live Reload 的的响应时间仍然是不够快.下面总结了一下怎么提高打包效率和减小的打包文件的体积的方法.

> 一下优化的配置 webpack 的版本在 4.0 以上.

# 提升 webpack 优化打包速度

## babel-loader 的 cacheDirectory

利用`babel-loader`我们无负担的使用 ES 的新特性, 但是 webpack 的使用,在开发过程中需要不断的重复编译,非常消耗 cpu, 又要进行各种 loader 的处理, 所以如果有缓存, 这会大大减少不必要的重复劳动, `cacheDirector`就是这么一个属性,可以缓存`babel`的编译结果.

```
class A {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
  sum() {
    return this.a + this.b;
  }
}

let a = new A(120, 2);
console.log(a.sum());
```

**第一次打包和二次打包的对比图**
<img src="https://user-images.githubusercontent.com/13718019/67774505-7667d500-fa98-11e9-9a1f-320ca3007c4c.png" width="540"/>
<img src="https://user-images.githubusercontent.com/13718019/67774546-87b0e180-fa98-11e9-9b83-026b575aed1e.png" width="540"/>

**cacheDirectory 的缓存内容**

cache 的内容是 babel-loader 的需要 polyfill 的各种库函数,比如上面需要支持 Class 的语法, 那么就会缓存进来, 当然缓存的结果是是根据 babel 的配置而生成的, 使用`@babel/polyfill` 和 `@babel/plugin-transform-runtime`生成的库函数当然是会不一样, 详情请看我之前关于 babel 的文章[webpack 学习笔记(7)-bable 的各种依赖理解,corejs, babel-runtime, babel-polyfill 等等-2019-10-13](https://github.com/sevenCon/blog-github/issues/24).

<img src="https://user-images.githubusercontent.com/13718019/67774753-e6765b00-fa98-11e9-90f8-0af01956e862.png" width="540"/>

这个文件能否应用缓存是有条件的, cacheDiretory 的启用会去当前项目的目录下面寻找`node_modules/.cache/babel-loader`下寻找, 如果找不到则会全局环境下的`node_modules/.cache/babel-loader`下寻找.

此外, 如果想要缓存失效的话, 可以修改`cacheIdentifier`的值以强制更新缓存. 默认由@babel/core 的版本, babelrc 的信息, 环境变量等等生成的值, 如果这些信息改变, 那么也会更新缓存, 当然如果缓存对应的源文件有改动, 缓存也会重新生成, 所以, 一般我们使用的话, 直接开启, 如`{cacheDirectory:true}或者'babel-loader?cacheDirector'`就可以.

## webpack 的 dllPlugin

这也是一个利用缓存,去减少重复编译的例子, dll 简称动态链接库(Dynamic Link Library), 最常见到, 应该是在微软的系统里面, 安装完一个程序之后打开安装的文件夹会看看许多的 xxx.dll 的文件, 这就是动态链接库. 这是用来给应用程序用的.

来到 webpack 的编译, 就可以利用这个 dllPlugin 这个插件, 帮我们缓存已经加载的库, 这些库的文件, 比如`vue.js`, `lodash`等等, 不会轻易变动. 自然也就是不需要重复编译.

**添加 dll 动态链接库之前**
<img src="https://user-images.githubusercontent.com/13718019/67868817-75ea3f80-fb67-11e9-8f4b-26f231964f2a.png" width="540"/>

**添加 dll 动态链接库之后**
<img src="https://user-images.githubusercontent.com/13718019/67868774-64089c80-fb67-11e9-834d-4f6165d71527.png" width="540"/>

```math
5287ms => 3913ms
```

效果是很理想的, 如果想改进打包速度, 一定不要忘记了这个.

## loader 配置具体的 include,exclude

loader 的加载, 特别是 babel-loader 一定不要忘记添加 exclude 剔除 node_modules 的打包目录.

```
{
    test: /.js$/,
    exclude: /(node_modules)/,
    use: {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true
      }
    }
}
```

一般来说, 上 npm 的资源都会通过严格的浏览器的兼容测试, 否则也不是一个能够在生成环境使用的包,如果没有兼容, 这个时候就需要对该库的选择进行仔细的考量了, 所以在一般情况下不需要使用`babel-loader`进行二次的兼容转译的, 除非不得已的情况.

## resolve.modules

`webpack`是用`node`来实现的打包项目, 其中对于模块的引入, 是 commonjs2 的规范的, 第三方依赖模块会在安装`node_modules`下, 而对于`require('vue')` 这样的语句, node 会在当前的目录下去找`node_modules`, 然后逐级向上一个目录寻找, 最后会到全局的 node_modules 目录寻找, 项目的层级越深对于模块的寻址负担越大.

通过指定 resolve.modules 的属性,可以一定程度上减少模块寻址带来的压力

```
resolve: {
    modules: [
        path.resolve('node_modules')
        // 指定node_modules所在绝对位置, 不需要递归寻址
    ]
}
```

## resolve.mainFields

当我们引入一个第三方模块的时候, 首先会去取当前项目目录 node_module 上去寻找, 查找并且分析模块的 package.json 文件, 然后加载 main 属性对应的文件模块.

在下面配置里面, webpack 的 mainFields 属性, 这样如果导入模块`import foo from "foo";` 的时候会先去 mainFields 里面寻找`foo`这个模块, 然后在`package.json`里面寻找`brower`字段对应的文件, 如果没有再依次的寻找`module`,`main`.

```
{
    resolve:{
        mainFields: ['browser', 'module', 'main']
    }
}
```

## resolve.alias

我们平时配置别名的方式, 会大大的减少我们引入模块的路径书写长度.
比如

```
resolve:{
    alias:{
        src: path.resolve('src'),        // 匹配前缀
        fn$: resolve('src/utils/fn.js')  // 精准匹配
    }
}
```

```
import fn from "src/utils/fn.js";
// or
import fn from "fn";
```

## resolve.extensions

默认的后缀, 导入模块后缀缺省时, 会在 extensions 的列表里面, 按照顺序去寻找后缀的文件, 这个后缀列表需要遍历, 所以原则上越少越好,常用的类型放前面.

> **备注:最好我们引入的模块都加上后缀**

```
resolve: {
    extensions: ['.js', '.vue']
}
```

## module.noParse

针对某些模块不使用 loader 进行解析.

这个属性是用来忽略特定的模块的, 一些模块不需要经过 webpack 的模块引入也可以运行,比如`jquery`, 这样子可以减少 webpack 的编译时间.

```
module:{
    rules:[],
    noParse:function(moduleName){
        return /jquery/.test(moduleName)
    }
}
```

## Happypack 多进程打包

首先明确的是 Happypack 是对 loader 的处理, 由主进程分配 loader, 打包完成之后合并到主进程进行处理.

所以, 打包的效果提升是有限的, 在充分使用了 Dll 和 babel 的 cache 情况下, 提升并没有说太明显, 但是, 如果系统设计到大量的图片资源 base64 的处理这种业务, loader 处理耗费 CPU, 那可能 happypack 的收益会很高,值得去尝试.

第一步安装:

```
yarn add happypack
```

第二步 loader 的加载资源指定 happypack:

```
module:{
    rules:[{
        test: /\.js/,
        use: ['happypack/loader?id=js']
    }]
},
plugins:[
    new HappyPack({
      id: 'js',
      loaders: ['babel-loader?cacheDirectory']
    }),
]
```

id 是一个标识符,表示当前的资源使用指定的 happypack 实例,可以同时 new 多个 happypack 进行打包,另外当前的 haapypack 不支持 vue-loader, 如果想要使用 happlypack 编译 vue 文件,需要把 vue 文件里面的内容, 比如 js 部分, 单独使用 happypack 来打包.

像这样

```
{
  test: /\.vue$/,
  include:  src,
  exclude: /node_modules/,
  use: [
    {
      loader: 'vue-loader',
      options: {
        loaders: {
          css: xxx,
          less: xxx,
          js: 'happypack/loader?id=js'
          // 单独使用id为js的happypack 实例进行打包
        },
     }
    }
  ]
}
```

<img src="https://user-images.githubusercontent.com/13718019/67947731-426aec00-fc1f-11e9-8473-af19bfbfc509.png" width="540"/>

> 在 webpack 版本迭代优化之后, happypack 可能会被遗弃, 毕竟现在 webpack 的性能也在慢慢变好, 而且多进程有了基于 web worker 的 thread-loader.

> web worker 在使用上可能会有一些限制, 比如 web workder 的进程不能范文 webpack 的配置, 不能生成文件不能使用自定义的 loader 等等.另外一个 web worker 的生成开销也有大约 600ms,使用需要慎重.

## ParallelUgligyPlugin 或者 terset-webpack-plugin

多入口的项目或者文件比较多的项目, 推荐使用`ParallelUgligyPlugin` 或者 `terset-webpack-plugin`, 都是支持多进程打包的, 而`ParallelUgligyPlugin`出现的时间比较早, 所以在 webpack4.0 之后推荐用`terset-webpack-plugin`, 基本上`ParallelUgligyPlugin`有的功能都有, 而且是官方的包, 比较稳定.

**ParallelUgligyPlugin 的使用**

```
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

optimization: {
    minimizer: [
        new ParallelUglifyPlugin({
            cacheDir: '.cache/',
            uglifyJS: {
                compress: {
                    drop_console: true,
                    collapse_vars: true,
                    reduce_vars: true
                }
            }
        }),
    ]
}
```

- `test`, 可选参数, 默认是 /.js\$/, 匹配压缩的对象
- `include`,`exclude`, 可选的参数,
- `cacheDir`, 可选的缓存目录, 绝对路径
- `workerCount`,开启的进程数, 默认 cpu 的数量-1
- `sourceMap`, 默认不开启, 会降低打包的速度
- `uglifyJS`, uglifyJs 的配置
- `uglifyES`, uglifyES 的配置信息, 这是一个支持 ES Module 版本的 uglifyJs, 但是也是因为这个库不再维护, 所以 webpack 默认用`terser`来进行压,`terser`也是`uglifyJs`的一个 fork,配置上大同小异.

```
const TerserPlugin = require('terser-webpack-plugin');
// webpack 4.0 新增的terser-webpack-plugin插件, 可以支持sourcemap, parallel并行压缩, 开启缓存等提高效率的功能
optimization: {
    minimizer: [
        new TerserPlugin({
            cache: true,
            parallel: true,
            sourceMap: false,
            // Must be set to true if using source-maps in production
            terserOptions: {}
        })
    ]
}
```

##　小结
以上是优化和提升打包速度的几个主要的方式

# 减低打包的文件体积

## `Scope Hoisting`

这个特性, 会在 webpack4.0 配置`mode:'production'`里面自动开启, 具体的作用是提升作用域, 简单的来说就是把内嵌的函数提升到根路径, 在模块化编程里面, 常见各种文件互相嵌套, 并且是深层次的嵌套, 提升作用域可以减少函数作用域的数量.

```
{
    mode:'production'
}
```

更多的`scope hoising`信息请看这里[webpack 学习笔记(9)-scope Hoisting](https://github.com/sevenCon/blog-github/issues/26), 介绍怎么利用了`ModuleConcatenationPlugin`插件进行堆栈的抽取和生成的.

## `Tree Shaking`

webpack2.0 初步引入,旧版的`webapck2.0`对 tree-shaking 的 dead code 代码剔除支持不是很好, webpack4.0 之后默认改用了`terser-webpack-plugin`进行压缩代码,同时指定`package.json#sideEffects`属性, 可以有效的剔除 dead code.

```
{
    sideEffects:["*.cs","*.less","*.scss"]
    // or
    sideEffects:false
}
```

任何`import` 的代码都有可能产生`tree-shaking`,包括`css,less,scss` 比如`import '@/less/a.less'`,如果不指定代码具有副作用, 会在`production`的时候被剔除.

> 注意: 或者你也可以使用`webpack-css-treeshaking-plugin`进行 css 的 tree-shaking,首先是思路没有问题, 但是实践起来, 可能很难, 动态加载的 css 和 class, 很难准确进行判定, 而且作者已经很久没有维护了, 使用会有风险, star 很少, 用的人不多, 评测也没有做过,只能算是一个实验性的产品. 在本人的项目运用过程中, 并没有使用, 这里提出来是作为优化的一个思考方向.

## 生成 gzip 的压缩文件

在 nginx 的系统上配置`sendfile:on`, 开启 linux 上的系统调用, 可以非常快速的把磁盘的文件推给客户端,避免了读取磁盘, 写入 buffer, 打包压缩 gzip 的过程
.

```
const CompressionWebpackPlugin = require('compression-webpack-plugin');
// webpack.config.js
plugins:[
    new CompressionWebpackPlugin({
      algorithm: 'gzip',
      test: new RegExp('\\.(' + config.build.productionGzipExtensions.join('|') + ')$'),
      threshold: 10240,
      minRatio: 0.8
    })
]
```

# 总结

在最后,这篇文件林林总总参考和阅读了许多博客文章和笔记,官方文档,有的在实际项目中实践过,有切身感受, 有的也没有亲身实践,只草草的写了 demo 实践经验浅薄, 比如 happypack, 所以侧漏之处各位不妨提醒,共同学习进步, 感谢!.

# 参考

> https://webpack.js.org/plugins/terser-webpack-plugin/#root > https://louiszhai.github.io/2019/01/04/webpack4/ > https://docs.npmjs.com/files/package.json#browser > https://juejin.im/post/5a4dca1d518825128654fa78
