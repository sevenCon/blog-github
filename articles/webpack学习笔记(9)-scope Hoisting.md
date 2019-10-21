# 什么是作用域提升?

`Scope Hoisting`, 作用域提升, 是一种对引入的模块优化的策略.对于引入的模块,一般来说都是一个隔离的作用域, 为了减少作用域的嵌套, 提升运行的效率, 有必要在打包的时候, 减少一些不必要的作用域, 这就是作用域提升的效益所在.

那什么时候决定提升作用域, 什么时候保留作用域呢?
在[webpack 的插件 ModuleConcatenationPlugin](https://webpack.js.org/plugins/module-concatenation-plugin/), 里面有详细的介绍, 列举了常常用到的几种作用域的处理方式.

# 什么时候会作用域提升?

作用域提升的初衷是很好的, 合并一些闭包, 但是不是所有的情况都可以合并, 比如源代码里面包括`eval`, `eval`方法的运行强烈依赖所处的作用域, 如果合并了会出现一些出乎意料的事情.

所以对`Scope Hoisting`就有 2 中情形,
`Prevent(不合并)`|`Root(合并)`

| Condition                                        | Outcome         |
| ------------------------------------------------ | --------------- |
| 1. Non `ES6 Module`                              | Prevent(不合并) |
| 2. Imported By Non Import                        | Root(合并)      |
| 3. Imported From Other Chunk                     | Root(合并)      |
| 4. Imported By Multiple Other Module Groups      | Root(合并)      |
| 5. Imported With `import()`                      | Root(合并)      |
| 6. Affected By `ProvidePlugin` Or Using `module` | Prevent(不合并) |
| 7. HMR Accepted                                  | Root(合并)      |
| 8. Using `eval()`                                | Prevent(不合并) |
| 9. In Multiple Chunks                            | Prevent(不合并) |
| 10. `export * from "cjs-module"`                 | Prevent(不合并) |

有几点需要额外说明的, `Scope Hoisting`需要满足几点条件:

- 需要`ES Module`
- `Scope`需要来自一个`Chunk`, 但被不同的 chunk 同时依赖的时候不能合并的, lazyload 的 chunk 也不能合并的.
- `Scope`可以来自多个模块, 比如嵌套引入,嵌套分组引入的`Scope`都是允许的.
- `Eval,ProvidePlugin,module, export * from "cjs-module"`等等不能合并

其次, 在合并的时候合并到`Root Scope`, 哪里是`Root Scope`?
也就是我们打包的一个 chunk 的入口.

> `Imported By Non Import`这个的意思其实不是很理解, need help!

在多个`chunk`中, `ModuleConcatenationPlugin`会去寻找一个 chunk 中允许最大的 scope 合并.
比如:
<img src="https://user-images.githubusercontent.com/13718019/67155264-240f1180-f33e-11e9-935b-80c6ecb2381f.png" width=320/>

`shared.js`同时被`chunk B/c.js`和`chunk A/a.js`依赖, 那么`shared.js`就是一个独立的`Scope 2`, 不能合并. 换句话说, 如果`shared.js`不被`c.js`依赖的话, 那么`Scope 2`可以合并到`Scope 1`中, 反之亦然. 至于为什么同一个模块如果被多个模块同时引用, 为什么不能合并, 我想, 应该是模块重用的问题, 合并了反而回显得臃肿, 另外如果出现循环引用, 也可能会翻车.

`Scope 3`中, `cjs`是通过`commonJs`的方式去引入的, 自然也不能把`cjs`合并到`Scope 3`中.

`lazy`被`example.js`异步引入, 也不能把`Scope 3`合并到`Scope 1`中.

# 例子

```
// module -> [module1-1.js,module1-2.js]
import module3 from './module3.js';

import moduleEval from './module-eval.js';
import cjs from './module-export.js';

// module1-1.js合并, module1-2.js不合并, 因为module1-1.js还被lazy.js引用
console.log(module3);

console.log(moduleEval()); // eval方法, 不合并
console.log(cjs); // 非 ES Module引入不合并

// 不合并
// lazy.js -> [module1-1.js]
import('./lazy').then(function(lazy) {
  console.log(lazy.a);
});

```

结果:
<img src='https://user-images.githubusercontent.com/13718019/67155669-1198d600-f346-11e9-848e-4ba37e0b5217.png' width=480/>

## 小结

总的来说,原则是把合并单一依赖的子代的 ES Module 模块到`Root Scope`.

所以, 现在我们知道了`Scope hoisting`的具体产生的结果和一些基本的效益了.那么接下来看看`ModuleConcatenationPlugin`是怎么作用.

# debug 了解 ModuleConcatenationPlugin 的调用

下面跟着`ModuleConcatenationPlugin`的源代码 debugger 一下,看看`ModuleConcatenationPlugin`对 dependencies 的抽取流程.

## 1.1 在`package.json`先加上`node --inspect-brk`的方式启动`webpack`

`node`已经内置了`node-inspector`的插件了, 方便我们调试代码, `--inspect-brk` 是启动就断点停顿的意思.`rimraf -f ./dist` 这个是清理 dist 打包目录的插件命令,不要也可以.配置`npm start`方面重启不用打这么长的命令.

```
// package.json
"scripts": {
    "start": "rimraf -f ./dist && node --inspect-brk ./node_modules/webpack/bin/webpack.js --config webpack.config.js"
}

// npm start 启动
```

chrome 里面开启 inspect 进行调试

```
chrome://inspect/#devices
```

<img src="https://user-images.githubusercontent.com/13718019/67157023-a73d6100-f358-11e9-88c6-dd267f83ba1d.png" widtd=480/>

## 1.2 ModuleConcatenationPlugin 构造函数断点

在`webpack/lib/optimize/ModuleConcatenationPlugin`里面打个`debugger`断点.
`ModuleConcatenationPlugin`在`node_module/webpack/lib/optimize`目录下, 这个目录存放着所有关于优化部分的插件,比如压缩代码, 抽取 common 代码的东西等等.

而这个插件真正开始作用的是在`compilation.plugin('optimize-chunk-modules')`

这里如果想要弄清楚 webpack 是怎么调用插件的, 利用 chrome 自带的 call stack 是非常直观的,比如这里的调用过程
<img width="1217" alt="图片" src="https://user-images.githubusercontent.com/13718019/67211209-f2d13700-f44c-11e9-92e6-31932d343bcb.png">

涉及到的文件名和文件的方法,都依次的显示出来, 可以点击 call stack 的调用栈列表,会跳到调用方法处.

## 过滤多余的 module

首先是进行检查过滤掉不符合合并要求的`module`, 比如剔除`Eval`函数的模块.

```
// 剔除 eval
if (module.meta && module.meta.hasEval) {
    setBailoutReason(module, 'Module uses eval()');
    continue;
}

// providePlugin的剔除
if (!Array.isArray(module.providedExports)) {
    setBailoutReason(module, 'Module exports are unknown');
    continue;
}
// more...
```

过滤剩下符合需求的模块, 储存在`relevantModules`变量中. 接下来是排序,
从顶级的`Root Scope`开始, 比如对于一个模块如果同时被第一层和第二层引入, 那么可以跳过第二个引入.

最后得到的数组是一个从入口处,依次嵌套引入的 dependency.

## 遍历`relevantModules`

以下是来自官网的伪代码,具体的实现过程和伪代码不一致,但是结果是一样.

```
function tryToAdd(group, module) {
  if (group.has(module)) {
    return true;
  }
  if (!hasPreconditions(module)) {
    return false;
  }
  const nextGroup = group;
  const result = module.dependents.reduce((check, dependent) => {
    return check && tryToAdd(nextGroup, dependent);
  }, true);
  if (!result) {
    return false;
  }
  module.dependencies.forEach(dependency => {
    tryToAdd(group, dependency);
  });
  group.merge(nextGroup);
  return true;
}
```

`tryToAdd` 用于生成一个 group, 类似以下的结构
<img width="383" alt="图片" src="https://user-images.githubusercontent.com/13718019/67207947-26a95e00-f447-11e9-8351-898e852264eb.png">

生成这个数据结构是为了可以遍历每个 chunk 的 module, 并且删除掉这些依赖, 因为这些作用域已经提升到`Root Scope`了, 可以直接调用.

```
// 每个Scope依赖的module重新生成一个新的module
const newModule = new ConcatenatedModule(concatConfiguration.rootModule, Array.from(concatConfiguration.modules));

// 删除原来的chunks的module
const chunks = concatConfiguration.rootModule.getChunks();
for (const m of concatConfiguration.modules) {
    usedModules.add(m);
    chunks.forEach(chunk => chunk.removeModule(m));
}

// 添加Scope Hoisting的newModule
chunks.forEach(chunk => {
    chunk.addModule(newModule);
    newModule.addChunk(chunk);
    if (chunk.entryModule === concatConfiguration.rootModule) chunk.entryModule = newModule;
});
```

这里的逻辑就很清晰了, 衔接上一步获取得到的 Scope 列表,遍历每个 Scope, 重新用每一个 Scope 依赖的的 dependency 生成一个新的 module, 然后并且把这个新的 module 合并到原来的所属的 chunk 里面.

# 总结

对于 Scope Hoisting 就总结都这里了, 其实如果想要挖的话, 也可以换个方向, 比如去比对一下深层的 scope 对于代码的运行效率的影响又多大, 这也是对 Scope Hoisting 效益理解的一方面, 毕竟有看得见的效益对我们的优化技术的推进才有意义.

> 参考
> https://webpack.js.org/plugins/module-concatenation-plugin/ > https://github.com/webpack/webpack/tree/master/examples/scope-hoisting
