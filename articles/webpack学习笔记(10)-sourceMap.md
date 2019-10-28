# 前言

早些时候, 读阮一峰的一篇关于 sourceMap 的文章, 我还记得那个时候, 刚刚接触 webpack 吧, 头发还很多, 接触一个 webpack 的属性 devtool, 那个时候的 webpack 汉化还不是很好, 看着一个个`eval, cheap-eval-source-map`等等的属性, 一头雾水, 半知半解.

现在回头再看 webpack 的官方文档, 恍然大悟, 原来是**真的不懂**!

# `webpack`的 devtool 属性

我们用 webpack 打包, 生成的隐射文件一般有几种方式

- eval
- cheap-eval-source-map
- cheap-module-eval-source-map
- eval-source-map
- cheap-source-map
- cheap-module-source-map
- inline-cheap-source-map
- inline-cheap-module-source-map
- source-map
- inline-source-map
- hidden-source-map
- nosources-source-map

罗列了这么多的选项, 但是其中的关键字, 其实可以归纳为以下几个

- `eval`, 使用 eval 函数包裹整个模块, 并且在文件开始或末尾添加`// sourceUrl=xxx`的方式.这种方式也可以生成 sourceMap, 但是实现是基于浏览器的 runtime 的, 也就是说我们如果拿到报错的信息, 但是却拿不到 source map 的文件, 很难去做错误回溯, 同时因为隐射的是转译后的代码, error trace 的行号是不准确的, 同时 source map 的实现基于浏览器, 兼容性和一致性不敢保证, 在生产环境中一般不会使用.

- `source-map`,生成.map 文件的格式, 并且在源文件结尾添加`// sourceMappingUrl=xxx.map`的方式. 这种方式可以根据堆栈信息去回溯错误, 并且准确定位行和列.

- `cheap`, 不在隐射文件中生成列对应信息, 因此只能定位行

- `module`, 不加载 loader 的 sourceMap, 意味着如果有 babel 等 loader, debugger 的时候只能看到转译后的代码

- `inline`, 以 dataUrl 的方式把隐射的信息添加在文件的末尾, 这里 inline 属性是用在第三方工具使用, 不适合在开发环境或者生产环境使用, 原因是 inline 会把当前文件的 sourceContent 都包含进来, 在生成环境下,会加载模块文件的体积, 开发环境下 rebuild 的速度又慢.

- `hidden`, 意味着不会在源文件的末尾添加注释, 表明 source map 的文件地址, 同时 webpack 建议我们不上传 source map 源文件到服务器, 而是自己另外储存, 在堆栈检查工具中使用.

- `nosources`, 生成的 source map 没有源码信息,所以不会公布源代码, 但是会反编译文件名和目录结构, 这需要上传 source map 文件到服务器.

在以上的几点介绍中, 或多或少的理解了各种的组合的作用和优势, 值得一说的 eval 的方式生成的 source map 和我们 uglifyJs 或者 terser 生成的不一样, eval 的方法生成 source map, 是需要使用`eval()`包含着运行的代码, 在代码的最后标注`// sourceUrl=xxx.js`, 这在浏览器内部的运行时

## `devtool: 'sourcemap'` 的例子

比如:

```
class A {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
}

debugger;
throw Error('test source map locate');
let a = new A(1, 2);
console.log(a.a);

```

`devtool: 'sourcemap'`, 情况下,调试和错误堆栈结果:
<img width="540" src="https://user-images.githubusercontent.com/13718019/67649050-779ee200-f972-11e9-9401-37b86419f41b.png"/>

<img width="540" src="https://user-images.githubusercontent.com/13718019/67649093-9bfabe80-f972-11e9-8135-8b9debd95227.png"/>

debugger 和错误的堆栈信息都能正确定位, debugger 的是 babel 转译前的代码.

## `devtool: 'cheap-module-eval-source-map'` 的例子

`devtool: 'cheap-module-eval-source-map'`的例子, 则是包括`eval`, 和`sourcemap` 2 中混合的 source map 方式, 也即是说生成隐射文件, 既包括 eval 的 base64, 又有 xxx.map 的 map 文件, 同时`cheap`没有列号,`module`意味着会加载 loader 的 source map 信息, 可以看到转译前的代码

相同的代码

```
class A {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
}

debugger;
throw Error('test source map locate');
let a = new A(1, 2);
console.log(a.a);
```

<img src="https://user-images.githubusercontent.com/13718019/67652470-0cf4a300-f980-11e9-9772-8d6fc08fa4e4.png" width="540"/>

<img src="https://user-images.githubusercontent.com/13718019/67652485-1716a180-f980-11e9-90ed-536fd74526ba.png" width="540"/>

## devtool 小结

webpack 的 devtool 属性差不多了, inline, 和 nosource, hidden 属性用的比较少, 就不细说了.

生产环境推荐的使用`source-map`,特点不增加模块文件的大小, 同时 error trace 准确,开发环境推荐使用`cheap-module-eval-source-map`, rebuild 的速度快, 可以定位问题的位置, 追溯到未转译前的代码.

可以完整的输出转移前代码的行号和列号, 但是代价是重复编译的速度比较慢.

# 认识 source map 文件的内容

打包出来的`xxx.map`文件的就是隐射到的文件

```
let sourceCodeHere = xxxx
//# sourceMappingURL=0.787d0614320f767fc8d1.js.map

//=>0.787d0614320f767fc8d1.js.map
{
    "version": 3,
    "sources":[
        "webpack:///./node_modules/lodash/_listCacheHas.js",
        "webpack:///./node_modules/sockjs-client/lib/transport/jsonp-polling    .js",
        "webpack:///./node_modules/lodash/_cloneArrayBuffer.js"
    ],
    "names": ["assocIndexOf",
                "module",
                "exports"],
    "mappings": ";gFAAA,IAAIA,EAAe,EAAQ,QAe3BC,EAAOC,QAJP,SAAsBC,..."
}
```

## `.map`文件主要由几个字段组成

- version, 版本号, 经历 3 个版本, 大大减少映射文件的体积大小
- file, 编译生成的文件
- sourceRoot, 源文件相对路径
- sources, 源文件列表
- sourceContent, 源文件配置，当没有配置 source 的时候则使用这个
- names, 变量名
- mappings, 映射信息

mappings 里面储存的是隐射信息, 也是整个文件的大小的瓶颈, 如何设置一个合理和具有效率的编码去表示对源码的一对一隐射, 对整个 map 文件的大小具有重大的意义.

对于 mappings 字段的解读

- 每一行的映射片段块都会以分号 (;) 分隔开来
- 每个片段以逗号 (,) 分隔
- 每个片段是有 1,4 或 5 个变量长度的字段组成

一个片段具有 5 个字符
<img src="https://user-images.githubusercontent.com/13718019/67662343-302e4b00-f99e-11e9-8a40-b3c5f109fca9.png" width="540"/>

所以在这里引入 MIDI 文件的 VLQ 编码.

# VLQ 编码

VLQ 编码是`Variable-length quantity`的全称,使用任意数量的 8bit 去表示一个较大的数值, 是一种变长的编码方式, 也就是说需要一个控制位去控制当前的编码单元是否是一个有效的整体,能够单独的表达一个数值.

实际用到了 source map 的场景下, 就具体到使用任意数量的 6bit 去表示一个数值.
一个 6bit 的单元, 可以表示-15 ~ +15 的范围, 具体的字符隐射, 可以借用 base64 的编码字符集
<img src="https://user-images.githubusercontent.com/13718019/67657689-77164380-f992-11e9-88bf-3735007b6cd8.png" width="540"/>

base64 的编码字符集隐射表.
<img src="https://user-images.githubusercontent.com/13718019/67658102-95c90a00-f993-11e9-942f-659968855cd2.png" width="540"/>

所以,隐射的情况下, 解读 mappings 的一个片段, 如`QAAA`, 在隐射表里面表示`16,0,0,0`.

二进制`010000`,`000000`,`000000`,`000000`.

- 第一步, 用二进制表示, 不够高位补 0, 判断高位是否为 1, 表示连续,这里为不连续
- 第二部, 二进制数是 16, 最高位是 0,其余是 0,符号位正,所以, 取消符号位和最高位, 表示的数值: 8.

所以这里表示, 表示编译后文件的第 8 列, 位于源码的第 0 个文件, 第 0 行 0 列, names 里面的第 0 个变量.

## 如何用 VLQ 编码表示-23

`23` 用数值表示 10111,

- 第一步, VLQ 的 source map 表示值的部分为 4 位, 需要拆分为`0001 0111`.
- 第二部, 从低开始编码 `0111` => `1 0111 1`, 连续符号位为 1, 标志位为 1, 表负数, 接着高位`0001` => `000001`, 连续符号位为 0, 没有标志位.

最好查表得结果`47,1=>vB`.

# 参考

> https://survivejs.com/webpack/building/source-maps/ > http://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html > http://www.alloyteam.com/2014/01/source-map-version-3-introduction/
