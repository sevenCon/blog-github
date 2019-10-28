class A {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
}

debugger;
throw Error('test source map locate');
let a = new A(1, 2);
console.log(a.a);
