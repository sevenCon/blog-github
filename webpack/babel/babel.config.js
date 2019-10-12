const presets = [
  [
    '@babel/env',
    {
      modules: false,
      // targets: {
      //   ie: '9'
      //   firefox: '39',
      //   chrome: '39'
      // },
      useBuiltIns: 'usage',
      corejs: 2
    }
  ]
];

let plugins = [
  // [
  //   '@babel/plugin-transform-runtime',
  //   {
  //     absoluteRuntime: false,
  //     corejs: 3,
  //     helpers: true,
  //     regenerator: true,
  //     useESModules: true
  //   }
  // ]
];
module.exports = { presets, plugins };
