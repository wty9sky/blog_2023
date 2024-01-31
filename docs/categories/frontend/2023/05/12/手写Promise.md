---
title: 手写Promise
aside: true
editLink: false
lastUpdated: false
showComment: false
---

# 手写 Promise

## 关于 Promise

promise 是异步操作的一个解决方案，相对于传统的回调函数来讲更合理，可以避免回调地狱。
promise 类似于一个容器，获取异步操作的消息，存储异步操作的结果，为各种异步操作提供了统一的 API。
promise 在 ES6 中成为语言标准，原生提供了 Promise 的对象。

## promise 的优缺点

### 优点

● 对象的状态不受外界的影响，有三种状态，pending（进行中）、fulfilled（已成功）、rejected（已失败），只有异步操作的结果可以决定当前是哪种状态。
● 一旦状态更改就不会再改变，任何时候都可以得到这个结果。promise 的状态变化只有两种可能：从 pending 到 fulfilled、从 pending 到 rejected，当改变已发生，后续无论添加什么样的回调函数，都会返回同样的结果。
● promise 对象可以将异步操作通过链式调用的方式以同步操作的效果运行，避免回调地狱，让代码更直观。
● promise 对象提供统一的接口，操作异步操作更容易。

### 缺点

● 无法取消 promise，一旦新建就会立即执行，不能中途取消。
● 若无回调函数，内部抛出的错误无法反应到外部。
● 处于 pending 状态时，无法得知当前处于哪一个状态。

## 使用 promise

new Promise()创建 promise 对象

```js
let promise = new Promise(function(resolve,reject){
  if(/*异步操作成功*/) {
  resolve(value) // 成功调用resolve 往下传递参数 且只接受一个参数
  }else {
  reject(error)  // 失败调用reject  往下传递参数 且只接受一个参数
  }
});

promise.then(res=>{
  console.log(res)
}).catch(err=>{
  console.log(err)
})
```

Promise.resolve/Promise.reject 创建 promise 对象
有时需要将现有对象转为 Promise 对象，Promise.resolve()、Promise.reject()方法就起到这个作用。
Promise.resolve()方法返回一个新的 Promise 实例，该实例的状态为 resolved。
Promise.reject()方法返回一个新的 Promise 实例，该实例的状态为 rejected。

● 如果参数是一个 promise 实例，将不做任何修改，原封不动的返回这个实例。
● 如果参数是具有 then()方法的对象，会将这个对象转为 promise 对象，然后立即执行 then()方法。
● 如果参数不是对象或者不是具有 then()方法的对象，则返回一个新的 promise 对象，状态为 resolved/rejected。
● 如果不带有任何参数，则直接返回一个 resolved/rejected 状态的 promise 对象。

## Promise 的其他方法

Promise.prototype.then()
then 方法返回的是一个新的 Promise 实例（注意，不是原来那个 Promise 实例）。因此可以采用链式写法，即 then 方法后面再调用另一个 then 方法。

```js
promise
  .then(function (res) {
    // ...
  })
  .then(function (res) {});
```

Promise.prototype.catch()
Promise.prototype.catch()方法是.then(null, rejection)或.then(undefined, rejection)的别名，用于指定发生错误时的回调函数。

```js
promise
  .then(function (posts) {
    // ...
  })
  .catch(function (error) {});
```

Promise.prototype.finally()
finally()方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。

```js
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```

```js
promise.finally(() => {
  // 语句
});

// 等同于
promise.then(
  (result) => {
    // 语句
    return result;
  },
  (error) => {
    // 语句
    throw error;
  }
);
```

Promise.all()
Promise.all()方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。
const promise = Promise.all([promise1, promise2, promise3]);
该方法只要有一个 promise 方法返回 rejected 状态，则直接返回 rejected 状态，返回第一个返回 rejected 状态的实例的回调结果。

Promise.race()
Promise.race()方法是将多个 Promise 实例，包装成一个新的 Promise 实例。
const promise = Promise.race([promise1, promise2, promise3]);
上面代码中，只要有一个 promise 实例率先改变状态，就返回率先改变状态的实例的回调结果。

Promise.allSettled()
Promise.allSettled()方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。
const promise = Promise.allSettled([promise1, promise2, promise3]);
该方法等待全部 promise 实例改变 resolved/rejected 状态后，输出所有实例的回调结果。

## 手写 Promise 和相关函数

### 手写 Promise

手写思路

1. Promise 是一个类, 类中需要传入一个 executor 执行器
2. promise 内部会提供两个方法，这两个方法会传给用户,可以更改 promise 的状态
3. promise 有三个状态：等待（PENDING)、成功（RESOLVED）（返回成功的结果或 undefined）、失败（REJECTED）（返回失败的原因或 undefined）
4. promise 只会从等待变为成功或者从等待变为失败。
5. 每个 promise 实例上都有一个 then 方法， 分别是成功和失败的回调。

```js
const PENDING = "PENDING";
const RESOLVED = "RESOLVED";
const REJECTED = "REJECTED";

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    return reject(
      new TypeError(
        "[TypeError: Chaining cycle detected for promise #<Promise>]----"
      )
    );
  }
  let called;
  if ((typeof x === "object" && x != null) || typeof x === "function") {
    try {
      let then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}

class Promise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.error = undefined;
    this.fulfilledList = [];
    this.rejectedList = [];
    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (err) {
      this.reject(err);
    }
  }

  resolve(value) {
    if (value instanceof Promise) {
      return value.then(resolve, reject);
    }

    setTimeout(() => {
      if (this.status === PENDING) {
        this.status = RESOLVED;
        this.value = value;
        this.fulfilledList.forEach((cb) => cb(this.value));
      }
    }, 0);
  }

  reject(err) {
    setTimeout(() => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.error = err;
        this.rejectedList.forEach((cb) => cb(this.error));
      }
    }, 0);
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (err) => {
            throw err;
          };
    let promise = new Promise((resolve, reject) => {
      if (this.status === RESOLVED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        }, 0);
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.error);
            resolvePromise(promise, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        }, 0);
      }
      if (this.status === PENDING) {
        this.fulfilledList.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          }, 0);
        });
        this.rejectedList.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.error);
              resolvePromise(promise, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          }, 0);
        });
      }
    });
    return promise;
  }

  catch(errCallback) {
    return this.then(null, errCallback);
  }
}

let promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    //reject('xxx')
    resolve("xxx");
  }, 1000);
})
  .then(
    (res) => {
      console.log("成功的结果 1", res);
      return res;
    },
    (error) => {
      console.log("失败的结果 1", error);
    }
  )
  .then(
    (res) => {
      console.log("成功的结果 2", res);
    },
    (error) => {
      console.log("失败的结果 2", error);
    }
  );
```

### 手写 Promise.all

手写思路

1. 接受一个参数，该参数是含有 promise 实例的数组
2. 遍历传入的参数，用 promise.resolve 将参数转为 promise 对象
3. 设置 flag，每当一个 promise 对象回调成功，flag+1，然后将回调成功结果添加到回调结果数组中。
4. 当所有 promise 对象回调成功，返回回调结果数组，只要有一个 promise 对象回调失败，则触发失败状态，该回调失败的 promise 对象的错误信息将作为 promise.all 的错误信息。

```js
function AllPromise(promiseArray) {
  return new Promise((resolve, reject) => {
    if (!promiseArray instanceof Array) {
      throw new Error("参数类型应为数组");
    }
    let resolveResult = [];
    let flag = 0;
    let promiseCount = promiseArray.length;

    for (let i in promiseArray) {
      Promise.resolve(
        promiseArray[i].then(
          (val) => {
            flag++;
            //resolveResult.push(val)
            //不使用push的原因：先完成的先push，后完成的后push，会导致返回的数组与promiseArray数组的顺序不同，因此不能使用push
            resolveResult[i] = val;
            if (flag == promiseCount) {
              return resolve(resolveResult);
            }
          },
          (err) => {
            return reject(err);
          }
        )
      );
    }
  });
}

let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 3000);
});

let promise2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(2);
  }, 1000);
});

let promise3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(3);
  }, 2000);
});

let promise4 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(4);
  }, 6000);
});

let promise5 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(5);
  }, 4000);
});

let promiseArray = [promise1, promise2, promise3, promise4, promise5];

AllPromise(promiseArray).then((res) => console.log(res));
```

### 手写 Promise.allSettled

手写思路

1. 接受一个参数，该参数是含有 promise 实例的数组
2. 遍历传入的参数，用 promise.resolve 将参数转为 promise 对象
3. 无论 promise 对象回调成功还是失败，都将返回结果存储到回调结果数组中。
4. 设置 flag，每当一个 promise 对象回调成功或者失败，在 finally 阶段 flag+1，然后将回调结果添加到回调结果数组中，直到 flag 与传入的 promise 实例数组长度相同，则将带有所有回调结果的回调结果数组输出。

```js
function allSettledPromise(promiseArray) {
  return new Promise((resolve, reject) => {
    if (!promiseArray instanceof Array) {
      throw new Error("参数类型应为数组");
    }
    let resolveResult = [];
    let flag = 0;
    let promiseCount = promiseArray.length;

    for (let i in promiseArray) {
      Promise.resolve(
        promiseArray[i]
          .then((val) => {
            resolveResult[i] = val;
          })
          .catch((err) => {
            resolveResult[i] = err;
          })
          .finally((res) => {
            flag++;
            if (flag == promiseCount) {
              return resolve(resolveResult);
            }
          })
      );
    }
  });
}

let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 3000);
});

let promise2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(2);
  }, 1000);
});

let promise3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(3);
  }, 2000);
});

let promise4 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject("错误");
  }, 6000);
});

let promise5 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(5);
  }, 4000);
});

let promiseArray = [promise1, promise2, promise3, promise4, promise5];

allSettledPromise(promiseArray).then((res) => console.log(res));
// 返回结果：[ 1, 2, 3, '错误', 5 ]
```
