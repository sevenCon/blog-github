let fs = require('fs');
let Terser = require('Terser');
let path = require('path');

let code = fs.readFileSync(path.resolve('./src/index.js'), 'utf8');
var result = Terser.minify(
  { 'index.js': code },
  {
    compress: {
      mangle: true,
      side_effects: false
    },
    sourceMap: {
      filename: 'out.js',
      url: 'out.js.map'
    }
  }
);

console.log(result);
