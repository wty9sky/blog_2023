---
title: 组件常用Hook&Hook闭包陷阱
aside: true
editLink: false
lastUpdated: false
showComment: false
---

# 组件常用 Hook&Hook 闭包陷阱

React 组件支持 class、function 两种形式，但现在绝大多数情况都是 function 组件。

官方文档也已经把 class 组件的语法划到了 legacy（遗产）部分，并建议开发者使用 function 组件。

## 常用 Hook

### useState

从一种数据变成另一种数据，这种就是状态（state）了。
也就是说，状态是变化的数据,组件的核心就是状态。
组件内的状态是 useState 创建的，整个应用还可以加一个全局状态管理的库来管理 state。
state 是基础，也是前端应用的核心。

```javascript
const [num, setNum] = useState(() => {
  const num1 = 1 + 2;
  const num2 = 2 + 3;
  return num1 + num2;
});
```

useState 返回一个数组，包含 xxx 和 setXxx，一般用解构语法获取。

这个 useState 也有两种参数：

- 可以直接传新的值
- 或者传一个函数，返回新的值，这个函数的参数是上一次的 state。

### useEffect

effect 被翻译为副作用。

之前的函数组件是纯函数，传入 props，返回对应的结果，再次调用，传入 props，依然返回同样的结果。

但现在有了 effect 之后，每次执行函数，额外执行了一些逻辑，这些逻辑不就是副作用么？

```javascript
import { useEffect, useState } from "react";

async function queryData() {
  const data =
    (await new Promise()) <
    number >
    ((resolve) => {
      setTimeout(() => {
        resolve(666);
      }, 2000);
    });
  return data;
}

function App() {
  const [num, setNum] = useState(0);

  useEffect(() => {
    queryData().then((data) => {
      setNum(data);
    });
  }, []);

  return <div onClick={() => setNum((prevNum) => prevNum + 1)}>{num}</div>;
}

export default App;
```

> 注：想用 async await 语法需要单独写一个函数，因为 useEffect 参数的那个函数不支持 async。

请求数据、定时器等这些异步逻辑，都会放在 useEffect 里。

第二个参数：这个数组叫做依赖数组，react 是根据它有没有变来决定是否执行 effect 函数的，如果没传则每次都执行。

如果数组中有个变化的值，那就会触发重新执行 effect 函数。

这个数组我们一般写依赖的 state，这样在 state 变了之后就会触发重新执行了。

问题：在 useEffect 跑了一个定时器，依赖变了之后，再次执行 useEffect，如何清理上一个定时器？

```javascript
import { useEffect, useState } from "react";

function App() {
  const [num, setNum] = useState(0);

  useEffect(() => {
    console.log("effect");
    const timer = setInterval(() => {
      console.log(num);
    }, 1000);

    return () => {
      console.log("clean up");
      clearInterval(timer);
    };
  }, [num]);

  return <div onClick={() => setNum((prevNum) => prevNum + 1)}>{num}</div>;
}

export default App;
```

当 deps 数组变了，重新执行 effect 之前，会先执行清理函数，打印了 clean up；组件销毁时也会调用 cleanup 函数来进行清理。

### useLayoutEffect

和 useEffect 类似的还有一个 useLayoutEffect。

```javascript
useLayoutEffect(() => {
  console.log("effect");
}, [1, 2, 3]);
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

- useReducer 的类型参数传入 Reducer<数据的类型，action 的类型>

- 然后第一个参数是 reducer，第二个参数是初始数据。

```javascript
import { Reducer, useReducer } from "react";

interface Data {
    result: number;
}

interface Action {
    type: 'add' | 'minus',
    num: number
}
function reducer(state: Data, action: Action) {

    switch(action.type) {
        case 'add':
            return {
                result: state.result + action.num
            }
        case 'minus':
            return {
                result: state.result - action.num
            }
    }
    return state;
}

function App() {
  const [res, dispatch] = useReducer<Reducer<Data, Action>>(reducer, { result: 0});

  return (
    <div>
        <div onClick={() => dispatch({ type: 'add', num: 2 })}>加</div>
        <div onClick={() => dispatch({ type: 'minus', num: 1 })}>减</div>
        <div>{res.result}</div>
    </div>
  );
}

export default App;
```

和 useState 的区别：

- 用 useState 需要在每个地方都写一遍这个逻辑
- 用 useReducer 则是把它封装到 reducer 里，通过 action 触发
- 当修改 state 的逻辑比较复杂，用 useReducer

### useReducer + immer

使用 reducer 时候，如果直接修改原始的 state 返回，无法触发 DOM 重新渲染。

需要重新返回对象，如果对象结构很复杂，每次都创建一个新的对象会比较繁琐，而且性能也不好。

```javascript
import { Reducer, useReducer } from "react";

interface Data {
    a: {
        c: {
            e: number,
            f: number
        },
        d: number
    },
    b: number
}

interface Action {
    type: 'add',
    num: number
}

function reducer(state: Data, action: Action) {

    switch(action.type) {
        case 'add':
            return {
                ...state,
                a: {
                    ...state.a,
                    c: {
                        ...state.a.c,
                        e: state.a.c.e + action.num,
                    },
                },
            }
    }
    return state;
}

function App() {
  const [res, dispatch] = useReducer<Reducer<Data, Action>, string>(reducer, 'zero', (param) => {
    return {
        a: {
            c: {
                e: 0,
                f: 0
            },
            d: 0
        },
        b: 0
    }
  });

  return (
    <div>
        <div onClick={() => dispatch({ type: 'add', num: 2 })}>加</div>
        <div>{JSON.stringify(res)}</div>
    </div>
  );
}

export default App;

```

需要重复写对象代码，造成代码冗余

解决方案：复杂对象的修改就要用 immutable 相关的库，比如 immer

```bash
npm install --save immer
```

```javascript
return produce(state, (state) => {
  state.a.c.e += action.num;
});
```

immer 是依赖 Proxy 实现的，会监听函数里对属性的修改，然后创建一个新对象

reducer 需要返回一个新的对象，才会触发渲染，而 useState 也是

```javascript
setObj(
  produce(obj, (obj) => {
    obj.a.c.e++;
  })
);
```

在 react 里，只要涉及到 state 的修改，就必须返回新的对象，不管是 useState 还是 useReducer

### useRef

useRef 是一个 React Hook，它能帮助引用一个不需要渲染的值。
useRef 保存 dom 引用或者其他内容，通过 xxRef.current 来取，改变它的内容不会触发重新渲染。

```javascript
const ref = useRef(initialValue);
```

```javascript
import { useEffect, useRef } from "react";

function App() {
  const inputRef = useRef < HTMLInputElement > null;

  useEffect(() => {
    inputRef.current?.focus();
  });

  return (
    <div>
      <input ref={inputRef}></input>
    </div>
  );
}

export default App;
```

如果需要触发渲染，需要 state 配合：

```javascript
import { useRef, useState } from "react";

function App() {
  const numRef = useRef < number > 0;
  const [, forceRender] = useState(0);

  return (
    <div>
      <div
        onClick={() => {
          numRef.current += 1;
          forceRender(Math.random());
        }}
      >
        {numRef.current}
      </div>
    </div>
  );
}

export default App;
```

### forwardRef + useImperativeHandle

forwardRef 允许组件使用 ref 将 DOM 节点暴露给父组件，也就是 ref 从子组件传递到父组件

```javascript
import { forwardRef } from "react";

const MyInput = forwardRef(function MyInput(props, ref) {
  // ...
});
```

也就是转发组件内的 Ref 到父组件

```javascript
import { useRef } from "react";
import { useEffect } from "react";
import React from "react";

const Guang: React.ForwardRefRenderFunction<HTMLInputElement> = (
  props,
  ref
) => {
  return (
    <div>
      <input ref={ref}></input>
    </div>
  );
};

const WrapedGuang = React.forwardRef(Guang);

function App() {
  const ref = useRef < HTMLInputElement > null;

  useEffect(() => {
    console.log("ref", ref.current);
    ref.current?.focus();
  }, []);

  return (
    <div className="App">
      <WrapedGuang ref={ref} />
    </div>
  );
}

export default App;
```

forwardRef 包裹的组件的类型是 React.forwardRefRenderFunction

- 第一个类型参数是 ref 的 content 的类型
- 第二个类型参数是 props 的类型。

如果需要暴露一些自定义内容

- 需要 useImperativeHandle 的 hook 配合
  - 它有 3 个参数
    - 第一个是传入的 ref
    - 第二个是是返回新的 ref 值的函数
    - 第三个是依赖数组

```javascript
import { useRef } from "react";
import { useEffect } from "react";
import React from "react";
import { useImperativeHandle } from "react";

interface RefProps {
  aaa: () => void;
}

const Guang: React.ForwardRefRenderFunction<RefProps> = (props, ref) => {
  const inputRef = useRef < HTMLInputElement > null;

  useImperativeHandle(
    ref,
    () => {
      return {
        aaa() {
          inputRef.current?.focus();
        },
      };
    },
    [inputRef]
  );

  return (
    <div>
      <input ref={inputRef}></input>
    </div>
  );
};

const WrapedGuang = React.forwardRef(Guang);

function App() {
  const ref = useRef < RefProps > null;

  useEffect(() => {
    console.log("ref", ref.current);
    ref.current?.aaa();
  }, []);

  return (
    <div className="App">
      <WrapedGuang ref={ref} />
    </div>
  );
}

export default App;
```

用 useImperativeHanlde 自定义 ref 对象，这样，父组件里拿到的 ref 就是 useImperativeHandle 第二个参数的返回值了。

### useContext

跨任意层组件传递数据，我们一般用 Context。

展示值：

```javascript
import { createContext, useContext } from "react";

const countContext = createContext(111);

function Aaa() {
  return (
    <div>
      <countContext.Provider value={222}>
        <Bbb></Bbb>
      </countContext.Provider>
    </div>
  );
}

function Bbb() {
  return (
    <div>
      <Ccc></Ccc>
    </div>
  );
}

function Ccc() {
  const count = useContext(countContext);
  return <h2>context 的值为：{count}</h2>;
}

export default Aaa;
```

class 组件是通过 Consumer 来取 context 的值：

```javascript
import { createContext, Component } from "react";

const countContext = createContext(111);

class Ccc extends Component {
  render() {
    return <h2>context 的 值为：{this.props.count}</h2>;
  }
}

function Bbb() {
  return (
    <div>
      <countContext.Consumer>
        {(count) => <Ccc count={count}></Ccc>}
      </countContext.Consumer>
    </div>
  );
}
```

总结:用 createContext 创建 context 对象，用 Provider 修改其中的值， function 组件使用 useContext 的 hook 来取值，class 组件使用 Consumer 来取值。

### memo + useMemo + useCallback

- memo 是防止 props 没变时的重新渲染，useMemo 和 useCallback 是防止 props 的不必要变化。

- 如果子组件用了 memo，那给它传递的 props 就需要用 useMemo、useCallback 包裹，否则，每次 props 都会变，memo 就没用了。

- 如果 props 使用 useMemo、useCallback，但是子组件没有被 memo 包裹，那也没意义，因为不管 props 变没变都会重新渲染，只是做了无用功。

- memo + useCallback、useMemo 是搭配着来的，少了任何一方，都会使优化失效。但 useMemo 和 useCallback 也不只是配合 memo 用。

- 大计算量可以用 useMemo 来缓存

```javascript
import { memo, useEffect, useState } from "react";

function Aaa() {
  const [, setNum] = useState(1);

  const [count, setCount] = useState(2);

  useEffect(() => {
    setInterval(() => {
      setNum(Math.random());
    }, 2000);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setCount(Math.random());
    }, 2000);
  }, []);

  return (
    <div>
      <MemoBbb count={count}></MemoBbb>
    </div>
  );
}

interface BbbProps {
  count: number;
}

function Bbb(props: BbbProps) {
  console.log("bbb render");

  return <h2>{props.count}</h2>;
}

const MemoBbb = memo(Bbb);

export default Aaa;
```

### React19 新增 Hook

- useFormState：重新定义交互性,简化服务器交互
    - 管理表单提交状态，可以立即显示服务器响应
    - 在表单操作期间，处理服务器通信，并捕获和展现服务器的响应结果
  - 不需要通常的 useEffect + setMessage 组合。
- useFormStatus：让用户了解情况,增强表单提交体验
  - 提供一个 pending 标志，在 true 或 false 之间切换以指示提交进度。
  - 此标志对于在数据提交期间显示加载动画或更改按钮文本有很大帮助，从而保持用户参与并了解情况。
- useOptimistic：主动反馈
  - 为 Web 应用程序添加了一层动态用户反馈
  - 使用 useOptimistic 可以在用户互动后，在服务器响应之前立即进行操作，例如「正在加载仪表板」
  - 通过预期的反馈可以通过使交互感觉更快、响应更灵敏来增强用户体验。
  - 有点像动态的骨架屏

## 总结

- useState

  - 状态是变化的数据，是组件甚至前端应用的核心。useState 有传入值和函数两种参数，返回的 setState 也有传入值和传入函数两种参数。

- useEffect

  - 副作用 effect 函数是在渲染之外额外执行的一些逻辑。它是根据第二个参数的依赖数组是否变化来决定是否执行 effect，可以返回一个清理函数，会在下次 effect 执行前执行。

- useLayoutEffect

  - 和 useEffect 差不多，但是 useEffect 的 effect 函数是异步执行的，所以可能中间有次渲染，会闪屏
  - useLayoutEffect 则是同步执行的，所以不会闪屏，但如果计算量大可能会导致掉帧。

- useReducer

  - 封装一些修改状态的逻辑到 reducer，通过 action 触发，当修改深层对象的时候，创建新对象比较麻烦，可以结合 immer

- useRef

  - 可以保存 dom 引用或者其他内容，通过 xxRef.current 来取，改变它的内容不会触发重新渲染

- forwardRef

  - 通过 forwardRef 可以从子组件转发 ref 到父组件
  - 如果想自定义 ref 内容可以使用 useImperativeHandle

- useContext

  - 跨层组件之间传递数据可以用 Context
  - 用 createContext 创建 context 对象，用 Provider 修改其中的值， function 组件使用 useContext 的 hook 来取值，class 组件使用 Consumer 来取值

- useMemo、useCallback

  - memo 包裹的组件只有在 props 变的时候才会重新渲染，useMemo、useCallback 可以防止 props 不必要的变化，两者一般是结合用。
  - 不过当用来缓存计算结果等场景的时候，也可以单独用 useMemo、useCallback

- React 19 新增的 Hook
  - useFormState：重新定义交互性
  - useFormStatus：让用户了解情况
  - useOptimistic：主动反馈

## Hook 闭包陷阱

### 什么是闭包陷阱

```javascript
import { useEffect, useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      console.log(count);
      setCount(count + 1);
    }, 1000);
  }, []);

  return <div>{count}</div>;
}

export default App;
```

### 解决办法

#### 第一种

使用 useState 的函数的形式

- 从参数拿到上次的 state，这样就不会形成闭包了
- 或者用 useReducer，直接 dispatch action，而不是直接操作 state，这样也不会形成闭包

useState 的函数形式

```javascript
import { useEffect, useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setCount((count) => count + 1);
    }, 1000);
  }, []);

  return <div>{count}</div>;
}

export default App;
```

useReducer 的形式

```javascript
import {Reducer,useEffect,useReducer} from 'react';

interface Action {
  type:'add'|'minus';
  num:number;
}

function reducer(state:number,action:Action) {
  switch(action.type) {
    case 'add':
      return state + action.num;
    case 'minus':
      return state - action.num;
  }
  return 0;
}

function App() {
  const [count,dispatch] = useReducer<Reducer<number,Action>>(reducer,0);

  uwseEffect(() => {
    console.log(count);

    setInterval(() => {
      dispatch({
        type:'add',
        num: 1
      })
    })
  },[])

  return <div>{count}</div>
}

export default App;

```

#### 第二种

使用依赖数组实现，把用到的 state 加到依赖数组里，这样 state 变了就会重新跑 effect 函数，引用新的 state

```javascript
import { useEffect, useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(count);

    const timer = setInterval(() => {
      setCount(count + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [count]);

  return <div>{count}</div>;
}

export default App;
```

该方案不适用定时器
定时器的场景需要保证定时器只跑一次，不然重新跑会导致定时不准，所以需要用 useEffect + useRef 的方式来解决闭包陷阱问题。

#### 第三种 useRef

使用 useRef 保存每次渲染的值，用到的时候从 ref.current 中取.

通过 useRef 创建 ref 对象，保存执行的函数，每次渲染在 useLayoutEffect 里更新 ref.current 里的值为最新函数。

```javascript
import { useEffect, useState, useRef, useLayoutEffect } from "react";

function App() {
  const [count, setCount] = useState(0);

  const updateCount = () => {
    setCount(count + 1);
  };
  const ref = useRef(updateCount);

  useLayoutEffect(() => {
    ref.current = updateCount;
  });

  useEffect(() => {
    const timer = setInterval(() => ref.current(), 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <div>{count}</div>;
}

export default App;
```

### 扩展 封装定时器

```javascript
import { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react';

function useInterval(fn: Function, time: number) {
    const ref = useRef(fn);

    useLayoutEffect(() => {
        ref.current = fn;
    });

    let cleanUpFnRef = useRef<Function>();

    const clean = useCallback(() =>{
        cleanUpFnRef.current?.();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => ref.current(), time);

        cleanUpFnRef.current = ()=> {
            clearInterval(timer);
        }

        return clean;
    }, []);

    return clean;
}

function App() {
    const [count, setCount] = useState(0);

    const updateCount = () => {
        setCount(count + 1);
    };

    useInterval(updateCount, 1000);

    return <div>{count}</div>;
}

export default App;

```
