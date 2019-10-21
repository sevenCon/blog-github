// module -> [module1-1.js,module1-2.js]
import module3 from './module3.js';

// import moduleEval from './module-eval.js';
// import cjs from './module-export.js';

// module1-1.js合并, module1-2.js不合并, 因为module1-1.js还被lazy.js引用
console.log(module3);

// console.log(moduleEval()); // eval方法, 不合并
// console.log(cjs); // 非 ES Module引入不合并

// 不合并
// lazy.js -> [module1-1.js]
import('./lazy').then(function(lazy) {
  console.log(lazy.a);
});
