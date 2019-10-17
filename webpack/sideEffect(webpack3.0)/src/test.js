export class A {
  constructor() {
    this.name = 'AAAAAAAAAAAAAA';
  }
  getName() {
    return this.name;
  }
}

export class B {
  constructor({ val }) {
    this.name = 'constructor bbbbbbbbbbb';
    this.val = val;
  }
  getVal() {
    console.log(this.val);
    return this.val;
  }
}
