## 前言
Cookie（复数形態Cookies），又稱為「小甜餅」，指某些网站为了辨别用户身份而储存在用户本地终端（Client Side）上的数据（通常经过加密）。目前使用最广泛的 Cookie标准却不是RFC中定义的任何一个，而是在网景公司制定的标准上进行扩展后的产物。

HTTP协议标准并没有Cookie这一项,Cookie作为HTTP无状态协议的补充, 为网站的请求提供了极大的便利. 但随之而来的, Cookie也存在安全, 及其他的一些问题.

#### 局限性
- Cookie的传输是在header里面的, 这样每个当前域名下的请求都会携带, 这样极大的加重传输的成本. 
- 浏览器和浏览器之间不共享Cookie.
- 安全问题, Cookie不安全, 这恐怕是受限制于HTTP整个协议的不安全, HTTP在网络之中以明文的形式来传输, 容易受拦截篡改.
- 隐私问题, Cookie 因为可以指定domain, 所以一些网站为了统计用户浏览器记录, 会为特定的domain(比如电商网站)写入一些cookie, 这样浏览过之后, 在cookie上就有记录, 这样电商网站就可以根据cookie的记录, 推送特定商品.

#### 一些值得注意的
- Cookie空间大小限制在4k左右
- Expires 不设置, 则默认是session 的形式, 关闭浏览器的时候自动清除, 如果设置, 则是是一个GMT时间, 
- 设置Max-Age, 负值/0, 该Cookie会立即被清除, 但旧版的浏览器如,IE6/7/8 不支持, 所以删除还是乖乖的用Expires吧.

## cookie 的一些选项
- `expires`: GMT time, 设置的话调用(new Date()).toUTCString()方法就可以格式化了.
- `max-age`: 设置过期的时间毫秒,老浏览器不支持(ie6,7,8)
- domain 规定
- `http-only`:`true` or `fasle` 老实说,那么为什么要叫http-only呢? 因为设置了不能通过代码, 比如document.cookie 的方法去获取, 只有通过http协议头, `Set-Cookie`本身可以读取和修改的权利. 所以说 `http-only:false;` 还是有一定的用处的.起码在XSS的时候, 不能通过js来读取cookie.
- `secure`:  `true` or `false`, 设置了意味着只有https 的情况下才会携带cookie发送请求. 非https 的协议不携带Cookie信息;
- `samesite`: `strict` or `Lax`, 严格 or 宽松, `Strict` 模式下, 当从本站跳转到第三方域名的时候, 不会携带第三方的cookie, 当本站被内嵌iframe加载的时候不会携带cookie, 而`Lax` 的情况下, 当从本站跳转到第三方域名的时候, 会携带cookie, 而本站被内嵌iframe加载的时候, 不会携带cookie
```
function setCookie(opt) {
    if (opt.samesite) {
        document.cookie = 'bar2=carry;'; // a标签调转都会携带, iframe加载会携带
        document.cookie = 'bar3=lax;SameSite=Lax'; //a标签调转的时候携带, iframe 加载的时候不会携带
        document.cookie = 'bar=nocarry;SameSite=Strict;'; // a标签调转时候,不会携带, iframe 加载的时候不会携带
    }
}
setCookie({ samesite: 1 });
```

## SameSite:Strict;
#### iframe加载的第三方站点, 只会加载没有设置`SameSite`值的cookie
![image](https://user-images.githubusercontent.com/13718019/62627055-3f7f9880-b95b-11e9-8896-cebb5ab8683f.png)
![image](https://user-images.githubusercontent.com/13718019/62627166-6b028300-b95b-11e9-84a4-9dd4eca8e29c.png)

#### 从a标签调转过去第三方站点的, 会携带`SameSite:Lax;`的第三方的Cookie
![image](https://user-images.githubusercontent.com/13718019/62627347-d2b8ce00-b95b-11e9-99c0-97398d2c5631.png)

> 备注, 因为Cookie存在本地, 那么就有个问题,如果本地的时间不准确,或者本地时间被修改, 那么就极有可能会bug,所以在编程的时候, 需要考虑进去. 而且domain只认域名, 不认识端口,协议, 也就是http设置的cookie, 在https也是可以获取的, 在忽略`httpOnly`, `secure`的情况下.

## 参考
> https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#SameSite_cookies

> 本文github地址:[认识一下Cookie的几个的配置](https://github.com/sevenCon/blog-github/issues/8), 如有侵权或其他问题, 请issue留言, 感谢.
