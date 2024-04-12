---
title: 组件常用Hook&Hook闭包陷阱
aside: true
editLink: false
lastUpdated: false
showComment: false
---



# 组件常用Hook&Hook闭包陷阱

React 组件支持 class、function 两种形式，但现在绝大多数情况都是 function 组件。

官方文档也已经把 class 组件的语法划到了 legacy（遗产）部分，并建议开发者使用 function 组件。

## 常用Hook

### useState
从一种数据变成另一种数据，这种就是状态（state）了。
也就是说，状态是变化的数据,组件的核心就是状态。
组件内的状态是 useState 创建的，整个应用还可以加一个全局状态管理的库来管理 state。
state 是基础，也是前端应用的核心。
``` javascript
const [num, setNum] = useState(() => {
    const num1 = 1 + 2;
    const num2 = 2 + 3;
    return num1 + num2
});
```

useState 返回一个数组，包含 xxx 和 setXxx，一般用解构语法获取。

这个 useState也有两种参数：
- 可以直接传新的值
- 或者传一个函数，返回新的值，这个函数的参数是上一次的 state。


### useEffect
effect 被翻译为副作用。

之前的函数组件是纯函数，传入 props，返回对应的结果，再次调用，传入 props，依然返回同样的结果。

但现在有了 effect 之后，每次执行函数，额外执行了一些逻辑，这些逻辑不就是副作用么？

``` javascript
import { useEffect, useState } from "react";

async function queryData() {
  const data = await new Promise<number>((resolve) => {
    setTimeout(() => {
      resolve(666);
    }, 2000);
  })
  return data;
}

function App() {
  const [num, setNum] = useState(0);

  useEffect(() => {
    queryData().then(data => {
      setNum(data);
    })
  }, []);

  return (
    <div onClick={() => setNum((prevNum) => prevNum + 1)}>{num}</div>
  );
}

export default App;
```

> 注：想用 async await 语法需要单独写一个函数，因为 useEffect 参数的那个函数不支持 async。

请求数据、定时器等这些异步逻辑，都会放在 useEffect 里。

第二个参数：这个数组叫做依赖数组，react 是根据它有没有变来决定是否执行effect函数的，如果没传则每次都执行。

如果数组中有个变化的值，那就会触发重新执行effect函数。

这个数组我们一般写依赖的 state，这样在 state 变了之后就会触发重新执行了。


问题：在 useEffect 跑了一个定时器，依赖变了之后，再次执行 useEffect，如何清理上一个定时器？

``` javascript
import { useEffect, useState } from "react";

function App() {
  const [num, setNum] = useState(0);

  useEffect(() => {
    console.log('effect')
    const timer = setInterval(() => {
      console.log(num);
    }, 1000);

    return () => {
      console.log('clean up')
      clearInterval(timer);
    }
  }, [num]);

  return (
    <div onClick={() => setNum((prevNum) => prevNum + 1)}>{num}</div>
  );
}

export default App;
```
当 deps 数组变了，重新执行 effect 之前，会先执行清理函数，打印了 clean up；组件销毁时也会调用 cleanup 函数来进行清理。


### useLayoutEffect
和 useEffect 类似的还有一个 useLayoutEffect。

``` javascript
useLayoutEffect(() => {
    console.log('effect')
} , [1,2,3]);

```
大多数情况下，useEffect 和 useLayoutEffect 功能一样。

区别在于：useEffect 默认是异步执行的，而 useLayoutEffect 是同步执行的。

由于 js 执行和渲染是阻塞的，useEffect 的 effect 函数会在操作 dom 之后异步执行，这些逻辑会以单独的宏任务或者微任务的形式存在，然后进入 Event Loop 调度执行。

所以异步执行的 effect 逻辑就有两种可能：
- 有可能在下次渲染之前，就能执行完这个 effect。
- 也有可能下次渲染前，没时间执行这个 effect，所以就在渲染之后执行了。

这样就导致有的时候页面会出现闪动，因为第一次渲染的时候的 state 是之前的值，渲染完之后执行 effect 改了 state，在此渲染就是新的值了。

如果不想闪动那一下，就用 useLayoutEffect。

与 useEffect 的区别：
- useLayoutEffect 的 effect 执行是同步的。这样浏览器会等 effect 逻辑执行完再渲染。
- 好处是不会闪动。
- 坏处是如果 effect 逻辑执行时间太长，会阻塞渲染。

总结：
- 大多数情况下，用 useEffect 能避免因为 effect 逻辑执行时间长导致页面卡顿（掉帧）。 
- 但如果闪动的问题比较严重，可以用 useLayoutEffect，但要注意 effect 逻辑执行时间长度，避免卡顿。








### useReducer
### useReducer + immer
### useRef
### forwardRef + useImperativeHandle
### useContext
### memo + useMemo + useCallback