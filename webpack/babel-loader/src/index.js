let arr = Object.assign({ index: 0 });
let set = new Set();
set.add(arr);

var asyncFn = async function() {
  let res = await new Promise(resolve => {
    resolve(1);
  });
  return res;
};

asyncFn();

class A {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
  getRect() {
    return this.width * this.height;
  }
}
let rect = new A(120, 120);
let rectSum = rect.getRect();
console.log(rectSum);
