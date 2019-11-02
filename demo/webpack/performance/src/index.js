import _ from 'lodash';
import Vue from 'vue';
import Router from 'vue-router';
import App from './app.vue';

import helloWorld from './pages/helloWorld.vue';
let routes = [
  {
    name: 'helloWorld',
    path: '/',
    component: helloWorld
  }
];
let router = new Router({
  mode: 'history',
  routes
});
Vue.use(Router);

class B {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
  sum() {
    return this.a + this.b;
  }
}

let a = new B(120, 2);
console.log(a.sum());

new Vue({
  el: '#app',
  router,
  render: h => h(App)
});
