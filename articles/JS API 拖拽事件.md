# 前言

因为公司最近准备上一个业务上的搭建系统, 可能需要用到一些拖拽方面的交互. 所以本着笨鸟先飞的原则, 先对拖拽上有个整体的认识. 学习一些基本的概念

# 说明

关于拖拽, 一个可能的使用场景是这样子的, 用户可以使用鼠标选择可拖动元素，将元素拖动到可放置元素，并通过释放鼠标按钮来放置这些元素。可拖动元素的一个半透明表示在拖动操作期间跟随鼠标指针.

这中间涉及到 2 个主要的东西, 1.交互怎么响应递, 2.拖动的数据怎么传

关于拖拽的事件有以下事件:

```
drag	    ondrag	    当拖动元素或选中的文本时触发。
dragstart	ondragstart	当用户开始拖动一个元素或选中的文本时触发（见开始拖动操作）
dragend	    ondragend	当拖拽操作结束时触发 (比如松开鼠标按键或敲“Esc”键). (见结束拖拽)
dragenter	ondragenter	当拖动元素或选中的文本到一个可释放目标时触发（见 指定释放目标）。
dragexit	ondragexit	当元素变得不再是拖动操作的选中目标时触发。
dragleave	ondragleave	当拖动元素或选中的文本离开一个可释放目标时触发。
。

drop	    ondrop	    当元素或选中的文本在可释放目标上被释放时触发（见执行释放）。
dragover	ondragover	当元素或选中的文本被拖到一个可释放目标上时触发（每100毫秒触发一次）。
```

以上的事件可以简单归类

- 拖拽元素事件, 指 drap, 可以拖拽的元素监听的事件
- 目标元素事件, 指 drop, 可以放下拖拽的元素监听的事件

### 拖拽元素事件

`drag`,`dragexit`,`dragstart`,`dragleave`,`dragenter`,`dragend`

拖拽元素从原位置拖拽依次调用过程

- `dragstart` -> `dragenter` -> `dragleave` 三个事件依次触发, 说明拖拽元素正脱离原位置.

- `drag`事件会在拖拽的过程中不断触发

### 目标元素事件

`dragover`, `drop`

- `dragover`当拖动事件在目标之上时, 每 100ms 触发一次
- `drop` 在目标元素区域下放下拖拽元素, 常常在这个事件中处理拖拽完成的业务. `dragend`是指结束拖拽, 在其他区域放下拖拽元素也会触发`dragend`事件.

### 具体的执行过程

![image](https://user-images.githubusercontent.com/13718019/64060496-fc35e400-cbff-11e9-8f02-2391618a70f0.png)

> ondrag 没有列进去, 因为在每个阶段后会有 drap 事件的触发, 而 dragexit 则没有触发.

### 注意

- 一个元素要想被拖拽, 必须定义 draggable 属性
- 常常还需要在目标元素上定义`dragover`, `drop`2 个事件. 第一个是在目标元素移动的事件, 第二个是在目标元素上放下的效果. 都需要在触发的事件中取消浏览器的默认行为,`ev.preventDefault();`, 来取消浏览器的指针事件和触点事件.

```
<p  id="source"
    ondragstart="dragstart_handler(event);"
    draggable="true">
    选择
</p>

<div
    id="target"
    ondrop="drop_handler(event);"
    ondragover="dragover_handler(event);">
    拖放区域
</div>
```

# 拖拽元素的数据传递

`dataTransfer`对象是在事件对象`event`里面的一个属性, 在进行拖拽的时候自动初始化,用来定义,拖拽元素本身的拖拽类型, 当前的拖拽内容, 携带的拖拽数据等等.

**dataTransfer 是挂载 event 对象上的一个属性**, 可以在触发事件的回调用获取和设置数据.

### 下面是一些常见的数据类型

- text/plain 拖拽文本
- text/uri-list 拖拽链接
- text/html 拖拽 html 节点

根据不同的拖拽类型, 设置不同的传输类型数据, 当然拖拽的类型是一个内容的类型声明,我们也可以自己定义类型.

```
event.dataTransfer.setData("text/plain", 'quanlincong.com#qlc');

event.dataTransfer.setData("x.bookmark", 'quanlincong.com#qlc');
```

都是允许的, 但为了和规范保持一致, 最好使用 mimeType 的类型命名方式.

```
function dragstart_handler(event){
    event.dataTransfer.setData("text/uri-list", 'https://quanlincong.com');
    event.dataTransfer.setData("text/plain", 'qlc');
}

function drop_handler(event){
    console.log(event.dataTransfer.getData("text/uri-list")
}
```

### 利用 dataTransferItem 数据传递

除了利用 `event.dataTransfer.getData`, `event.dataTransfer.setData`, 储存和传递数据之外,还有一种方法就是利用`event.dataTransferItem`,也就是挂载到`event.dataTransfer`上的一个属性`items`,这是一个`dataTransferItemList`, 里面没有一个元素都是`dataTransferItem`的对象. 和`dataTransferItemList`相对应的还有一个`types`, 对应`dataTransferItemList`里面的数据类型.

```
function dragstart_handler(ev) {
  var dti = ev.dataTransfer.items;
  if(dti) dti.add(ev.target.id, "text/plain");  // 需要考虑浏览器兼容
}

function drop_handler(ev) {
  ev.preventDefault();
  var dti = ev.dataTransfer.items;
  // 异步获取`DataTransferItem`数据
  dti && dti.getAsString((id)=>{
      console.log(id);
  })
}
```

### dataTransferItemList 对象的相关 API

可以使用的 API 就 4 个

- event.items.add('xx', 'text/plain') , 添加数据
- event.items.remove(0), 删除索引的数据
- event.items.clear(), 清空数据
- event.items.DataTransferItem(0), 获取数据

一个注意的地方就是,需要浏览浏览器的兼容性, event.items 的方法需要在 IE12 才支持.
使用条件苛刻.

![image](https://user-images.githubusercontent.com/13718019/64071467-4923c400-ccad-11e9-8077-6d5aba8006aa.png)

# 关于拖放的操作提示

在进行拖拽的时候,常常需要提示该拖拽的拖动效果, 拖拽至目标文件的时候, 提示是否可以放下, 这些都可以通过在鼠标的右上角图标提示.

### dataTransfer.dropEffect

当一个元素拖拽至目标元素上面, 常常需要提示该操作是否有效, 这时需要设置提示类型, 是拷贝,移动还是链接等等.

- copy 表明被拖动的数据将从它原本的位置拷贝到目标的位置。
- move 表明被拖动的数据将被移动。
- link 表明在拖动源位置和目标位置之间将会创建一些关系表格或是连接。

在拖拽完成之后, 会在源节点上触发 dropend 事件, 无论拖拽成功或失败, 都会触发, 可以通过检查`dataTransfer.dropEffect`, 判断是否成功拖拽成功.

在拖拽至目标元素上提示操作指引, 通常在 dragover 事件中进行设置

### dataTransfer.effectAllowed

表示拖拽元素即将要进行的操作, 可能有以下几种的值, 拷贝到目标元素, 移动到目标元素, 链接到目标元素.

- none
- copy 拷贝。
- move 移动
- link 链接
- uninitialized 未初始化
- all 拷贝, 链接或移动
- linkMove 链接或移动
- copyLink 链接或拷贝
- copyMove 拷贝或移动

在开始拖拽时提示, 通常在 dragstart 的事件中进行设置.

### 自定义拖拽的操作提示图像

对于现有的操作提示, 如果不满意, 那么可以自己定义操作提示的图像.

```
dragstartHandler(ev) {
    console.log('dragstartHandler');
    var img = new Image();
    img.src = 'img.png';
    ev.dataTransfer.setDragImage(img, 10, 10);
    ev.dataTransfer.setData('text1', ev.target.id);
}
```

# 最后总结一下 dataTransfer 对象的一些属性

- `dropEffect`, 在目标区域操作提示
- `effectAllowed`, 拖拽元素的操作提示
- `files`, 系统文件拖拽
- `items`: DataTransferItemList, 利用 DataTransferItem 对象传递参数, 如果要用, 需要考虑兼容
- `types`: [], DataTransferItemList 对应的数据类型 type, 如果要用, 需要考虑兼容

`items, types`, 这 2 个属性的使用还是需要慎重.

# 参考

> https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_Drag_and_Drop_API
> 本人的 github 地址为[JS API 拖拽事件](https://github.com/sevenCon/blog-github/issues/16), 如有侵权或其他问题, 请 issue 留言,感谢!
