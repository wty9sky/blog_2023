---
title: Koa源码分析&手写Koa
aside: true
editLink: false
lastUpdated: false
showComment: false
---

# Koa 源码分析&手写 Koa

## 启动 Koa 服务

Koa 的最简 demo

```javascript
const Koa = require("koa");
const app = new Koa(); //new 操作符，那么 koa 抛出的肯定是一个构造函数（function）或者类（class）
app.listen(8889, "0.0.0.0", () => {
  //Koa 实例调用了 listen 方法，并且接收了几个参数，如果先不管参数，那么 Koa 实例内肯定包含一个 listen 方法
  console.log(`启动成功8889`);
});
```

```javascript
class Koa {
  listen(...args) {}
}
```

启动成功后会调起一个服务

- node 的 http 模块的 createServer
  - createServer 得到一个 server 后也拥有一个 listen 方法，并且完全对应 demo 里 app.listen 的参数

Koa 的 listen 实现如下

```javascript
const http = require("http");
class Koa {
  listen(...args) {
    const server = http.createServer();
    return server.listen(...args);
  }
}
```

验证一下

```javascript
const Koa = require("./listen.js");
const app = new Koa();
app.listen(8889, "0.0.0.0", () => {
  console.log(`启动成功8889`);
});
```

## 洋葱模型

### 单个中间件

单个中间件的最简 demo

```javascript
const Koa = require("koa");
const app = new Koa();
app.use(() => {
  //可以推断出Koa类有一个use函数，并且接收一个函数参数
  console.log(1);
});

app.listen(8889, "0.0.0.0", () => {
  console.log(`启动成功8889`);
});
```

```javascript
class Koa {
  constructor() {
    // 初始化函数
    this.middleware = () => {}
  }
  use(cb) {
    // 保存函数
    this.middleware = cb
  },
  listen(...) {...}
}
```

可以假设 app.use 是一个注册器，注册了一个函数（中间件），当服务接收到请求后执行这个函数，而 http.createServer api 的参数接收一个函数来监听请求，正好满足我们的需求。

```javascript
// 源码层
const http = require("http");
class Koa {
  constructor() {
    // 初始化函数
    this.middleware = () => {};
  }
  // 一个注册器
  use(cb) {
    // 保存函数
    this.middleware = cb;
  }
  listen(...args) {
    // http.createServer接收一个函数参数，用于接收请求
    const server = http.createServer((req, res) => {
      // 接收到请求后执行use中注册的函数
      this.middleware();
      // 这一段是为了正常结束请求，暂时加上，可以先忽略
      res.end("1");
    });
    return server.listen(...args);
  }
}
```

```javascript
const Koa = require("./use.js");
const app = new Koa();
app.use(() => {
  console.log(1);
});
app.listen(8889, "0.0.0.0", () => {
  console.log(`启动成功8889`);
});
```

### 多个中间件

```javascript
const Koa = require("koa");
const app = new Koa();
app.use(function cb1(ctx, next) {
  console.log(1);
  next();
  console.log(5);
});

app
  .use(function cb2(ctx, next) {
    console.log(2);
    next();
    console.log(4);
  })
  .use(function cb3(ctx, next) {
    console.log(3);
  });

app.listen(8889, "0.0.0.0", () => {
  console.log(`启动成功8889`);
});
```

多次使用 app.use 注册中间件，中间件接收 ctx，next 两个参数，因为可以注册多个，需要用有一个地方存起来，比如用数组存储,可以推断出 use 内返回 this,next()会暂停执行当前中间件去执行下一个中间件，实际上就像 js 内的嵌套函数。

```javascript
class Koa {
  constructor() {
    // 老代码 this.middleware = () => {}
    // 保存中间件数组
    this.middleware = [];
  }
  // 注册器
  use(cb) {
    // 保存中间件
    this.middleware.push(cb);
    // 链式写法
    return this;
  }
}
```

```javascript
function cb1(next) {
  console.log(1);
  next(cb3);
  console.log(5);
}

function cb2(next) {
  console.log(2);
  next(cb3);
  console.log(4);
}
function cb3(next) {
  console.log(3);
}
cb1(cb2);
// 放控制台执行 -> 1 2 3 4 5
// cb1的next -> cb2
// cb2的next -> cb3
// cb3的next -> () => {} // 兼容
```

封装 use 函数

- 中间件注册的时机
  - 中间件的注册发生在 node 服务启动的时候
  - 执行是在请求进来时，所以请求进来的时候
  - 我们已经用数组保存了全部的中间件

```javascript
const middleware = [cb1, cb2, cb3];
// 执行cb1的时候，我们可以获取到cb2，并传给cb1
middleware[0](middleware[1]);
```

```javascript
const http = require("http");
class Koa {
  constructor() {
    // 初始化中间件数组，因为可能是多个
    this.middleware = [];
  }
  // 注册器
  use(cb) {
    // 保存所有注册的中间件
    this.middleware.push(cb);
    return this;
  }
  compose() {
    const dispatch = (i) => {
      // 从数组中取出中间件
      const fn = this.middleware[i];
      // 执行中间件，并传递执行下一个中间件的函数
      // dispatch(i + 1)会立即执行下一个中间件，所以用一个函数包起来，何时执行交给用户自己选择
      return fn(() => dispatch(i + 1));
    };
    // 执行第一个中间件
    return dispatch(0);
  }
  callback() {
    return (req, res) => {
      // 接收请求后执行compose
      this.compose();
      // 这一段是为了让Postman正常结束请求，暂时加上，可以先忽略
      res.end("111");
    };
  }
  listen(...args) {
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }
}
```

```javascript
const Koa = require("./useSync.js");
const app = new Koa();
app.use(function cb1(next) {
  console.log(1);
  next();
  console.log(5);
});

app
  .use(function cb2(next) {
    console.log(2);
    next();
    console.log(4);
  })
  .use(function cb3(next) {
    console.log(3);
  });

app.listen(8889, "0.0.0.0", () => {
  console.log(`启动成功8889`);
});
```

middleware 是一个数组
middleware 内每一项都是一个函数，为了代码更健壮，最好在启动阶段就进行强制校验。

运行时机：启动时，也就是执行 callback 的时候
需要 compose 提供的功能：校验 + 执行中间件。利用闭包，执行时校验并返回一个执行中间件的函数，callback 执行时立即执行 compose，请求进来时执行中间件函数

```javascript
const http = require("http");
class Koa {
  constructor() {
    this.middleware = [];
  }
  use(cb) {
    this.middleware.push(cb);
    return this;
  }
  compose(middleware) {
    // 校验中间件是数组
    if (!Array.isArray(middleware))
      throw new TypeError("Middleware stack must be an array!");
    // 校验每一项是函数
    for (const fn of middleware) {
      if (typeof fn !== "function")
        throw new TypeError("Middleware must be composed of functions!");
    }
    // 返回执行中间件的函数
    return () => {
      const dispatch = (i) => {
        // 从数组中取出中间件
        const fn = middleware[i];
        // 执行中间件，并传递执行下一个中间件的函数
        // 这里注意，dispatch(i + 1)会立即执行下一个中间件，所以用一个函数包起来，何时执行交给用户自己选择
        return fn(() => dispatch(i + 1));
      };
      // 执行第一个中间件
      return dispatch(0);
    };
  }
  callback() {
    // 启动时校验
    const fn = this.compose(this.middleware);
    return (req, res) => {
      // 请求进来时执行
      fn();
      res.end("111");
    };
  }
  listen(...args) {
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }
}
```

```javascript
const Koa = require("./useSyncValidator.js");
const app = new Koa();
app.use(111);

app.listen(8889, "0.0.0.0", () => {
  console.log(`启动成功8889`);
});
```

### 边界

Koa 的边界情况：

- Koa 中规定每个中间件只能执行一次 next
- 最后一个中间件也存在 next，执行 next 会报错。因为 i >= middleware.length，用 middleware[i]获取到的是 undefined

```javascript
compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }
  return () => {
    const dispatch = (i) => {
      const fn = middleware[i]
      return fn(() => dispatch(i + 1))
    }
    return dispatch(0)
  }
}
```

每一个 next 都是一个 dispatch(i + 1)，也就是说每次执行 next 的时候 i 都是相同的。
在 dispatch 外再维护一个索引，dispatch 执行的时候 index = i，再执行一次 dispatch 的时候判断 i 是不是小于等于 index，就可以判断当前 next 执行次数。

修改 compose 函数

```javascript
compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }
  return () => {
    let index = -1
    const dispatch = (i) => {
      if (i <= index) {
        return console.error(new Error('next() called multiple times'))
      }
      index = i
      const fn = middleware[i]
      return fn(() => dispatch(i + 1))
    }
    return dispatch(0)
  }
}
```

当最后一个 next 的时候，默认返回一个空函数就行

```javascript
compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }
  return () => {
    let index = -1
    const dispatch = (i) => {
      if (i <= index) {
        return console.error(new Error('next() called multiple times'))
      }
      index = i
      // 添加了这一段
      if (i >= middleware.length) return () => {}
      const fn = middleware[i]
      return fn(() => dispatch(i + 1))
    }
    return dispatch(0)
  }
}
```

```javascript
const Koa = require("./useSync.js");
const app = new Koa();
app.use(function cb1(next) {
  next();
  next();
  console.log(1);
});

app.use(function cb2(next) {
  next();
});

app.use(function cb3(next) {
  console.log(3);
  next();
});

app.listen(8889, "0.0.0.0", () => {
  console.log(`启动成功8889`);
});
```

### 异步

```javascript
const Koa = require("./useSync.js");
const app = new Koa();
app.use(async (next) => {
  console.log(1);
  await next();
  console.log(4);
});

app.use(async (next) => {
  console.log(2);
  await timeout();
  console.log(3);
});

function timeout() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}
```

底层原理就是基于 Promise 实现的自执行的 Generator 函数，async 最后会返回一个 Promise，await 等于 yield。

```javascript
const Koa = require("koa");
const app = new Koa();
app.use((ctx, next) => {
  console.log(1);
  next().then(() => {
    console.log(3);
  });
});

app.use((ctx, next) => {
  console.log(2);
});

app.listen(8889, "0.0.0.0", () => {
  console.log(`启动成功8889`);
});
```

最后一个中间件是一个普通函数，但是上一个中间件却用了 next().then()，也就是认为最后一个中间件是一个 Promise。
在 Koa 是被允许的，也就是 Koa 中兼容了普通函数和 Promise。

### Promise.resolve

```javascript
// 函数是Promise直接返回，不是就包一层Promise
Promise.resolve = function (fn) {
  if (fn instanceof Promise) {
    return fn;
  } else {
    return new Promise((resolve) => {
      resolve(fn);
    });
  }
};
```

所以再次修改 compose 函数

```javascript
compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }
  return () => {
    let index = -1
    const dispatch = (i) => {
      if (i <= index) {
        return console.error(new Error('next() called multiple times'))
      }
      index = i
      if (i >= middleware.length) return () => {}
      const fn = middleware[i]
      // 修改了这
      return Promise.resolve(fn(() => dispatch(i + 1)))
    }
    return dispatch(0)
  }
}
```

```javascript
const Koa = require("./useAsync.js");
const app = new Koa();
app.use((next) => {
  console.log(1);
  next().then(() => {
    console.log(3);
  });
});

app.use((next) => {
  return next().then(() => {
    console.log(2);
  });
});
```

```javascript
compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }
  return () => {
    let index = -1
    const dispatch = (i) => {
      if (i <= index) {
        return console.error(new Error('next() called multiple times'))
      }
      index = i
      // 就这里
      if (i >= middleware.length) return Promise.resolve()
      const fn = middleware[i]
      return Promise.resolve(fn(() => dispatch(i + 1)))
    }
    return dispatch(0)
  }
}
```

错误情况的兼容

```javascript
compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }
  return () => {
    let index = -1
    const dispatch = (i) => {
      // Promise.reject
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      if (i === middleware.length) return Promise.resolve()
      const fn = middleware[i]
      // try catch
      try{
        return Promise.resolve(fn(() => dispatch(i + 1)))
      } catch(err) {
        return Promise.reject(err)
      }
    }
    return dispatch(0)
  }
}
```

### ctx 封装

#### 基础结构

官方对 ctx 的定义，简单来说就是封装了 node 的 response 和 request，只简单的封装一下 ctx，request，response 和 body
首先，ctx 是一个对象，request 和 response 是 ctx 的一个属性并且也是一个对象。

```javascript
const ctx = {};

module.exports = ctx;
```

然后上述对 Context 的描述里说到，每个请求都会创建一个新的 Context，并在中间件中引用，也就是说每次 server 接收到请求后（callback 内返回的函数），都会根据 req 和 res 创建一个 Context。

ctx.request：根据 node 的 request 封装而来
ctx.response：根据 node 的 response 封装而来
ctx.req：node 的 request 对象
ctx.res：node 的 response 对象

中间件第一个参数为 Context

```javascript
const http = require("http");
const context = require("./src/context");
const request = require("./src/request");
const response = require("./src/response");
class Koa {
  constructor() {
    this.middleware = [];
    // 初始化ctx等，引用类型，避免引用
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }
  use(cb) {
    this.middleware.push(cb);
  }
  compose(middleware) {
    if (!Array.isArray(middleware))
      throw new TypeError("Middleware stack must be an array!");
    for (const fn of middleware) {
      if (typeof fn !== "function")
        throw new TypeError("Middleware must be composed of functions!");
    }
    // 接收ctx
    return (ctx) => {
      let index = -1;
      const dispatch = (i) => {
        if (i <= index)
          return Promise.reject(new Error("next() called multiple times"));
        index = i;
        if (i === middleware.length) return Promise.resolve();
        const fn = middleware[i];
        try {
          // 增加第一个参数为ctx
          return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
        } catch (err) {
          return Promise.reject(err);
        }
      };
      return dispatch(0);
    };
  }
  createContext(req, res) {
    // 避免引用
    const context = Object.create(this.context);
    const request = (context.request = Object.create(this.request));
    const response = (context.response = Object.create(this.response));
    // req，res为node原生request和response
    // 给request和response也赋值req,res是为了利用this获取到原生req,res，然后做二次封装
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    return context;
  }
  callback() {
    const fn = this.compose(this.middleware);
    return (req, res) => {
      // 每个请求都创建一个新的context
      const ctx = this.createContext(req, res);
      // 传入ctx
      fn(ctx);
      res.end("111");
    };
  }
  listen(...args) {
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }
}
```

```javascript
const Koa = require("./ctx.js");
const app = new Koa();
app.use((ctx, next) => {
  next();
});

app.use((ctx) => {
  console.log(ctx);
});

app.listen(8889, "0.0.0.0", () => {
  console.log(`启动成功8889`);
});
```

输出的 ctx 大概如下结构

```json
{
  request: {
    req: <node req>,
    res: <node res>
  },
  response: {
    req: <node req>,
    res: <node res>
  },
  req: <node req>,
  res: <node res>
}
```

### response & request

已经给 request 和 response 赋值了，所以可以对 req 和 res 做一层有用的封装

```javascript
module.exports = {
  // req: <node req>,
  // res: <node res>
  get header() {
    return this.req.headers
  },
  set header(val) {
    this.req.headers = val
  },
  get url() {
    return this.req.url
  },
  set url(val) {
    this.req.url = val
  }
  ... api内的方法
}
```

```javascript
module.exports = {
  // req: <node req>,
  // res: <node res>
  get header() {
    const { res } = this;
    return typeof res.getHeaders === "function"
      ? res.getHeaders()
      : res._headers || {}; // Node < 7.7
  },
  set header(val) {
    console.log(val, 222);
  },
  get body() {
    return this._body;
  },
  // 这里只是随便赋了个值，源码内做了很多判断为了适应不同的数据
  set body(val) {
    this._body = val;
  },
  //...
};
```

```javascript
const Koa = require("./ctx.js");
const app = new Koa();
app.use((ctx, next) => {
  next();
});

app.use((ctx) => {
  console.log(ctx.request.header, 2);
  console.log(ctx.request.url, 3);
});

app.listen(8889, "0.0.0.0", () => {
  console.log(`启动成功8889`);
});
```

### ctx 别名

这里就对 request 的 header 和 url 做一次实现，其它都同理。
源码内利用 delegates 包做了一层代理，其实也可以用 proxy 等，实现一下 request 的代理。

```javascript
const delegate = require("delegates");
const ctx = {};

// 将ctx.request的header和url属性代理到ctx下
delegate(ctx, "request").access("header").access("url");

// 代理response.body
delegate(ctx, "response").access("body");

module.exports = ctx;
```

```javascript
const Koa = require("./ctx.js");
const app = new Koa();
app.use((ctx, next) => {
  next();
});

app.use((ctx) => {
  console.log(ctx.request.url, 1);
  // 可以直接访问
  console.log(ctx.url, 2);
});

app.listen(8889, "0.0.0.0", () => {
  console.log(`启动成功8889`);
});
```

#### ctx.body

Koa 中给 ctx.body 赋值后，请求结束会识别 ctx.body 的类型然后返回对应的数据

```javascript
const Koa = require("koa");
const app = new Koa();
app.use((ctx, next) => {
  console.log(1);
  next();
  console.log(3);
});

app.use((ctx, next) => {
  console.log(2);
  ctx.body = "<html>111</html>";
});

app.listen(8889, "0.0.0.0", () => {
  console.log(`启动成功8889`);
});
// node koa.js -> 启动成功8889
// Postman请求0.0.0.0:8889 -> 1 2 3
```

只需要走完全部中间件的时候，判断 body 类型，然后使用 res.end 结束请求即可

```javascript
class Koa {
  callback() {
    const fn = this.compose(this.middleware);
    return (req, res) => {
      const ctx = this.createContext(req, res);
      // 中间件全部走完后执行
      fn(ctx).then(() => respond(ctx));
    };
  }
}

function respond(ctx) {
  const res = ctx.res;
  let body = ctx.body;
  // 判断body类型，自动设置Content-Type
  if (typeof body === "string") {
    res.setHeader(
      "Content-Type",
      /^\s*</.test(body) ? "text/html" : "text/plain"
    );
  }
  if (typeof body === "object" && ctx.body !== null) {
    res.setHeader("Content-Type", "application/json");
    body = JSON.stringify(body);
  }
  // 结束请求并返回body
  res.end(body);
}
```

```javascript
const Koa = require("./ctx.js");
const app = new Koa();
app.use((ctx, next) => {
  next();
});

app.use((ctx) => {
  ctx.body = {
    msg: "成功啦",
  };
});

app.listen(8889, "0.0.0.0", () => {
  console.log(`启动成功8889`);
});
```
