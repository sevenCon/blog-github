# 前言

`vue.js`的`nextTick`方法, 是非常有用而且也是经常用到的方法, 今天就来探讨一下这个方法实现的细节. 和我们用到 setTimeout 方法究竟有什么区别?

### 下面是核心的源码结构

直接奔着主题去, nextTick 函数和 setTimeout 的区别, 主要体现在回调的执行时间.下面的 timerFunc 则是延迟函数, 有好几个`if-else`, 按照`promise->mutation observer->setImmediate->setTimeout`的顺序安排.

```
let timerFunc;

if (typeof Promise !== 'undefined' && isNative(Promise)) {
  // 这直接使用原生的Promise 方法.
} else if (
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) || MutationObserver.toString() === '[object MutationObserverConstructor]')
) {
  // 使用MutationObserver
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // setImmediate
} else {
  // setTimeout
}

export function nextTick(cb?: Function, ctx?: Object) {
  ...
}

```

详细的代码请移步[vuejs-next-tick,这里](https://github.com/vuejs/vue/blob/dev/src/core/util/next-tick.js)

# 正文

深入其中的`if-else`, 看到这几个判断, 其实我对以下几个问题, 还是挺好奇的.
带着这几个问题, 去源码或者 issue 中, 找答案, 加深源码理解.

- `setImmediate`比如`setTimeout`好? 区别在哪里?
- 按照优先使用微任务, 最后使用宏任务的回调顺序, 宏任务的使用具体会出现什么问题?
- 原生的`Promise,isNative`的方法是怎么实现?
- IE 11 也可以用`MutationObserver`, 为什么要把 IE 排除在外?
  ,`MutationObserver` 判断, 为什么需要加一个`MutationObserver.toString() === '[object MutationObserverConstructor]'`

带着以上的疑问去源码项目中找答案.

### 第一个问题: `setImmediate`比如`setTimeout`好在哪里?

首先`setImmediate`的问题, setImmediate 可以直接运行, setTimeout 一个不好的地方就在 js 引擎需要和系统的时钟同步, 这个同步的频率在 4ms, 也就是说`setTimeout`的回调, 至少需要 4ms, 即使我们这么写`setTimeout(fn,0)`.

但是`setImmediate`唯一一个不好的地方就是只有 IE 的浏览器支持,
![image](https://user-images.githubusercontent.com/13718019/63651763-2cf2c500-c78b-11e9-8792-e852bc98c722.png)

### 第二个问题: 宏任务究竟有啥子不好?

[vue-issue#6813](https://github.com/vuejs/vue/issues/6813), 在这问题中, 很好的揭示了 nextTick 使用了 setTimeout 的问题.
[vue.js, v-2.51 版本使用了 setTimeout, resize 下会出现 repaint 先比执行, 出现页面宽度小于 1000px 时候, 隐藏导航列表的抖动](https://codepen.io/ericcirone/pen/pWOrMB),

首先捋一下代码的逻辑和重现的步骤. 代码如下面的截图, 红色的区块是重点部分.
![image](https://user-images.githubusercontent.com/13718019/63652073-d9827600-c78e-11e9-8db6-080a91d60981.png)

1. 宽度小于 1000px 时, menu 列表项以块元素显示, 宽度大于 1000px 时, 以内联元素显示, 这时所有的列表项都一行显示.
2. 监听了 window 的 resize 的方法, 屏幕宽度小于 1000px 时, 会设置 showList:false, 隐藏列表项目显示, 但这时会触发隐藏的样式 display:list-item,问题就出现在谁在这 2 者的竞争上.

就是出现设置`this.showList=false`, 上面,当缩放屏幕的宽度时,会触发 2 个事件, 一个是 UI 渲染(display:inline 失效, 渲染 display:list-item), 一个`resize`方法,`this.showList=false|true`,

### resize 方法会先比 UI 渲染先执行吗?为什么?

假设 resize 方法先执行, UI 渲染后执行, 那么会有什么问题?

如果 resize 的方法有 dom 操作,需要重新 UI 渲染, 所以如果这一步 UI 渲染, 是会等待 resize 方法执行完之后, 执行一次 UI 渲染? 这样是可以节省开销,

但是,如果 resize 方法卡死, 或者需要长时间占据 cpu 呢? 那么岂不是页面 resize 出现卡死? 而且 resize 的触发, 肯定会有防抖或节流的, 不可能 resize 每一个 1px 都会触发回调, 不然对 cpu 的压力过大. 所以有好处, 也会出现问题, 看看 chrome 的是怎么执行的?

![image](https://user-images.githubusercontent.com/13718019/63658736-8be22980-c7df-11e9-884c-588c84447cd9.png)

上面是 chrome 的 performance 性能测试, 在下面的 Bottom-Up, 可以看到当前帧的具体运行顺序还有运行的时长,

- 首先进行的是重新计算样式, 更新渲染树,
- 再执行 Event:resize 的方法, 在 resize 方法的回调里面, 执行 getComputedStyle

但是, 这个顺序并不能说明问题, 因为这不是一个公平的竞争测试, 2 个对比最重要的原因还是拖动调整浏览器的可视宽度的时候, 并不是每次都会触发 resize 的回调. 但是每次拖动调整浏览器的可视宽度, 即使一个像素的差别,都会触发浏览器端 layout, repaint 重流和重绘.

但是, 如果我们在 resize 的代码之中添加

```
while(true){

}
```

就会发现, 这个时候,即使我们怎么拖动视窗调转大小,都不会渲染, 即使 1px 的变化, 也不会, 因为这个会浏览器主进程卡死, 后面的渲染进程一直都在队列中, 所以可以知道, 是先执行 resize 的回调, 再进行渲染操作, 这样可以节省渲染的开销.

继续我们原来的问题, 我们在 resize 的回调中, 设置了 showList, 这个时候,vuejs 是利用 nextTick 的进行模板依赖的更新合并的. 把同一个事件循环的操作进行合并到下一个 nextTick 中, 而不必每一个赋值都同步更新依赖. 所以才会 resize 的抖动的问题, 因为 UI 渲染已经进入宏任务队列,并且排在下一个位置, 如果在 resize 的回调里面又再会有宏任务, 那么就会 UI 渲染的下一位置, 所以才出现的抖动, 先进行了一次 UI 渲染, showList:true 或者 false 再生效.

```
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {

      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      let i = queue.length - 1
      while (i >= 0 && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(Math.max(i, index) + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue) // => here
    }
  }
}
```

### 第三个问题: 怎么判断一个 Promise 是不是原生的

```
/* istanbul ignore next */
export function isNative (Ctor: any): boolean {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}
```

才留意到, 原来如果一个原生的方法, 我么打印到控制台的时候, 一般都有 native code 的这样的字符串信息, 真是一个平时又容易忽略, 但是又实用的方法. 而且可用来判断所有的方法.

### 第四个问题: IE 的`MutationObserver` 有什么问题?

最后一个疑问是, IE 下面的使用会有什么问题? 看到这个疑问是在在 next-tick 的函数注释中, 该问题略微的提了一下, 使用 IE mutationObserver 在双向绑定的时候, 有可能会出现多次按钮随机丢失字符的情况
,问题 issue 在这里[IE11: Keystrokes missing if v-model is used](https://github.com/vuejs/vue/issues/6466), 具体的重现在 IE11 下请看[这里](http://jsfiddle.net/zjsuzqgu/15/), 有 IE11 环境的可以重现一下试试, 这个问题环境问题, 我并没有重现出来.

但是可以在 caniuse 上面, 就是关于 IE11 的 issue
![image](https://user-images.githubusercontent.com/13718019/63730220-e7beb800-c89c-11e9-8b1b-4e63bccb70df.png)

所以在 next-tick 的函数中, 就避免了使用 IE 的 mutation Observer 的方法

```
if (
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) || MutationObserver.toString() === '[object MutationObserverConstructor]')
){ ... }
```

而对于在 `PhantomJS and iOS 7.x`, `MutationObserver`的判断, 需要用`MutationObserver.toString() === '[object MutationObserverConstructor'`.

# 小结

看源码和社区博客, github 的 issue, 各种各样的人发表对问题的深刻见解, 各种思维的碰撞, 真的是一种快捷的进步方式. 所以呼吁更多的人, 如果碰到开源项目的问题,不妨到 issue 和大家一起讨论, 拥抱开源.

# 参考

> [IE11: Keystrokes missing if v-model is used](https://github.com/vuejs/vue/issues/6466)

> [v-show is firing late on 2.5.1, nextTick callback trigger is to late](https://github.com/vuejs/vue/issues/6813)
