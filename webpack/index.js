import foo from './foo.js';
require.ensure([], () => {
  var bar = require('./bar.js');
  console.log(bar);
});
foo.print();
