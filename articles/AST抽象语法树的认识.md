# 前言

AST 抽象语法的作用是发生在代码编译的过程, 而编译的过程可以归结为三个阶段.

> 传统编译的三个步骤

> 1,分词/词法分析(Tokenizing/Lexing) : 这个过程会将由字符组成的字符串分解成(对编程语言来说)有意义的代码块，这些代码块被称为词法单元(token)。例如，考虑程序 var a = 2;。这段程序通常会被分解成 为下面这些词法单元:var、a、=、2、;。空格是否会被当作词法单元，取决于空格在 这门语言中是否具有意义。

> 2,解析/语法分析(Parsing): 这个过程是将词法单元流(数组)转换成一个由元素逐级嵌套所组成的代表了程序语法结构的树。这个树被称为“抽象语法树”(Abstract Syntax Tree，AST)。var a = 2; 的抽象语法树中可能会有一个叫作 VariableDeclaration 的顶级节点，接下来是一个叫作 Identifier(它的值是 a)的子节点，以及一个叫作 AssignmentExpression 的子节点。AssignmentExpression 节点有一个叫作 NumericLiteral(它的值是 2)的子节点。

> 3,代码生成: 将 AST 转换为可执行代码的过程称被称为代码生成。这个过程与语言、目标平台等息息相关。抛开具体细节，简单来说就是有某种方法可以将 var a = 2; 的 AST 转化为一组机器指令，用来创建一个叫作 a 的变量(包括分配内存等)，并将一个值储存在 a 中。
> 说明: 此处只需记住第一步:分词/词法分析.第二步:解析/语法分析,得到抽象语法树(AST).第三步:代码生成,将抽象语法树转换为机器指令.

> 摘自《你不知道的 JavaScript(上)》

词法分词是为了进一步的语法分析,语法分析输出 AST 语法树, 输出 AST 同时也是为做语义分析.

这中间对应几个编译原理方面的术语

- 词法分析
- 语法分析
- 语义分析

其中词法分析, 和语法分析, 在上述已经有详细而且直观的描述, 接下来看看之后产生的语义分析过程.

语义分析是在语法分析之后, 语法分析输出的东西就是 AST 语法树, 这个抽象语法树, 在不同计算机语言中大同小异, 前端中, 一个非官方的官方的规范就是[ESTree](https://github.com/estree/estree), 这是一个社区标准, 理论上大家编写的 JavaScript 解析器, 语法分析器应该遵循这个标准.

那语义分析做的内容, 就是对 AST 树中的描述是否符合规范, 即是对

```
let a = 1;
```

以上的`VariableDeclaration`是否正确使用. 如果不正确, 则会返回错误提示. 就是语义分析的内容.

经过这几个阶段之后, 会在内存中生成字节码或者机器码.

> Chrome 为了在切换页面之前, 降低页面的反复渲染的开销,引入了字节码的缓存. 可以跳过下载, 解析编译生成字节码的过程. 可以节省大约 40%的开销.
> 字节码是 chrome 为了优化代码的运行效率而添加的一个步骤, 在其他的浏览器表现不一样.
> Safari 没有字节码的缓存,
> Firefox 使用 spiderMonkey 并不会缓存所有的内容.

# 抽象语法树的结构

基于社区的标准, 在前端生成语法树的解析工具库有很多,以`esprima`为例, 了解一下其大体的结构.

`let a = 1;`

[解析](https://esprima.org/demo/parse.html#)结构:

```
{
  "type": "Program",
  "body": [...],  // 抽象语法树的详细内容
  "sourceType": "script",
  "range": [ 0, 10 ],
  "loc": {
    "start": { "line": 1, "column": 0 },
    "end": { "line": 1, "column": 10 }
  }
}
```

### Node 节点

```
interface Node {
  type: string;
  range?: [number, number];
  loc?: SourceLocation;
}
```

Node 是抽象语法树所有继承的节点.

- `type` 表示节点的类型,
  更加详细的节点类型可以在[babylon](https://github.com/babel/babylon/blob/master/ast/spec.md)查看.
- `range`: 表示节点对应的起始位置,结束位置.
- `loc`: 源节点的位置信息,
  和 range 不同的是该节点原在代码中的源节点位置的 line,column.

### Program 节点

`type`为`params`的节点, 是树的根节点,会有 sourceType 的属性, 分为共 2 种类型.

- `module` 表示是一个 ES5 模块, body 可以是导出模块`ImportDeclaration`, `ImportDeclaration`, `Declaration | Statement`
- `script` 表示是一段普通的脚本代码,`Declaration | Statement`

```
interface Program <: Node {
    type: "Program";
    sourceType: 'script' | 'module';
    body: StatementListItem[] | ModuleItem[];
}

type StatementListItem = Declaration | Statement;
type ModuleItem = ImportDeclaration | ExportDeclaration | StatementListItem;
```

# 抽象语法树的节点类型

以上是根节点的节点类型,一种计算机程序包含的语法随着版本的迭代, 会不断的增加.
以`body` 为`ModuleItem` 的模块举例,
import, export 的语法包括一下几种

### ImportDeclaration 节点

对于导入语法, 有以下几种,

```
import foo from "./foo";
import {foo} from "./foo";
import * as a from './foo';
```

```
type ImportDeclaration {
    type: 'ImportDeclaration';
    specifiers: ImportSpecifier[];
    source: Literal;
}
```

导入语法节点只有一种节点类型`ImportDeclaration`, 但是基于导出的语法不同, 会有几种不通的`ImportSpecifier`属性值, 其中包括`'ImportSpecifier' | 'ImportDefaultSpecifier' | 'ImportNamespaceSpecifier'`, 这么做的原因也是因为`source` 的原因

`import * as a from './foo';`:

```
{
    "type": "ImportDeclaration",
    "specifiers": [
        {
            "type": "ImportNamespaceSpecifier",
            "local": {
                "type": "Identifier",
                "name": "a"
            }
        }
    ],
    "source": {
        "type": "Literal",
        "value": "./foo",
        "raw": "'./foo'"
    }
}
```

### ExportDeclaration 节点

```
interface ExportAllDeclaration {
    type: 'ExportAllDeclaration';
    source: Literal;
}
```

而导出节点则可以分为`ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration;`
分别对应

```
export * from './foo';
export default 'foo';
export const foo = 1;
```

其中`declaration`为`ExportNamedDeclaration`的属性节点, 会额外生成一个 Declarations 属性, 赘述变量声明的内容.

### Declarations

`declearation`节点的类型有
`VariableDeclaration | FunctionDeclaration | ClassDeclaration;` 三种类型, 分别是普通的变量声明, 函数声明, 和类声明. 详情请移步请移步[这里](https://github.com/babel/babylon/blob/master/ast/spec.md).

### Statements

语句语法节点, 则有许多种
`BlockStatement | BreakStatement | ContinueStatement | DebuggerStatement | DoWhileStatement | EmptyStatement | ExpressionStatement | ForStatement | ForInStatement | ForOfStatement | FunctionDeclaration | IfStatement | LabeledStatement | ReturnStatement | SwitchStatement | ThrowStatement | TryStatement | VariableDeclaration | WhileStatement | WithStatement;`
更多的语句相关的结构和具体的 demo,请移步[这里](https://github.com/babel/babylon/blob/master/ast/spec.md).

# 作用

说了这么多, 从 AST 抽象语法树的由来, 到社区标准的实现抽象语法树的结构, 到底除了可以让我们更加深刻的理解编译过程之外到底还有什么其他的作用?

- 压缩混淆
- 静态代码分析, 优化/提示
- IDE 语法提示

# 编辑和修改抽象语法树

而目前的词法分析器, 语法分析器就有 uglify, acorn, bablyon, typescript, esprima 等等若干种.
以`esprima`相关的库, 大概有那么几个以下几个工具库.

```
let esprima = require('esprima');
let estraverse = require('estraverse');
let escodegen = require('escodegen');
```

`esprima`, 生成抽象语法树.
`estraverse` 修改遍历和修改语法树.
`escodegen` 生成修改后代码.

代码的 demo 在[这里](https://github.com/sevenCon/blog-github/blob/master/AST/index.js)

# 参考

> https://segmentfault.com/a/1190000018532745#articleHeader7
