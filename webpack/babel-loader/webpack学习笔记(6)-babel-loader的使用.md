# 前言

这里是 webpack 系列的第 6 章, 十一假期的假期也过完了, 但是 webpack 感觉还有很多地方想要了解, 特别是在`babel`这一块,`babel`的改动越来越大, 当然方向是朝着我们希望的方向去迈进的, 越来越好用.

而`babel-7.0`改动针对以下的几点, 做了很大的改进.

> - Developers don't know what regenerator-runtime is, they just want to use generators/async functions.
> - Many developers are confused as to why a runtime is needed at all or why Babel doesn't compile Promise, Object.assign, or some other built-in.
> - Developers are confused with the difference between transform-runtime the Babel plugin and the runtime itself, babel-runtime.
> - Complaints about generated code size since babel-polyfill includes all polyfills (although now we have useBuiltIns) and no one knowing about external-helpers

总结了一下,

- 有那么几点`regenerator-runtime`为什么要另外安装?
- 为什么不自动编译`Object.assign, Promise, Set`等等 Api?
- `transform-runtime`, `runtime`有什么区别?
- `babel-polyfill`的引入太大怎么办?.

`babel-7.0` 就是改进了以上的问题.

但是今天的主要目标不是上面提到的几点, 这里只做一个基本的认识, 以成功利用`babel 7`来协助`webpack`打包我们编写我们的业务代码为目的.

从 babel-6.0 之后增加了`useBuiltIns`属性可以有效的减少 polyfill 的大小, `loose`模式下的打包情况等等,其他的一些库比如`babel-runtime`,`core-js`,`babel-transform-runtime`的作用, `babel-polyfill`的库会渐渐弃用, 使用`core-js`和`regenerator-runtime`来进行 polyfill 等等, 变化有很多, 一章装不下, 这些的主要内容, 我都打算捋一遍. 但是今天可惜, 篇章有限.

# `babel`的配置文件

babel 的配置文件自从 babel-7 版本之后, 有 2 中类型, 一种是基于项目的全局配置, 在项目的根目录上的文件名为`babel.config.js`, 另一种是基于相对文件目录的`.babelrc`,`.babelrc.js`或者`package.json#babel`
这 2 种类型的配置可以混合使用, 也可以单独使用, 在进行多个子项目分别使用不同的`babel`配置的时候, `babel.config.js`配合`overrides`的属性使用是一种不错的思路, 另外也可以在子目录上用配置文件`.babelrc`.

> 注意: 经过测试,如果在项目的根目录上, 如果同时有`.babelrc`, `babel.config.js`, 在属性上有冲突的话,那么`.babelrc`具有更高的优先级.

> **这里以下的 demo 基于`webpack-4.x`, `babel-7.x`, `babel-loader-8.x`**.

# `webpack`的`babel-loader`的基本配置

```
// webpack.config.js
module: {
  rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      }
  ]
}
```

# 创建`.babelrc`配置文件

```
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false,
        "useBuiltIns": "usage"
      }
    ]
  ],
  "plugins": []
}
```

# 安装必要的包

```
yarn add  @babel/core @babel/preset-env core-js@2 regenerator-runtime
yarn add  webpack@4 babel-loader@8
```

或者

```
yarn add  @babel/core @babel/preset-env @babel/runtime-corejs2
yarn add  webpack@4 babel-loader@8
```

上面的`core-js@2 regenerator-runtime`可以替换成 后面的`@babel/runtime-corejs2`的.

下面是整体的安装情况:
![image](https://user-images.githubusercontent.com/13718019/66290487-07241880-e912-11e9-945c-a9ae72549f16.png)

## `@babel/runtime`是什么?

> @babel/runtime is a library that contain's Babel modular runtime helpers and a version of regenerator-runtime.

`@babel/runtime`包含模块化的`babel`的`helper`函数和`regenerator-runtime`

在打包的时候, 一些重复使用的函数, 会被提取出来 , 代码运行时的模块化的 helper 函数的集合

```
class Circle {}
```

转化成:

```
function _classCallCheck(instance, Constructor) {
  //...
}

var Circle = function Circle() {
  _classCallCheck(this, Circle);
};
```

`_classCallCheck`这个函数是自动生成的, 作用是用来创建`Circle`的的实例的时候,进行必要的类型检查.诸如此类的方法在`babel`里面称之为`helper`方法.

- `regenerator-runtime`是用来编译`async/await, generator/yield`等生成器函数.

## `@babel/runtime-corejs2`

> @babel/runtime-corejs2 is a library that contain's Babel modular runtime helpers and a version of regenerator-runtime as well as core-js.

`@babel/runtime-corejs2`包含了`@babel/runtime, corejs2, regenerator-runtime`

- `corejs2`是 es5+的各个版本库的`polyfill`实现的方法, 比如`Promise`的 polyfill 的实现等等.

## `@babel/plugin-transform-runtime`

> A plugin that enables the re-use of Babel's injected helper code to save on codesize.
> `@babel/plugin-transform-runtime`依赖于`@babel/runtime`
> 提取公共的代码, 减少打包后的文件体积大小.

除了可以直接提取一些常用公共的函数, 对`runtime`的部分 helper 函数生成的方便进行了一些优化之外, 还有一些额外的工作, 比如可以自动的`poly-fill`, 比如`Set, Map, Promise`, 自动使用`@babel/runtime/regenerator`编译`generator`/`yield`部分的内容,
此外还对以上的编译过程进行定义,

```
// .babelrc
{
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": false,
        "helpers": true,
        "regenerator": true,
        "useESModules": false
      }
    ]
  ]
}
```

有几个关键的配置

- `corejs`: number | false, 使用特定的版本的`corejs`, 比如`corejs: 2`(依赖`@babel/runtime-corejs2`, 需要额外安装).
- `helpers`: boolean, 是否以内敛的方式插入 helper 函数.
- `polyfill`, 这个参数会在 babel7.0 弃用, 并自动设置默认开启
- `regenerator`, 默认是`true`, 是否自动转码`generator/yield, async/await`函数

此外还有一些可选的 options, `useESModules`使用 es6 的模块加载, `useBuiltIns`根据源代码, 自动编译并引用`polyfill`部分.

所以, 总的来说, `plugin-transform-runtime`的作用, 除了对在打包的时候对`helper`的提取公共优化, 还有自动的`polyfill`的功能, 但是这个`polyfill`是有缺陷的, 它不能`polyfill`实例的函数, 因为它不会拓展原生全局对象, 比如`[2].includes(2)`, 就不能使用, 这确实非常的限制,但除此之外, 和原`@babel/polyfill`的作用是一样的.

## 举个优化`helper`引入的例子

```
function _classCallCheck(instance, Constructor) {
  //...
}

var Circle = function Circle() {
  _classCallCheck(this, Circle);
};
```

经过编译之后

```
var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var Circle = function Circle() {
  _classCallCheck(this, Circle);
};
```

这意味着每个包含类的文件都将具有`_classCallCheck`每次重复的功能。
使用`@babel/plugin-transform-runtime`，那么这个函数将被提取到 runtime 里面,进行单独打包, 而其他地方需要的时候, 直接使用就可以了.

## `@babel/polyfill`

`@babel/polyfill`在最初的设置中, 可以对我们引用的`es5+`进行`polyfill`, 包括对象方法, 和实例方法, 还有一些新的 api, `Set, Map, Promise, async/await`等等, 特点是大而全, 不需要我们做任何操作, ES5+的代码全部打包, 但是会把我们不需要的一些`polyfill`api 的库都打包进来, 十分的臃肿.

在 babel6.0 之前的, 我们常用的一个是在打包的入口, 加入

```
require("babel-polyfill");
// 或者
import "babel-polyfill";
// 或者
module.exports = {
  entry: ["babel-polyfill", "./app/js"]
};
```

在 babel7.4 之后的使用, 弃用`babel-polyfill`, 改用`core-js`的方式引入

```
import "core-js/stable";
import "regenerator-runtime/runtime";
```

# 总结

这总结了利用`babel7.0`的版本, 对`babel`捋了一下, 主要介绍`webpack`的`babel-loader`安装和使用,依赖的安装. 还要其他的一些`babel`的插件, `@babel/runtime, @babe/runtime-corejs2, @babel/plugin-transform-runtime, @babel/polyfill`.

# 参考

> https://babel.docschina.org/docs/en/babel-runtime
> https://babel.docschina.org/docs/en/babel-plugin-transform-runtime#installation > https://babeljs.io/docs/en/babel-preset-env#corejs
