# 前言

target 属性, 主要是用来区分部署的对象是哪个平台的, 可能的值是`web`,`node`, `electron`等等, 这个属性用的很少, 可能是 element 或者 node 的项目比较少用到 webpack, 而 target 的默认值是`web`, 意思是面向的部署平台是`web`浏览器端, 而我们前端人员来说, 主要的工作就是浏览器的页面. 但是了解一些这些可能的参数,对 webpack 的深入了解还是百利无一害的.

# target 的值有哪些?

target 的值可以是以下的一个

- web (默认值), 意思部署的平台是浏览器
- async-node | node
- node-webkit
- electron-main
- webworker

面对不同的平台, 打包的结果不同, 主要体现在不同平台对模块加载有不同的引入, 比如, 默认的`web`平台, 那么包的引入是用`__webpack_require__`, 在代码分离的时候, 使用的是 `webpackJsonp(...)`方法进行引入分离的模块.

## target 属性为`web`|`node-webkit`

这个是默认的打包方式, 但是打包的结果和`node-webkit`类似,都是使用`<script>`来加载, 配合`onload`和`onerror`事件处理.

## target 属性为`node`

以下是`target:node`打包后的代码,

```
// webpack.ensure 方法, 加载新模块
__webpack_require__.e = function requireEnsure(chunkId) {
    // "0" is the signal for "already loaded"
    if (installedChunks[chunkId] !== 0) {
      var chunk = require('./' + chunkId + '.node.js');
      var moreModules = chunk.modules,
        chunkIds = chunk.ids;
      for (var moduleId in moreModules) {
        modules[moduleId] = moreModules[moduleId];
      }
      for (var i = 0; i < chunkIds.length; i++) installedChunks[chunkIds[i]] = 0;
    }
    return Promise.resolve();
};
```

可以看到上述的代码, 使用 require('./xxx.node.js')加载的, nodeJs 原生的模块加载是同步, 也就是使用`fs.readFileSync`的 api, 如果加载以下代码, 则是直接运行`__webpack_require__.e(0)`的返回是一个`resolved`的`promise`. 也就是可以同步执行.

```
__webpack_require__
    .e(0)
    .then(__webpack_require__.bind(null, 1))
    .then(module => {
      let hello = module.hello;
      hello();
    });
```

## `target`属性为`node-async`|`electron-main`

如果 target 的加载方法是`node-async`, `electron-main`, 加载的方式是使用原生的`require/export`方式.
但是和原生一点不同, 加载方法`require`方法是自己实现的,使用的是异步的`readFile` nodeJs 原生的`require`方法,使用的是同步的`readFileSync`.
至于其他的, 循环依赖或者导出, 还是模块的上下文变量, 和`nodeJs`原生的相比并没有什么不同.

`electron-main`和`node-async`类似,都是使用自己实现的异步`require`方法.

```
// NodeJs的原生的模块使用的readFileSync同步加载
require('fs').readFile(filename, 'utf-8', function(err, content) {
    if (err) return reject(err);
    var chunk = {};
    require('vm').runInThisContext(
        '(function(exports, require, __dirname, __filename) {' + content + '\n})',
        filename
    )(chunk, require, require('path').dirname(filename), filename);
    var moreModules = chunk.modules,
    chunkIds = chunk.ids;
    for (var moduleId in moreModules) {
        modules[moduleId] = moreModules[moduleId];
    }
    var callbacks = [];
    for (var i = 0; i < chunkIds.length; i++) {
        if (installedChunks[chunkIds[i]]) callbacks = callbacks.concat(installedChunks[chunkIds[i]][0]);
        installedChunks[chunkIds[i]] = 0;
    }
    for (i = 0; i < callbacks.length; i++) callbacks[i]();
});
```

`vm`是提供一套 V8 的沙箱环境, 包含了`global`, 但是不会包含当前运行环境的上下文, `runInThisContext` 则是类似`eval`运行字符串代码的 api. 返回构建的结果. 所以

```
require('vm').runInThisContext(
        '(function(exports, require, __dirname, __filename) {' + content + '\n})',
        filename
    )(chunk, require, require('path').dirname(filename), filename);
```

以上的代码的含义就是用读取的模块文件的代码, 构建一个模块加载函数, 并传入里面的参数`exports, require, __dirname, __filename`, 运行. 其中模块代码的导出结果, 会挂载到`chunk`的对象上.

## target 属性为: webworker

```
 __webpack_require__.e = function requireEnsure(chunkId) {
    return new Promise(function(resolve) {
      // "1" is the signal for "already loaded"
      if (!installedChunks[chunkId]) {
        importScripts('' + chunkId + '.webworker.js');
      }
      resolve();
    });
  };
```

这里就没什么好说的了, 同步加载 js 代码, 但是使用的`webworkder`的 api,`importScripts` 是一个同步执行代码的方法, 将一个或多个脚本同步导入到 worker 的作用域中, 所以参数可是多个.

## 小结

到这里, 其实 target 可以说的内容已经很少了, 基本上可能的参数, 都差不多了解其内部的工作原理.
