require.ensure([], () => {
  require('./src/css/defer.less');
});

require('./src/css/sync.less');
var a = 1;
console.log(a);
