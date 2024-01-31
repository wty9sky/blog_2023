---
title: Vue3源码解析-watch原理
aside: true
editLink: false
lastUpdated: false
showComment: false
---

# Vue3 中的 watch

## watch

- 本质就是观测一个响应式数据
- 当数据发生变化时通知并执行相应的回调函数
- watch 的实现本质就是利用了
  - effect
  - options.scheduler

```javascript
// watch 函数接收两个参数，source 是响应式数据，cb 是回调函数
function watch(source, cb) {
  effect(
    // 触发读取操作，从而建立联系
    () => source.foo,
    {
      scheduler() {
        // 当数据变化时，调用回调函数 cb
        cb();
      },
    }
  );
}
```

上述代码中，source 是响应式数据，cb 是回调函数。

- 如果副作用函数中存在 scheduler 选项
  - 则当响应式数据发生变化时，会触发 scheduler 函数执行，而不是直接触发副作用函数执行。
  - scheduler 调度函数就相当于是一个回调函数，而 watch 的实现就是利用了这点。

## watch 的函数签名

### 侦听多个源

- 侦听的数据源可以是一个数组，如下面的函数签名所示：

```javascript
// packages/runtime-core/src/apiWatch.ts

// 数据源是一个数组
// overload: array of multiple sources + cb
export function watch<
T extends MultiWatchSources,
Immediate extends Readonly<boolean> = false

> (
> sources: [...T],
> cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
> options?: WatchOptions<Immediate>
> ): WatchStopHandle

```

- 也可以使用数组同时侦听多个源，如下面的函数签名所示：

```javascript
// packages/runtime-core/src/apiWatch.ts

// 使用数组同时侦听多个源
// overload: multiple sources w/ `as const`
// watch([foo, bar] as const, () => {})
// somehow [...T] breaks when the type is readonly
export function watch<
T extends Readonly<MultiWatchSources>,
Immediate extends Readonly<boolean> = false

> (
> source: T,
> cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
> options?: WatchOptions<Immediate>
> ): WatchStopHandle

```

### 侦听单一源

- 侦听的数据源是一个 ref 类型的数据 或者是一个具有返回值的 getter 函数，如下面的函数签名所示：

```javascript
// packages/runtime-core/src/apiWatch.ts

// 数据源是一个 ref 类型的数据 或者是一个具有返回值的 getter 函数
// overload: single source + cb
export function watch<T, Immediate extends Readonly<boolean> = false>(
source: WatchSource<T>,
cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
options?: WatchOptions<Immediate>
): WatchStopHandle

export type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T)

```

- 侦听的数据源是一个响应式的 obj 对象，如下面的函数签名所示：

```javascript
// packages/runtime-core/src/apiWatch.ts

// 数据源是一个响应式的 obj 对象
// overload: watching reactive object w/ cb
export function watch<
T extends object,
Immediate extends Readonly<boolean> = false

> (
> source: T,
> cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
> options?: WatchOptions<Immediate>
> ): WatchStopHandle

```

## watch 的实现

### watch 函数

```javascript
// packages/runtime-core/src/apiWatch.ts
// implementation
export function watch<T = any, Immediate extends Readonly<boolean> = false>(
source: T | WatchSource<T>,
cb: any,
options?: WatchOptions<Immediate>
): WatchStopHandle {
if (**DEV** && !isFunction(cb)) {
warn(`watch(fn, options?)` signature has been moved to a separate API. `+
       `Use `watchEffect(fn, options?)` instead. `watch` now only `+
       `supports `watch(source, cb, options?) signature.`)
}
return doWatch(source as any, cb, options)
}
```

- watch 函数接收 3 个参数

  - source 侦听的数据源
  - cb 回调函数
  - options 侦听选项。

- source 参数
  - 从 watch 的函数重载中可以知道，当侦听的是单一源时，source 可以是一个 ref 类型的数据，或者是一个具有返回值的 getter 函数，也可以是一个响应式的 obj 对象。当侦听的是多个源时，source 可以是一个数组。
- cb 参数
  在 cb 回调函数中，给开发者提供了最新的 value，旧的 value 以及 onCleanup 函数用与清除副作用。
  如下面的类型定义所示：

```javascript
export type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  onCleanup: OnCleanup
) => any;
```

- options 参数
  options 选项可以控制 watch 的行为，例如通过 options 的选项参数 immediate 来控制 watch 的回调是否立即执行，通过 options 的选项参数来控制 watch 的回调函数是同步执行还是异步执行。options 参数的类型定义如下：

```javascript
export interface WatchOptionsBase extends DebuggerOptions {
flush?: 'pre' | 'post' | 'sync'
}

export interface WatchOptions<Immediate = boolean> extends WatchOptionsBase {
immediate?: Immediate
deep?: boolean
}
```

- options 的类型定义 WatchOptions 继承了 WatchOptionsBase。
  - watch 的 options 中有 immediate 和 deep 这两个特有的参数
  - 还可以传递 WatchOptionsBase 中的所有参数以控制副作用执行的行为
  - 在 watch 的函数体中调用了 doWatch 函数，我们来看看它的实现。

### doWatch 函数

- 实际上，无论是 watch 函数，还是 watchEffect 函数，在执行时最终调用的都是 doWatch 函数。

- doWatch 函数签名

```javascript
function doWatch(
source: WatchSource | WatchSource[] | WatchEffect | object,
cb: WatchCallback | null,
{ immediate, deep, flush, onTrack, onTrigger }: WatchOptions = EMPTY_OBJ
): WatchStopHandle
```

- doWatch 的函数签名与 watch 的函数签名基本一致，也是接收三个参数。

  - 在 doWatch 函数中，为了便于 options 选项的使用，对 options 进行了解构。

- 初始化变量
  首先从 component 中获取当前的组件实例，然后分别定义三个变量。其中 getter 是一个函数，它或作为副作用的函数参数传入到副作用函数中。forceTrigger 变量是一个布尔值，用来标识是否需要强制触发副作用函数执行。isMultiSource 变量同样也是一个布尔值，用来标记侦听的数据源是单一源还是以数组形式传入的多个源，初始值为 false，表示侦听的是单一源。

```javascript
const instance = currentInstance;
let getter: () => any;
// 是否需要强制触发副作用函数执行
let forceTrigger = false;
// 侦听的是否是多个源
let isMultiSource = false;
```

- 接下来根据侦听的数据源来初始化这三个变量。

- 侦听的数据源是一个 ref 类型的数据
  - 当侦听的数据源是一个 ref 类型的数据时
    - 通过返回 source.value 来初始化 getter(如果接收到的数据是 ref 类型的数据，则会获取 value 值)，
    - 当 getter 函数被触发时，会通过 source.value 获取到实际侦听的数据
    - 然后通过 isShallow 函数来判断侦听的数据源是否是浅响应
    - 并将其结果赋值给 forceTrigger，完成 forceTrigger 变量的初始化。

```javascript
if (isRef(source)) {
  // 侦听的数据源是 ref
  getter = () => source.value;
  // 判断数据源是否是浅响应
  forceTrigger = isShallow(source);
}
```

- 侦听的数据源是一个响应式数据
  - 当侦听的数据源是一个响应式数据时
    - 直接返回 source 来初始化 getter ，即 getter 函数被触发时直接返回侦听的数据源。
    - 由于响应式数据中可能会是一个 object 对象，因此将 deep 设置为 true，在触发 getter 函数时可以递归地读取对象的属性值。

```javascript
 else if (isReactive(source)) {
// 侦听的数据源是响应式数据
getter = () => source
deep = true
}

```

- 侦听的数据源是一个数组
  - 当侦听的数据源是一个数组，即同时侦听多个源。
    - 此时直接将 isMultiSource 变量设置为 true，表示侦听的是多个源。
    - 接着通过数组的 some 方法来检测侦听的多个源中是否存在响应式对象，将其结果赋值给 forceTrigger 。
    - 然后遍历数组，判断每个源的类型，从而完成 getter 函数的初始化。

```javascript
 else if (isArray(source)) {
// 侦听的数据源是一个数组，即同时侦听多个源
isMultiSource = true
forceTrigger = source.some(isReactive)
getter = () =>
// 遍历数组，判断每个源的类型
source.map(s => {
if (isRef(s)) {
// 侦听的数据源是 ref
 return s.value
} else if (isReactive(s)) {
// 侦听的数据源是响应式数据
return traverse(s)
} else if (isFunction(s)) {
// 侦听的数据源是一个具有返回值的 getter 函数
return callWithErrorHandling(s, instance, ErrorCodes.WATCH_GETTER)
} else {
**DEV** && warnInvalidSource(s)
}
})
}

```

- 侦听的数据源是一个函数
  - 当侦听的数据源是一个具有返回值的 getter 函数时，判断 doWatch 函数的第二个参数 cb 是否有传入。
    - 如果有传入，则处理的是 watch 函数的场景，此时执行 source 函数，将执行结果赋值给 getter 。
    - 如果没有传入，则处理的是 watchEffect 函数的场景。在该场景下，如果组件实例已经卸载，则直接返回，不执行 source 函数。
    - 否则就执行 cleanup 清除依赖，然后执行 source 函数，将执行结果赋值给 getter 。

```javascript
 else if (isFunction(source)) {

// 处理 watch 和 watchEffect 的场景
// watch 的第二个参数可以是一个具有返回值的 getter 参数，第二个参数是一个回调函数
// watchEffect 的参数是一个 函数

// 侦听的数据源是一个具有返回值的 getter 函数
if (cb) {
// getter with cb
// 处理的是 watch 的场景
// 执行 source 函数，将执行结果赋值给 getter
 getter = () =>
callWithErrorHandling(source, instance, ErrorCodes.WATCH_GETTER)
} else {
// no cb -> simple effect
// 没有回调，即为 watchEffect 的场景
 getter = () => {
// 件实例已经卸载，则不执行，直接返回
if (instance && instance.isUnmounted) {
return
}
// 清除依赖
if (cleanup) {
cleanup()
}
// 执行 source 函数
return callWithAsyncErrorHandling(
source,
instance,
ErrorCodes.WATCH_CALLBACK,
[onCleanup]
)
}
}
}

```

- 递归读取响应式数据
  - 如果侦听的数据源是一个响应式数据，需要递归读取响应式数据中的属性值。

```javascript
// 处理的是 watch 的场景
// 递归读取对象的属性值
if (cb && deep) {
  const baseGetter = getter;
  getter = () => traverse(baseGetter());
}
```

doWatch 函数的第二个参数 cb 有传入，说明处理的是 watch 中的场景。
deep 变量为 true ，说明此时侦听的数据源是一个响应式数据，因此需要调用 traverse 函数来递归读取数据源中的每个属性，对其进行监听，从而当任意属性发生变化时都能够触发回调函数执行。

- 定义清除副作用函数
  - 声明 cleanup 和 onCleanup 函数
  - 并在 onCleanup 函数的执行过程中给 cleanup 函数赋值
  - 当副作用函数执行一些异步的副作用时，这些响应需要在其失效是清除。

```javascript
// 清除副作用函数
let cleanup: () => void;
let onCleanup: OnCleanup = (fn: () => void) => {
  cleanup = effect.onStop = () => {
    callWithErrorHandling(fn, instance, ErrorCodes.WATCH_CLEANUP);
  };
};
```

- 封装 scheduler 调度函数
  - 为了便于控制 watch 的回调函数 cb 的执行时机，需要将 scheduler 调度函数封装为一个独立的 job 函数，

```javascript
// 将 scheduler 调度函数封装为一个独立的 job 函数，便于在初始化和变更时执行它
const job: SchedulerJob = () => {
if (!effect.active) {
return
}
// watch
if (cb) {
// 处理 watch 的场景
// watch(source, cb)

    // 执行副作用函数获取新值
    const newValue = effect.run()

    // 如果数据源是响应式数据或者需要强制触发副作用函数执行或者新旧值发生了变化
    // 则执行回调函数，并更新旧值
    if (
      deep ||
      forceTrigger ||
      (isMultiSource
        ? (newValue as any[]).some((v, i) =>
            hasChanged(v, (oldValue as any[])[i])
          )
        : hasChanged(newValue, oldValue)) ||
      (__COMPAT__ &&
        isArray(newValue) &&
        isCompatEnabled(DeprecationTypes.WATCH_ARRAY, instance))
    ) {

      // 当回调再次执行前先清除副作用
      // cleanup before running cb again
      if (cleanup) {
        cleanup()
      }

      // 执行watch 函数的回调函数 cb，将旧值和新值作为回调函数的参数
      callWithAsyncErrorHandling(cb, instance, ErrorCodes.WATCH_CALLBACK, [
        newValue,

        // 首次调用时，将 oldValue 的值设置为 undefined
        // pass undefined as the old value when it's changed for the first time
        oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
        onCleanup
      ])
      // 更新旧值，不然下一次会得到错误的旧值
      oldValue = newValue
    }

} else {
// watchEffect
// 处理 watchEffect 的场景
effect.run()
}
}
```

- 在 job 函数中

  - 判断回调函数 cb 是否传入
    - 如果有传入，那么是 watch 函数被调用的场景
      - 首先执行副作用函数，将执行结果赋值给 newValue 变量，作为最新的值。
      - 然后判断需要执行回调函数 cb 的情况
        - 如果侦听的数据源是响应式数据，需要深度侦听，即 deep 为 true
        - 如果需要强制触发副作用函数执行，即 forceTrigger 为 true
        - 如果新旧值发生了变化
        - 只要满足上面三种情况中的其中一种
          - 就需要执行 watch 函数的回调函数 cb。
        - 如果回调函数 cb 是再次执行，在执行之前需要先清除副作用
          - 然后调用 callWithAsyncErrorHandling 函数执行回调函数 cb``
          - 并将新值 newValue 和旧值 oldValue 传入回调函数 cb 中
          - 在回调函数 cb 执行后，更新旧值 oldValue，避免在下一次执行回调函数 cb 时获取到错误的旧值。
    - 否则就是 watchEffect 函数被调用的场景。
      - 则直接执行副作用函数即可。

- 设置 job 的 allowRecurse 属性
  - 根据是否传入回调函数 cb，设置 job 函数的 allowRecurse 属性
  - 这个设置十分重要，它能够让 job 作为侦听器的回调，这样调度器就能知道它允许调用自身。

```javascript
// important: mark the job as a watcher callback so that scheduler knows
// it is allowed to self-trigger (#1727)
// 打个标记：让调度器任务作为侦听器的回调，这样调度器就能知道允许自己派发更新
job.allowRecurse = !!cb;
```

- flush 选项指定回调函数的执行时机
- 在调用 watch 函数时，可以通过 options 的 flush 选项来指定回调函数的执行时机：
  - 当 flush 的值为 sync 时，代表调度器函数是同步执行，此时直接将 job 赋值给 scheduler，这样调度器函数就会直接执行。
  - 当 flush 的值为 post 时，代表调度函数需要将副作用函数放到一个微任务队列中，并等待 DOM 更新结束后再执行。
  - 当 flush 的值为 pre 时，即调度器函数默认的执行方式，这时调度器会区分组件是否已经挂载。如果组件未挂载，则先执行一次调度函数，即执行回调函数 cb。在组件挂载之后，将调度函数推入一个优先执行时机的队列中。

```javascript
// 这里处理的是回调函数的执行时机
let scheduler: EffectScheduler
if (flush === 'sync') {
// 同步执行，将 job 直接赋值给调度器
scheduler = job as any // the scheduler function gets called directly
} else if (flush === 'post') {
// 将调度函数 job 添加到微任务队列中执行
scheduler = () => queuePostRenderEffect(job, instance && instance.suspense)
} else {
// default: 'pre'
// 调度器函数默认的执行模式
scheduler = () => {
if (!instance || instance.isMounted) {
// 组件挂载后将 job 推入一个优先执行时机的队列中
queuePreFlushCb(job)
} else {
// 在 pre 选型中，第一次调用必须发生在组件挂载之前
// 所以这次调用是同步的
job()
}
}
}

```

- 创建副作用函数
- 初始化完 getter 函数和调度器函数 scheduler 后，调用 ReactiveEffect 类来创建一个副作用函数

```javascript
// 创建一个副作用函数
const effect = new ReactiveEffect(getter, scheduler);
```

- 执行副作用函数
  - 在执行副作用函数之前，首先判断是否传入了回调函数 cb
    - 如果有传入，则根据 options 的 immediate 选项来判断是否需要立即执行回调函数 cb
      - 如果指定了 immediate 选项，则立即执行 job 函数，即 watch 的回调函数会在 watch 创建时立即执行一次
      - 否则就手动调用副作用函数，并将返回值作为旧值，赋值给 oldValue。

```javascript
if (cb) {
  // 选项参数 immediate 来指定回调是否需要立即执行
  if (immediate) {
    // 回调函数会在 watch 创建时立即执行一次
    job();
  } else {
    // 手动调用副作用函数，拿到的就是旧值
    oldValue = effect.run();
  }
}
```

- 如果 options 的 flush 选项的值为 post
  - 需要将副作用函数放入到微任务队列中，等待组件挂载完成后再执行副作用函数。

```javascript
 else if (flush === 'post') {
// 在调度器函数中判断 flush 是否为 'post'，如果是，将其放到微任务队列中执行
queuePostRenderEffect(
effect.run.bind(effect),
instance && instance.suspense
)
}

```

- 其余情况都是立即执行副作用函数。

```javascript
 else {
// 其余情况立即执行副作用
effect.run()
}

```

- flush: 'post' 业务场景：
  - 如果需要在 DOM 更新之后执行获取 dom 元素信息的情况。
  - 在某个组件中，需要在 DOM 更新之后获取某个元素的尺寸信息，然后根据尺寸信息进行一些操作。
  - 可以使用 watch 监听数据变化，并在回调函数中获取元素尺寸信息，然后在 flush: 'post' 的情况下执行操作。

```vue
<template>
  <div id="myDiv">{{ message }}</div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";

export default {
  setup() {
    const message = ref("Hello, Vue3!");
    const myDiv = ref<HTMLDivElement | null>(null);
    watch(
      message,
      async (newVal, oldVal) => {
        await nextTick();
        const width = myDiv.value.offsetWidth;
        const height = myDiv.value.offsetHeight;
        console.log(`Width: ${width}, Height: ${height}`);
      },
      { flush: "post" }
    );
  },
};
</script>
```

- 使用 watch 函数监听 message 数据的变化
- 并在回调函数中使用 nextTick 函数获取元素尺寸信息
- 由于添加了 { flush: 'post' }，因此回调函数会在下一次 DOM 更新循环结束之后 执行
- 这个时候页面完成新的一轮渲染，可以获取到最新的 dom 信息。
- 返回匿名函数，停止侦听
  - doWatch 函数最后返回了一个匿名函数，该函数用以结束数据源的侦听。
  - 因此在调用 watch 或者 watchEffect 时，可以调用其返回值来来手动结束侦听。

```javascript
 return () => {
effect.stop()
if (instance && instance.scope) {
// 返回一个函数，用以显式的结束侦听
remove(instance.scope.effects!, effect)
}
}

```

## 总结

- watch 的本质就是观测一个响应式数据，当数据发生变化时通知并执行相应的回调函数。
- watch 的实现利用了 effect 和 options.scheduler 选项。
- watch 可以侦听单一源，也可以侦听多个源。
  - 侦听单一源
    - 数据源可以是一个具有返回值的 getter 函数。
    - 或者是一个 ref 对象。
    - 也可以是一个响应式的 object 对象。
  - 侦听多个源时，其数据源是一个数组。
- 根据侦听的数据源的类型
  - 初始化 getter 函数和 scheduler 调度函数，根据这两个函数创建一个副作用函数
  - 并根据 options 的 immediate 选项以及 flush 选项来指定回调函数和副作用函数的执行时机。
    - 当 immediate 为 true 时，在 watch 创建时会立即执行一次回调函数。
    - 当 flush 的值为 post 时，scheduler 调度函数和副作用函数都会被添加到微任务队列中，会等待 DOM 更新结束后再执行。
