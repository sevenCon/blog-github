# 前言

`tree-shaking`, 字面的上意思是摇晃树,用来在 ES Module 中, 剔除不需要引入的模块的, 这是一个从 webpack2.0`的时候就支持的功能, 但是支持的程度不尽人意.

> 具体的问题是 babel, uglifyJs 会有副作用,具体请看[你的 Tree-Shaking 并没什么卵用](https://zhuanlan.zhihu.com/p/32831172), 非常 nice 的一篇文章.

文章里面的想表达的意思, 因为在 babel 和 uglifyJs 的打包之后, webpack 很难判断依赖的代码或者项目的代码,是否具有副作用, 或者说打包后都产生了副作用,副作用包括了属性的获取,对象属性的编辑, 或其他影响了全局变量或者方法的操作. 比如赋值属性`obj2 = obj1; obj2.prototype.toString=fn`等等.因为修改了 obj1 的方法,这就是会产生副作用. babel 实现一个`Polyfill`的`Class`, 会给这个变量使用`defineProperty`定义属性,这也算是副作用的一种.

正是以上的原因,因为产生了副作用, 所以导致了 webpack 用的 uglifyJs 打包出来的效果和我们相差甚远.

因此, 在 webpack4.0 之后, 使用 ES Module 的[`terser-webpack-plugin`](https://www.npmjs.com/package/terser-webpack-plugin)进行打包, `terser-webpack-plugin`包其实`uglifyJs-es`的一个 fork, 支持 ES Module 语法的压缩处理.

# sideEffects:false 的打包效果

下面是`sideEffects:false`的打包效果, 以 webpack2.x/webpack3.x 和 webpack4.x 的打包版本进行对比.

## 在 webpack2.x, webpack3.x 中使用的是环境

```
// webpack 2.x
"dependencies": {
    "babel-loader": "6.2",
    "uglifyjs-webpack-plugin": "1.1.1",
    "webpack": "2.4",
    "babel-core": "^6.26.3",
    "babel-preset-es2015": "^6.24.1",
    "webpack-cli": "^3.3.9"
}

// webpack 3.x
"dependencies": {
    "babel-core": "^6.26.3",
    "babel-loader": "7",
    "babel-preset-env": "^1.7.0",
    "uglifyjs-webpack-plugin": "1",
    "webpack": "3"
}
```

```
/* index.js */
import { B } from './test';
const b = new B('bbbbbbbbbbbb').getName();
console.log(b);


// test.js
export class A {
  constructor() {
    this.name = 'AAAAAAAAAAAAAA';
  }
  getName() {
    return this.name;
  }
}

export class B {
  constructor({ val }) {
    this.name = 'constructor bbbbbbbbbbb';
    this.val = val;
  }
  getName() {
    console.log(this.val);
    return this.val;
  }
}
```

**`tree-shaking`如果是理想的话, 可以修剪掉`test.js#class A`.**

另外注意的是:webpack2.x/webpack3.x 使用`tree-shaking`是有条件的

- 使用`uglifyjs`打包压缩
- 设置`babel`的 preset-env#module:false, 设置忽略 ES Module 代码
- 使用`import {xxx} from xxx`的方式加载模块代码
  说白了还是上面的谈到的问题, tree-shaking 完全由`uglifyJS`来做, 那么他对副作用的判断和决定什么时候进行`tree-shaking`, 是说不准的, 而在`babel`打包出来的内容本身就具有副作用的.

所以因为这个问题, `uglifyJs`有个[issue 讨论](https://github.com/mishoo/UglifyJS2/issues/1261)了添加 tree-shaking 的副作用, 所有出现了`/*@__PURE__*/`.

## webpack2.x,webpack3.x

<img src="https://user-images.githubusercontent.com/13718019/66932053-9abfbc80-f069-11e9-9af4-bb808243c05d.png" width="540"/>

## webpack4.x

<img src="https://user-images.githubusercontent.com/13718019/66932141-b88d2180-f069-11e9-9729-6e4945d58b3e.png" width="540"/>
用webpack4.x打包出来的就已经tree-shaking掉了不用到的类class A, 而同样的配置, 在webpack2.x, webpack3.x中是效果不大的, 特别在IIFE的情况下, uglifyJs的tree-shaking难以工作.

# optimize#sideEffects

```
{
  optimization: {
    sideEffects: true | false,
    /*生产模式下默认开启，其他模式不开启。
      如果开启, 那么就会以package.json#sideEffect里面的内容为参考对象*/
  }
}
```

`package.json#sideEffect`的值`true|false|[ignore files]`, 默认为 false, 在项目开启 tree-shaking 的时候,常常需要把这个值设置为忽略我们的 sass 或者 less 的代码, 否则会影响打包的 css 结果.

比如:

```
{
    "sideEffects":['./sass/index.scss']
}
```

指定特定的文件具有副作用, 进而忽略对应文件的`tree-shaking`, 如果想要关注更多的`tree-shaking`打包细节,请看[terser](https://github.com/terser/terser).

# 总结

`tree-shaking`是代码优化中的有效而且重要的一环, 今天的文章算是一个抛转引玉, 期待社区出现关于`terser`解读`tree-shaking`的深度好文.

# 参考

> https://github.com/webpack/webpack/tree/master/examples/side-effects > https://juejin.im/post/5b4ff9ece51d45190c18bb65 > https://segmentfault.com/q/1010000018871965 > https://zhuanlan.zhihu.com/p/32831172
