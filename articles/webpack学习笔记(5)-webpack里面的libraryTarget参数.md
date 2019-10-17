# 前言

webpack 里面的`output`其中有 2 个属性, 分别是`libraryTarget`和`library`, 是用来打包一个库的时候工作的.

`library`是导出的库的变量名,而`libraryTarget`则是导出的变量是赋值到哪一个变量上的, 比如 this, global, window,exports 等等.

这章主要解决 2 个问题?

- library 和 libraryTarget 配合使用的打包结果是怎么样的?
- library 缺省值的情况下打包结果会有什么变化?

下面会用一个 demo 的打包情况, 来看看 webpack 这 2 个属性的打包结果. 下面是一些基本的配置.

## 默认的 webpack.config.js 的配置.

```
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
```

## index.js 的入口实例代码

```
let a = 1;
exports.a = a;
```

# libraryTarget 的值有哪些?

> **以下所有的情况,默认的 library:'myLib'**

## libraryTarget:`var`(默认值)

默认当前情况下, 打包的入口返回的值, 是`var`.
以下是打包出来的文件(去掉了其他的内容), 简要的结构.

```
var myLib = (function(modules) {
  function __webpack_require__(moduleId) {
    return module.exports;
  }
  ... 其他的打包相关内容
  return __webpack_require__((__webpack_require__.s = 0));
})([
  function(module, exports) {
    let a = 1;
    exports.a = a;
  }
]);
```

这个可以和其他`libraryTarget`的值类比, 从入口的`index.js`进入开始打包, 入口的文件`index.js`的导出的模块, 就是`__webpack_require__`函数的返回值.
然后把整个入口函数导出的内容, 赋值给变量 myLib, 也就是`library`的值, 这是`libraryTarget`需要配合`library`使用的原因.

## libraryTarget: `amd`

打包`amd`兼容的模块

![image](https://user-images.githubusercontent.com/13718019/66252393-9d7b0180-e78d-11e9-8e50-0353e8eec278.png)

## libraryTarget:`umd`

![image](https://user-images.githubusercontent.com/13718019/66252423-1417ff00-e78e-11e9-891d-8eb1fdf4d1d6.png)

## libraryTarget:`commonjs`

![image](https://user-images.githubusercontent.com/13718019/66252428-22661b00-e78e-11e9-8e7d-d62a669d24fc.png)

## libraryTarget:`commonjs2`

![image](https://user-images.githubusercontent.com/13718019/66252433-34e05480-e78e-11e9-9813-926b45f43b7d.png)

## libraryTarget:`assign`

> libraryTarget: 'assign' - 这将产生一个隐含的全局变量，可能会潜在地重新分配到全局中已存在的值（谨慎使用）。

![image](https://user-images.githubusercontent.com/13718019/66252406-e03cd980-e78d-11e9-8107-908d24722941.png)

## libraryTarget:`global`

![image](https://user-images.githubusercontent.com/13718019/66252409-ef238c00-e78d-11e9-879e-8142750304f2.png)

## libraryTarget:`jsonp`

![image](https://user-images.githubusercontent.com/13718019/66252415-f9458a80-e78d-11e9-9446-126c53ec0458.png)

## libraryTarget:`this`

![image](https://user-images.githubusercontent.com/13718019/66252418-019dc580-e78e-11e9-8f68-9406cfdfda7c.png)

## libraryTarget:`window`

![image](https://user-images.githubusercontent.com/13718019/66252442-4f1a3280-e78e-11e9-87c5-5a2827cc2ecd.png)

# library 的缺省值怎么影响打包结果

> **如果 library 的值是缺省的**

## libraryTarget:amd 定义将匿名模块

如果`library`属性的值是在 libraryTarget:amd 的匿名模块, 此时加载符合 amd 模块标准, 加载匿名模块需要用该**文件名称**进行加载.

```
define(function() { return /******/ (function(modules) {
    ...
}
```

## libraryTarget: `this | global | window | commonjs`

以上几种的情况可以何在一起讲, 因为`this | global | window | commonjs`都是指向一个对象, 这种情况, `index.js`返回的内容也是挂载在一个对象上, 所以会进行遍历这个对象上的属性, 并赋值到`this | global | window | commonjs`的对象上.
![image](https://user-images.githubusercontent.com/13718019/66253076-732d4200-e795-11e9-951f-25e9359b8fd8.png)

## libraryTarget: `commonjs2`

**commonjs2 和 commonjs 的模块打包是有区别的, nodeJs 用的是拓展了 commonJs 的 commonjs2, 和 commonJs 不同, 增加了 module.export, **filename, **dirname 等等内置的变量**

而`libraryTarget: commonjs2`在`library`缺省的时候, 打包并没有什么不同, 因为`module.exports = xxx` 并不需要`library`的值. 所以这个时候`library`值缺省也是可以的.

## libraryTarget: `assign`

这个值在`library`缺省的情况下, 打包出来的结果运行会出错,因为 assign 的定义是, 打包出来的结果是赋值给一个全局变量.

![image](https://user-images.githubusercontent.com/13718019/66253026-02862580-e795-11e9-8cd2-0fc0e684e5cb.png)

## libraryTarget: `var | jsonp`

这 2 个模块在`library`缺省的情况, 不工作的, 因为无论是 var, 还是 jsonp 的情况下都是需要一个名称, 所以这里的结果和`libraryTarget`和`library`都缺省的情况是一样的.

`var` 是需要把 index.js 的入口文件定义成`library`的变量名
`jsonp`是需要一个函数名, 而`library`就是这个函数的名, 函数的参数就是`index.js`返回的内容.

# 总结

这里总结了一下 webpack 里面的属性`library`, 和`libraryTarget`打包的各种情况, 但是如果打包一个库来说, [`rollup`才是最棒的工具](https://github.com/rollup/rollup),trust me~~~.
