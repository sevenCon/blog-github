# 前言

网格布局在众多布局方法中, 功能强大, 如 Bootstrap 的栅格化布局, 在浏览器中内置了, 而且突破了 12 个格子的限制, 还可以定义到每一个单元格的内容排列方式, 功能格外的强大.

# 开启 Grid 布局

容器, 就是开启 Grid Format Context, 也就是栅格化格式上下文的容器, 所有设置
`display:grid;`或者`display:inline-grid`属性的元素, 都是一个 GFC 的容器, **容器的子元素叫项目**, 容器的后代元素不能叫项目, 只能叫内容.

```
display:inline-grid;
display:grid;
```

`grid`布局, 默认是 block 级别的元素, 可以设置成`inline-grid`成内联元素.

<html>
<img src="https://user-images.githubusercontent.com/13718019/64179202-57cccf80-ce95-11e9-9f6c-74300b629f6a.png" width = "300">
</html>

# 设置容器的单元格

行/列, 也就是 row/column, 分别指的是开始布局的 x/y 轴方向, 行和列的交叉就变成了单元格.

<html>
<img src="https://user-images.githubusercontent.com/13718019/64179218-5d2a1a00-ce95-11e9-92be-f34851189b40.png" width = "300">
<img src="https://user-images.githubusercontent.com/13718019/64179231-63b89180-ce95-11e9-8c68-3670910583fa.png" width = "300">
</html>

### 单元格线条

在容器的 GFC 下, x/y 的布局方向交叉, 构成单元格, 而每一个单元格都是由左单元格线, 右单元格线, 上单元格线, 下单元格线构成的.

<html>
<img src="https://user-images.githubusercontent.com/13718019/64215165-10226400-cee6-11e9-89c3-57ee418cc9a9.png" width = "300">
</html>

### 设置每行/列的单元格的个数或宽度

方法(一)

```
    grid-template-rows: 100px 100px 100px;
    grid-template-columns: 100px 100px 100px;
```

可以直接指定固定宽度, 也可以百分比数值, 此外, 还可以指定每一行/列的单元格线名称

```
grid-template-rows: [r1] 100px [r2] 100px [r3] 100px [r4];
```

实际上, 和这 2 个货长得差不多还有一个叫`grid-template-areas`的属性, 用来定义区域的
名称的.

```
grid-template-areas: 'a a a' 'a d e' 'f i j';
```

上面则是定义了 9 个区域的名称情况.可以同名, 但是同名的区域必须是在同一整列或一整行. 定义了区域的名称之后, 可以直接使用`区域名称-start`, `区域名称-end`来引用单元格的起始网格线, 结束网格线.

方法(二)

```
    grid-template-rows: 1fr 1fr 1fr;
    grid-template-columns: 1fr 1fr 1fr;
```

指定`fr`关键字,`片段`的意思, 其实是一个比例单位, 代表着三列的网格比例为 1:1:1, 也可以是小数, 也可以是关键字`auto`, 代表自动填充, 也可以一个范围`minmax(100px, 1fr);`

方法(三)

```
    grid-template-rows: repeat(3, 100px);
    grid-template-columns: repeat(3, 100px);
```

另外可以利用 repeat 方法, 第一个参数是循环的次数, 第二个参数是网格的宽度, 如果是`grid-template-columns`的话, 就是网格的高度.

此外还有几个关键字,

- `auto-fill`, 尽可能的填充剩余的宽度/高度, 这常用在某些场景下,比如容器的宽度不固定的情况下, 需要和 repeat 共用`grid-template-rows: repeat(auto-fill, 100px);`

### 设置单元格的排列方向

默认单元格式以 row 的形式排列,一行结束后在另一行开始排.

```
grid-auto-flow: row;
或
grid-auto-flow: column;
```

<html>
<img src="https://user-images.githubusercontent.com/13718019/64217282-5fb95d80-ceef-11e9-8d94-1c13c9532d57.png" width = "600">
</html>

### 设置整体布局

设置整体布局,可以分为 2 个方向,行/列, 整个容器的在水平反向的对齐方式`justify-content`, 在垂直方向的`align-content`.

```
justify-content: start|center|end|stretch|space-around|space-between| space-evenly;
  align-content: start |center|end|stretch|space-around|space-between|space-evenly;

 或者
place-centent: <align-content> <justify-content>;
```

<html>
<img src="https://user-images.githubusercontent.com/13718019/64227302-85f1f400-cf15-11e9-815f-4445067263c3.png" width = "300">
<img src="https://user-images.githubusercontent.com/13718019/64227317-94d8a680-cf15-11e9-9adc-e88751183f88.png" width = "300">
<br/>
<img src="https://user-images.githubusercontent.com/13718019/64230860-8fcd2480-cf20-11e9-9c87-c859d7aa8a4e.png" width = "300">
<img src="https://user-images.githubusercontent.com/13718019/64230964-dd499180-cf20-11e9-893f-42713f1ae0bd.png" width = "300">
<img src="https://user-images.githubusercontent.com/13718019/64230772-4a105c00-cf20-11e9-9b9f-bb65283a2614.png" width = "300">
</html>

- start 和排列方向起始位置对齐
- end 和排列方向结束位置对齐
- center 居中对齐
- stretch 拉伸充满整个容器, 在没有指定大小的情况下
- space-around 行列周围平均分派空白区域
- space-between 行列之间平均分派空白区域, 其中第一个元素距离开始的距离, 和最后一个元素距离结束的距离为元素之间距离的一半
- space-evenly 行列之间平均分派空白区域, 其中行列之间距离, 第一个元素距离开始边界, 最后一个元素结束边界, 都相等.

### 设置单元格的内容居中

类似`table`布局的 td 元素的`text-align`, Grid 布局也可以设置单元格内容的居中布局方式.

```
  align-items: start | end | center | stretch;
justify-items: start | end | center | stretch;

或者
  place-items: <align-items> <justify-items>;
```

`align-items` 是设置内容在**水平**位置对齐的效果
`justify-items` 是设置内容在**垂直**位置对齐的效果

- start 单元格排列的起始位置对齐
- end 单元格排列的结束位置对齐
- center 居中对齐
- stretch 拉伸, 2 端对齐, 占满整个单元格宽度/高度(默认值)

<html>
<img src="https://user-images.githubusercontent.com/13718019/64217905-e53e0d00-cef1-11e9-95b2-ef5426902853.png" width = "300">
<img src="https://user-images.githubusercontent.com/13718019/64217933-ff77eb00-cef1-11e9-8092-652a98a1fc25.png" width = "300">
<br/>
</html>

### 间隙:grid-row-gap/grid-column-gap

间隙, 分为行间隙, `grid-row-gap`, 和列间隙`grid-column-gap`, 列之间的间隙, 这个间隙是可以设置的

```
grid-row-gap:10px;
grid-column-gap:10px;

或
grid-gap: 10px 10px;
```

`grid-gap` 是 `grid-row-gap` 和 `grid-column-gap`的缩写.

<html>
<img src="https://user-images.githubusercontent.com/13718019/64179323-8f3b7c00-ce95-11e9-95c3-4e60c15e302e.png" width = "300">
</html>

### 自动生成的单元格: grid-auto-rows, grid-auto-columns

浏览器为了渲染特定未知的网格, 会自动的生成填补的网格, 这个时候,如果需要定义自动的网格信息. 可以用`grid-auto-rows`;

```
grid-auto-rows: 100px;
grid-auto-columns: 100px;
```

`grid-auto-rows`, `grid-auto-columns` 和`grid-template-rows`,`grid-template-colummns`的属性值一样.

### 容器属性小结

以上所有的属性, 都是在容器上定义的, 属于容器属性. 简单的概括就是,

- 容器上可以设置单元格的大小,数量`grid-template-column`,`grid-template-rows`,
- 整体的对齐方式`place-centent`, `justify-content`,`align-content`,
- 每一个单元格内容的对齐方式`place-items`,`justify-items`,`align-items`,
- 单元格之间的间隙`grid-gap`, `grid-column-gap`,`grid-row-gap`
- 单元格的排列方向`grid-auto-flow`
- 自动生成单元格的信息`grid-auto-rows`,`grid-auto-columns`
- 定义单元格的区域名称 `grid-template-areas`

# 项目属性部分

以上是容器上可以设置的属性信息, 为了达到更加精细, 可以设置特定单元格的信息, 还可以在项目上去设置单元格的信息.

### 设置特定的单元格的位置/大小 `grid-column-start`,`grid-column-end`

```
grid-column-start: 列开始的网格线位置;
grid-column-end: 列结束的网格线位置;

grid-row-start: 行开始的网格线位置;
grid-row-end: 行结束的网格线位置;
```

> 其中`列开始的网格线位置,行开始的网格线位置`等等的属性值是具体的数字, 表示网格线条的位置, 当超过当前已有的网格线, 则浏览器会自动生成网格.
> 此外, 还可以是在`grid-template-areas`,`grid-template-rows`,`grid-template-columns`定义的网格线名称.

<html>
<img src='https://user-images.githubusercontent.com/13718019/64265706-f7599300-cf65-11e9-940b-a3f0418d9603.png' width='600'/>
</html>

`grid-column`是`grid-column-start`,`grid-column-end`的简写,
`grid-row` 是是`grid-row-start`,`grid-row-end`的简写.

```
grid-column: <start>/<end>;
grid-row: <start>/<end>;
```

中间以斜杠进行连接, 同时还可以用`span` 关键字进行表示从开始位置跨域多少个单元格

```
grid-column: 1 / span 2;

等同于
grid-column: 1 / 3;

等同于
grid-column-start: 1
grid-column-start: 3;
```

### 指定某个单元格的位置/大小 grid-area

指定具体的网格放置的区域

```
grid-area: a;

或者
grid-area: <row-start> / <column-start> / <row-end> / <column-end>;
```

也可以是又网格线名称围起来的区域;

<html>
<img src='https://user-images.githubusercontent.com/13718019/64267067-4ef8fe00-cf68-11e9-95fe-17f14ce458ce.png' width='600'/>
</html>

### 指定某个单元的对齐方式: justify-self 和 align-self

```
justify-self: start | center | end | stretch ;
  align-self: start | center | end | stretch ;
```

和项目属性一样, 只是设置在单元格上

<html>
<img src="https://user-images.githubusercontent.com/13718019/64267586-3ccb8f80-cf69-11e9-8209-46875bc2b8ea.png" width=600 />
</html>

### 小结

- 项目属性大部分的作用都是覆盖容器属性的布局, 所以在功能上是重复的, 只是设置的对象是针对到具体的单元格

# 参考

> [CSS Grid 网格布局教程(阮一峰)](http://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)

> [A Complete Guide to Grid(by Chris House)](https://css-tricks.com/snippets/css/complete-guide-grid/)

> [How to Build an Off-Canvas Navigation With CSS Grid(by Ian Yates)](https://webdesign.tutsplus.com/tutorials/how-to-build-an-off-canvas-navigation-with-css-grid--cms-28191)

> [
> Introduction to the CSS Grid Layout With Examples(by Dogacan Bilgili)](https://code.tutsplus.com/tutorials/introduction-to-css-grid-layout-with-examples--cms-25392)
