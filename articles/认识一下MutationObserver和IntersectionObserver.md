# 前言

前几天在文章[vuejs 中的 nextTick 函数和 setTimeout 的区别]()之中讲到 MutationObserver 的作用, 作为异步调用的 Promise 的备胎, 在 dom 监听方面还是有很多优势.

MutationObserver 的主要作用是监听 DOM 变化, 其中如果 DOM 有变动, 这个变动包括节点属性修改, 节点增加或删除, 文本内容的增删, 移动,等等都会触发 MutationObserver 的事件, 但是和事件触发的机制不同的是, 事件触发是同步触发, 而 MutationObserver 的触发方式是异步, 而这个异步回调的方式是 Micro 任务, 不是 Macro 任务. 这也是优先使用作为原生 Promise 的备胎原因.

# MutationObserver

MutationObserver 的 API 很简单, 只有一个构造函数,和 3 个 API

### MutationObserver 的构造函数

MutationObserver 的构造函数, 需要一个回调函数, 这个回调函数需要一个函数, 每当 DOM 改动的时候, 就会触发这个回调, 依上述所言, 并不是同步触发的, 而是异步, 那么节点的变动. 就需要一个数组来储存这个变动, 所以回调函数的第一个参数是一个数组, 记录变动的记录, 而第二个参数则是当前的 MutationObserver 实例.

```
let mo = new MutationObserver(cb);
```

### MutationObserver 的实例方法

```
mo.observe(element, config); // 开始监听
mo.disconnect();  // 停止监听
mo.takeRecords(); // 返回清理的MutationObserver 实例, 调用之后将清理回调记录, 也就是之前的修改不会触发cb回调.
```

实例的方法有 2 个

- `mo.observe(element, config);`, 开始监听, observe 的第一个参数是监听的节点, 第二个节点是监听的参数, 可以选择监听属性, 节点增删, 后代节点的增删, 文本节点的增删及移动.

```
{
    attributes: true,       // 属性节点的变动
    characterData: true,    // 文本节点的变动
    childList: true,        // 子节点变动
    subtree: true,          // 后代节点变动
    attributeOldValue: true,      // 是否记录原来的属性信息
    characterDataOldValue: true,  // 是否记录原来的文本数据
    attributeFilter:[]      // 指定监听特定的属性
}
```

- `mo.disconnect();` 停止监听

在开始监听的 DOM 节点后, 变动的数据传入的构造函数的`cb`回调中, 这些数据称之为 MutationRecorder 的实例对象.

### 一个简单的例子.

```
let cb = function(mutations, observer){
    console.log(mutations, observer);
    console.log('======one time separator=======');
}
let mo = new MutationObserver(cb);

var monitor = document.querySelector('.monitor');
mo.observe(monitor, {
  attributes: true,
  characterData: true,
  childList: true,
  subtree: true,
  attributeOldValue: true,
  characterDataOldValue: true
});

//DOM change
monitor.className = "monitor quanlincong";
monitor.innerText = "quanlincong"
monitor.appendChild(document.createElement('div'));

mo.disconnect();
//=> 这样子, 在DOM change 操作完成之后. 结果
//
0: MutationRecord {type: "attributes", target: div.monitor.quanlincong, addedNodes: NodeList(0), removedNodes: NodeList(0), previousSibling: null, …}
1: MutationRecord {type: "childList", target: div.monitor.quanlincong, addedNodes: NodeList(1), removedNodes: NodeList(0), previousSibling: null, …}
2: MutationRecord {type: "childList", target: div.monitor.quanlincong, addedNodes: NodeList(1), removedNodes: NodeList(0), previousSibling: text, …}
```

### MutationRecord 对象

```
{
    addedNodes: NodeList []
    attributeName: "class"
    attributeNamespace: null
    nextSibling: null
    oldValue: "monitor"
    previousSibling: null
    removedNodes: NodeList []
    target: div.monitor.quanlincong
    type: "attributes"
    __proto__: MutationRecord
}
```

上面的数据, 是在修改了 class 之后, 以 MutationRecord 实例记录的数据.

- `type`, 表示 DOM 变动的数据类型
- `target`, 表示变动的目标节点
- `attributeName, oldValue, attributeNamespace`, 记录目标节点的变动数据, 原有数据, 属性的命名空间变化, 也就是`xmlns`属性(命名空间在 XML 里面发挥应有的作用, html 可以忽略)
- `removedNodes, addedNodes`, 记录目标节点变动的数据
- `previousSibling, nextSibling`,为目标节点的相邻节点数据.

# IntersectionObserver

IntersectionObserver 接口 (从属于 Intersection Observer API) 提供了一种异步观察目标元素与其祖先元素或顶级文档视窗(viewport)交叉状态的方法。祖先元素与视窗(viewport)被称为根(root)。

### 什么叫交叉状态?

祖先元素,viewport 也即是我们平常所说的浏览器的窗口大小, 可以调整浏览器的窗口改变视窗大小

目标元素, 即是我们监听的元素, 在页面滚动的过程中, 视窗是不会改变的, 目标元素随着滚动, 目标元素就会有 2 种状态, 进入视窗, 离开视窗
![image](https://user-images.githubusercontent.com/13718019/63900005-a4e21900-ca31-11e9-9339-7c9e7ace6c2c.png)

和`MutationObserver` 类似, 但是和监测 DOM 节点变化不同, 监测的监听的元素在当前的 viewport 的视窗下, 一些显示方面的信息, 比如视窗偏移量 x,y,交叉的比例等等. 这些的配置信息储存在一个[`IntersectionObserverEntry`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry)对象里面.

api 方面和`MutationObserver`类似,

### 构造函数

```
let io = new IntersectionObserver(cb, observer);
```

- `cb` 是触发的回调, 一般会触发两次。一次是目标元素刚刚进入视口（开始可见），另一次是完全离开视口（开始不可见）, cb 的参数是一个数组, 记录一个或多个目标对象的交叉状态.
- `observer`, 配置对象配置的参数有`threshold, root,rootMargin`
- - `threshold`定义的是触发的回调的阈值,可以定义为`0-1`之间,也即是`intersectionRatio`交叉比例的值
- - `root,rootMargin`, 则是定义根元素, 定义了根元素,那么`IntersectionObserver` 监测的就是根元素里面的滚动信息, 而`rootMargin`则是配置根元素的大小, 直接影响的是 rootBound 的大小.

### IntersectionObserver 的例子

```
let cb = function(entries){
    if (entries[0].intersectionRatio <= 0) return;
    console.log(entries);
}
let io = new IntersectionObserver(cb);

let target = document.querySelector(".qlc1");
let target = document.querySelector(".qlc2");
let target = document.querySelector(".qlc3");
io.observe(target1);
io.observe(target2);
io.observe(target3);

// 储存变化信息
let storeEntries = io.takeRecords();

// 停止监听某一个目标元素
io.unobserve(target1);

// 停止监听
io.disconnect();
```

构造函数中传入的 cb 函数, entries 为传入的交叉对象的数据, 是 IntersectionObserverEntry 的实例.

### IntersectionObserverEntry 对象

```
{
    boundingClientRect:  {x: 580.5, y: -190, width: 202, height: 202, top: -190, …}
    intersectionRatio: 0.05970003083348274
    intersectionRect:  {x: 580, y: 0, width: 203, height: 12, top: 0, …}
    isIntersecting: true
    isVisible: false
    rootBounds: null
    target: div.monitor
    time: 10365.040000062436
    __proto__: IntersectionObserverEntry
}
```

- `boundingClientRect`: 目标对象的举行区域的信息, 和通过`getBoundingClientRect`返回一样.都是描述目标对象距离视图左上角的信息.
- `intersectionRatio`: 进入举行区域是交叉区域的占比
- `intersectionRect`: 交叉区域的信息
- `isIntersecting`: 表示是否是进入视图
- `rootBounds`: 根元素的矩形区域的信息, 没有则为 null

# demo 地址

> https://codepen.io/quanlincong/pen/eYOWwKR?editors=1010

# 参考

> http://javascript.ruanyifeng.com/dom/mutationobserver.html > https://segmentfault.com/a/1190000017832686 > http://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html
