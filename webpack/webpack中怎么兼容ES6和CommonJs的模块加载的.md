# 前言

我们平时用 webpack 来打包, 对于使用

```
module.export = {};
let foo = require("foo.js");

// 还是

export default {}
import foo from "./foo.js";

```

以上两种完全不同的模块引入方式, 完全是没有区别, 如果模块本身支持, 那么是可以互换的, 怎么加载取决该文件的导出方式, 但无论我们怎么写,在 webpack 打包之后,都可以很好的运行.

这当然要感谢 webpack, 因为它对我们的混杂的模块化代码做了兼容,
所以, 下面来了解它的具体的实现过程.

# 怎么区分 ES6 模块还是 CommonJs 的模块?

要能兼容不同的模块引入, 那么必须得要先识别不同的模块引入方式,
在 webpack 开始解析代码的时候, 有一个必要的步骤是, 生成 AST 语法树.在这里, 通过 AST 树中的`type`判断是否`ExportDefaultDeclaration`, 就可以判断是否 ES6 的模块加载的了.[关于 AST 的更多信息详情,点击这里](https://www.quanlincong.com/article/?_id=5d625c0c0b2891461ec06d51)

打包出来的代码默认是和`runtime`的代码一起的, 什么是`runtime`的代码? 也就是定义了`__webpack_require__`这样的必要的加载模块的函数的代码.

### 打包后怎么引入模块

而我们们引入的模块是通过参数的形式传进去的, 像这样子.

```
(function(modules) {
    // define runtime function
    // require module
})({
    'foo.js' :  function(module, __webpack_exports__, __webpack_require__){
        // require module
    }
})
```

### 打包后的 ES6 模块代码

那问题来了, 那关于 ES6 打包和 CommonJs 的打包转化后的代码会变成什么样子?

```
// foo.js
export default {
  print() {
    console.log('print function called');
  }
};
export var foo = 'foo';

// 打包后=>
{'foo.js' : function(module, __webpack_exports__, __webpack_require__) {
        'use strict';
        __webpack_require__.r( __webpack_exports__ );
        __webpack_require__.d( __webpack_exports__, "foo", function() {
            return foo;
        });
        __webpack_exports__["default"] = ({
            print() {
              console.log('print function called');
            }
        });
        var foo = 'foo
    }
}
```

可以看到,打包后的代码变化很大, 首先因为需要兼容 2 种不同的打包方式, 如果是方法可以重写(像 CommonJs 的`module.export/require`可以通过自动 module 变量来起作用), 但是`export/import`关键字不能重写, 所以需要把原生的写法转为使用自己的模块加载方法`__webpack_require__`. 所以就变成了这样了

```
export default {}

// 打包后=>
__webpack_exports__["default"] = ({})
```

其次, 为了识别是 ES6 的模块加载方式, 在需要在导出该对象的时候, 给该导出的对象`__webpack_exports__`添加`__esModule=true`标识.

如果 ES6 的单个属性导出的话,则是这样子

```
export var foo = 'foo';

// 打包后=>
__webpack_require__.d( __webpack_exports__, "foo", function() {
    return foo;
});
var foo = 'foo
// __webpack_require__.d 其实就是Object.defineProperty
```

也就是在`__webpack_exports__`上定义属性, 在模块引入的时候, 发现是 ES6 的模块, 那么直接返回`__webpack_exports__`的具体属性.
**注意的是, 这里是先利用闭包定义了一个局部变量, 然后利用函数导出这个局部变量的引用. 也就是说 ES6 的属性导出和模块导出是一个引用.**

### 打包后的 CommonJs 的模块

```

// 打包后 =>
{
  './bar.js':
    /*! no static exports found */
    function(module, exports) {
      eval(`
      module.exports = {
        bar() {
          console.log('bar');
        }
      };
      //# sourceURL=webpack:///./bar.js?`);
    }
}
```

这里就不需要重写原生代码了, 挟持 module 就可以.

### 导出模块引入方式

```
var installedModules = {}; // The require function

function __webpack_require__(moduleId) {
    // Check if module is in cache
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    } // Create a new module (and put it into the cache)
    var module = (installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    }); // Execute the module function

    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    // Flag the module as loaded

    module.l = true; // Return the exports of the module

    return module.exports;
}
```

模块的引入是用`__webpack_require__`方法, 这是一个同步引入模块的方式, 利用`installedModules`缓存导出的对象`exports`.

### 异步模块引入的方式

```
require.ensure([], () => {
  var bar = require('./bar.js');
  console.log(bar);
});
```

require 是 webpack 传入的一个变量, 可以进行异步组件的引入, webpack 对于以上的代码的打包, 转化成如下

```

// runtime 的入口引入部分
// index.00b5412b65345e674fb1.bundle.js 入口
{'./index.js': function(module, __webpack_exports__, __webpack_require__) {
    'use strict';
    eval(
      `__webpack_require__.e(0).then((() => {
        var bar = __webpack_require__("./bar.js");
        console.log(bar);
      }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
    );
  }
}

// 异步组件单独打包成一个文件进行引入
// 0.8b8e7b45f7069f5599d7.bundle.js
(window['webpackJsonp'] = window['webpackJsonp'] || []).push([
  [0],
  {
    './bar.js': function(module, exports) {
      eval('module.exports = {\n  bar() {\n    console.log(\'bar\');\n  }\n};');
    }
  }
]);
```

打包后的异步加载加载的入口是`__webpack_require__.e(0)`的形式, 那么自然异步组件的内容变动, 理论上是不会影响`runtime`的环境代码的(如果指纹是用 contenthash 的话), 但是因为异步代码对应的 hash 是写在`runtime`里面的,所以 很难做到`runtime`和异步组件的完全不受影响.
而`require.ensure`方法的实现, 也就是新建一个 script, 加载异步组件的内容

```
__webpack_require__.e = function requireEnsure(chunkId) {
    var promises = []; // JSONP chunk loading for javascript

    var installedChunkData = installedChunks[chunkId];
    if (installedChunkData !== 0) {
      // 0 means "already installed".

      // a Promise means "currently loading".
      if (installedChunkData) {
        promises.push(installedChunkData[2]);
      } else {
        // setup Promise in chunk cache
        var promise = new Promise(function(resolve, reject) {
          installedChunkData = installedChunks[chunkId] = [resolve, reject];
        });
        promises.push((installedChunkData[2] = promise)); // start chunk loading

        var script = document.createElement('script');
        var onScriptComplete;

        script.charset = 'utf-8';
        script.timeout = 120;
        if (__webpack_require__.nc) {
          script.setAttribute('nonce', __webpack_require__.nc);
        }
        script.src = jsonpScriptSrc(chunkId);

        onScriptComplete = function(event) {
          // avoid mem leaks in IE.
          script.onerror = script.onload = null;
          clearTimeout(timeout);
          var chunk = installedChunks[chunkId];
          if (chunk !== 0) {
            if (chunk) {
              var errorType = event && (event.type === 'load' ? 'missing' : event.type);
              var realSrc = event && event.target && event.target.src;
              var error = new Error('Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')');
              error.type = errorType;
              error.request = realSrc;
              chunk[1](error);
            }
            installedChunks[chunkId] = undefined;
          }
        };
        var timeout = setTimeout(function() {
          onScriptComplete({ type: 'timeout', target: script });
        }, 120000);
        script.onerror = script.onload = onScriptComplete;
        document.head.appendChild(script);
      }
    }
    return Promise.all(promises);
  };
```

webpack 的代码分割把`bar.js`的代码打包成了`0.8b8e7b45f7069f5599d7.bundle.js`, 加载的时使用下标的形式加载`__webpack_require__.e(0)`, `__webpack_require__.e`则是`requireEnsure`, 加载异步代码的, 使用下标加载 , 识别对应下标的 hash,是使用`jsonpScriptSrc` 函数,

```
function jsonpScriptSrc(chunkId) {
    return __webpack_require__.p + '' + ({}[chunkId] || chunkId) + '.' + { '0': '8b8e7b45f7069f5599d7' }[chunkId] + '.bundle.js';
}
```

这个函数在每次异步组件更新的时候(如果指纹是用 contenthash 的话),都会随异步组件的内容变动.

# 总结

到这里, 其实很多加载方面的东西都很清晰了,

- webpack 可以加载不同的模块, 因为把不同的加载的方式, 打包成兼容代码, 同时使用了自己的模块加载方式.
- 默认所有的代码同步加载的, 有异步的组件, 那么通过 script 的标签来加载,
- 加载的模块持有的是引用, 组件内部修改, 导出的模块引用数据也会更新.

> 本文的 github 地址[webpack 中怎么兼容 ES6 和 CommonJS 的模块加载](https://github.com/sevenCon/blog-github/issues/18), 如果有侵权或其他问题, 请 issue 留言,感谢~
