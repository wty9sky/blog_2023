---
title: Vue3源码解析-Proxy
aside: true
editLink: false
lastUpdated: false
showComment: false
showDate: false
---

## Vue2 中的 双向绑定

- 在 Vue2 中使用的是 Object.defineProperty()
- Object.defineProperty() 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象
- defineProperty 只能针对修改对象上的属性
- 用法：Object.defineProperty(obj, prop, descriptor)
  - obj 要定义属性的对象
  - prop 要定义或修改的属性的名称或 Symbol
  - descriptor 要定义或修改的属性描述符

```javascript
const obj = {};
Object.defineProperty(obj, "a", {
  value: 1,
  writable: false, // 是否可写
  configurable: false, // 是否可配置
  enumerable: false, // 是否可枚举
});

// 上面给了三个 false, 下面的相关操作就很容易理解了
obj.a = 2; // 无效
delete obj.a; // 无效
for (key in obj) {
  console.log(key); // 无效
}
```

```javascript
Object.defineProperty(obj, key, {
enumerable: true,
configurable: true,
get: function reactiveGetter () {
// ...
if (Dep.target) {
// 收集依赖
dep.depend()
}
return value
},
set: function reactiveSetter (newVal) {
// ...
// 通知视图更新
dep.notify()
}
})
对象的变异
以下的方法为什么不更新

data () {
return {
obj: {
a: 1
}
}
}

methods: {
update () {
this.obj.b = 2
}
}
```

- 在 created 时

  - 我们进行了 data init 方法，会对 data 绑定一个观察者 Observer
  - data 中的字段更新都会通知依赖收集器 Dep 触发视图更新
    - 当我们使用 defineProperty 这个方法只是针对对象的属性进行监听，但是新增属性 b 是在之后添加的，没有相应的 Observer
    - 解决方法
      - vue 全局 set 方法本质就是手动为新增属性添加 Observer 方法

```javascript
function set(target: Array<any> | Object, key: any, val: any): any {
  // ....
  if (!ob) {
    target[key] = val;
    return val;
  }
  defineReactive(ob.value, key, val);
  ob.dep.notify();
  return val;
}
数组的变异;
var vm = new Vue({
  data: {
    items: ["1", "2", "3"],
  },
});
vm.items[1] = "4"; // 视图并未更新
vm.items.length = 6; // 视图并未更新
```

```javascript
function defineReactive(data, key, val) {
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function defineGet() {
      console.log(`get key: ${key} val: ${val}`);
      return val;
    },
    set: function defineSet(newVal) {
      console.log(`set key: ${key} val: ${newVal}`);
      val = newVal;
    },
  });
}

function observe(data) {
  Object.keys(data).forEach(function (key) {
    defineReactive(data, key, data[key]);
  });
}

let test = [1, 2, 3];

observe(test);

test[0] = 4; // set key: 0 val: 4
// 以上的例子可以说明这不是 defineProperty 的锅，但是我们打印 test

console.log(test);
```

- 基于性能问题不进行监听数组，而且新增索引的确是 defineProperty 做不到的
- 所以 vue 提供了数组的变异方法

```javascript
const methodsToPatch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
];

methodsToPatch.forEach(function (method) {
  // 缓存原生数组
  const original = arrayProto[method];
  // def 使用 Object.defineProperty 重新定义属性
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args); // 调用原生数组的方法

    const ob = this.__ob__; // ob就是observe实例observe才能响应式
    let inserted;
    switch (method) {
      // push和unshift方法会增加数组的索引，但是新增的索引位需要手动observe的
      case "push":
      case "unshift":
        inserted = args;
        break;
      // 同理，splice的第三个参数，为新增的值，也需要手动observe
      case "splice":
        inserted = args.slice(2);
        break;
    }
    // 其余的方法都是在原有的索引上更新，初始化的时候已经observe过了
    if (inserted) ob.observeArray(inserted);
    // dep通知所有的订阅者触发回调
    ob.dep.notify();
    return result;
  });
});
```

## Vue3 的 Proxy

Vue3 抛弃了数据劫持，使用的是 Proxy+Reflect 来实现的数据代理。

### Proxy

Proxy:代理，ES6 原生提供 Proxy 构造函数，用来生成 Proxy 实例，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。

Proxy 的构造函数语法为：

```javascript
var proxy = new Proxy(target, handler);
```

- target：要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
- handler：一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 p 的行为。

handle 方法表

| 方法                     | 描述                                                                          |
| ------------------------ | ----------------------------------------------------------------------------- |
| handler.has()            | in 操作符的捕捉器。                                                           |
| handler.get()            | 属性读取操作的捕捉器。                                                        |
| handler.set()            | 属性设置操作的捕捉器。                                                        |
| handler.deleteProperty() | delete 操作符的捕捉器。                                                       |
| handler.ownKeys()        | Object.getOwnPropertyNames 方法和 Object.getOwnPropertySymbols 方法的捕捉器。 |
| handler.apply()          | 函数调用操作的捕捉器。                                                        |
| handler.construct()      | new 操作符的捕捉器                                                            |

```javascript
const originObj = {}
const proxyObj = new Proxy(originObj,{
get: function (target, propKey, receiver) {
return 10
}
});
// 代理只会对 proxy 对象生效，如上方的 origin 就没有任何效果
proxyObj.a // 10;
proxyObj.b // 10;
originObj.a // undefined
origin.b // undefined
// 使用 has 方法隐藏某些属性，不被 in 运算符发现
var handler = {
has (target, key) {
if (key[0] === '\_') {
return false;
}
return key in target;
}
};
var target = { \_prop: 'foo', prop: 'foo' };
var proxy = new Proxy(target, handler);
console.log('\_prop' in proxy); // false
// 又比如说 apply 方法拦截函数的调用、call 和 apply 操作。
// apply 方法可以接受三个参数，分别是目标对象、目标对象的上下文对象（this）和目标对象的参数数组，
var target = function () { return 'I am the target'; };
var handler = {
apply: function () {
return 'I am the proxy';
}
};
var p = new Proxy(target, handler);
p();
// "I am the proxy"
// ownKeys 方法可以拦截对象自身属性的读取操作
let target = {
\_bar: 'foo',
\_prop: 'bar',
prop: 'baz'
};

let handler = {
ownKeys (target) {
return Reflect.ownKeys(target).filter(key => key[0] !== '\_');
}
};

let proxy = new Proxy(target, handler);
for (let key of Object.keys(proxy)) {
console.log(target[key]);
}
```

### Reflect

Reflect 是一个内置的对象，它提供拦截 JavaScript 操作的方法。这些方法与 proxy handlers 的方法相同。
Reflect 不是一个函数对象，因此它是不可构造的。
与大多数全局对象不同 Reflect 并非一个构造函数，所以不能通过 new 运算符对其进行调用，或者将 Reflect 对象作为一个函数来调用。Reflect 的所有属性和方法都是静态的（就像 Math 对象）。
Reflect 对象提供了以下静态方法，这些方法与 proxy handler methods 的命名相同.
语法：
scss 复制代码
|语法|说明|
|---|---|
|Reflect.apply(target, thisArgument, argumentsList)|对一个函数进行调用操作，同时可以传入一个数组作为调用参数<br>和 Function.prototype.apply() 功能类似|
|Reflect.construct(target, argumentsList[, newTarget])|对构造函数进行 new 操作，相当于执行 new target(...args)。|
|Reflect.defineProperty(target, propertyKey, attributes)|和 Object.defineProperty() 类似。如果设置成功就会返回 true|
|Reflect.deleteProperty(target, propertyKey)|作为函数的 delete 操作符，相当于执行 delete target[name]。|
|Reflect.get(target, propertyKey[, receiver])|获取对象身上某个属性的值，类似于 target[name]。|
|Reflect.getOwnPropertyDescriptor(target, propertyKey)|类似于 Object.getOwnPropertyDescriptor()。如果对象中存在该属性，则返回对应的属性描述符, 否则返回 undefined。|
|Reflect.getPrototypeOf(target)|类似于 Object.getPrototypeOf()。|
|Reflect.has(target, propertyKey)|判断一个对象是否存在某个属性，和 in 运算符 的功能完全相同。|
|Reflect.isExtensible(target)|类似于 Object.isExtensible()。|
|Reflect.ownKeys(target)| 返回一个包含所有自身属性（不包含继承属性）的数组。<br> (类似于 Object.keys(), 但不会受 enumerable 影响)。|
|Reflect.preventExtensions(target)|类似于 Object.preventExtensions()。返回一个 Boolean。|
|Reflect.set(target, propertyKey, value[, receiver])|将值分配给属性的函数。返回一个 Boolean，如果更新成功，则返回 true。|
|Reflect.setPrototypeOf(target, prototype)|设置对象原型的函数. 返回一个 Boolean， 如果更新成功，则返回 true。|

检测一个对象是否存在特定属性

```javascript
const duck = {
  name: "Maurice",
  color: "white",
  greeting: function () {
    console.log(`Quaaaack! My name is ${this.name}`);
  },
};

Reflect.has(duck, "color");
// true
Reflect.has(duck, "haircut");
// false
```

为一个对象赋值，获取对象所有的属性

```javascript
const duck = {
  name: "Maurice",
  color: "white",
  greeting: function () {
    console.log(`Quaaaack! My name is ${this.name}`);
  },
};
Reflect.set(duck, "eyes", "black"); // returns "true" if successful

console.log(Reflect.ownKeys(duck)); // ["name", "color", "greeting", "eyes"]
```

Vue3 中通过 Proxy 结合 Reflect 来彻底代理实现了数据代理。
