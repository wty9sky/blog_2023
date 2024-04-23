---
title: VueRouter原理挖掘机
aside: true
editLink: false
lastUpdated: false
showComment: false
showSidebar: true
---


# 模拟 Vue Router

本篇主要模拟的是 History 模式。Hash 模式基本实现上是一样的。

这里先来复习一下 Hash 模式的工作原理。

·URL 中#后面的内容作为路径地址，当地址改变的时候不会向服务器发送请求，但是会触发 hashchange 事件。
监听 hashchange 事件，在该事件中记录当前的路由地址，然后根据路由地址找到对应组件。
根据当前路由地址找到对应组件重新渲染。
下面再来复习一下 History 模式

通过 history.pushState()方法改变地址栏，并且将当前地址记录到浏览器的历史记录中。当前浏览器不会向服务器发送请求
监听 popstate 事件，可以发现浏览器历史操作的变化，记录改变后的地址，单击前进或者是后退按钮的时候触发该事件
根据当前路由地址找到对应组件重新渲染

## 分析 Vue Router

在模拟 Vue Router 之前，首先来看一下 Vue Router 的核心代码

``` javascript
//注册插件
Vue.use(VueRouter);
//创建路由对象
const router = new VueRouter({
  routes: [{ name: "home", path: "/", component: homeComponent }],
});
// 创建Vue实例，注册router对象
new Vue({
  router,
  render: (h) => h(App),
}).$mount("#apps");
```

在上面的代码中，我们首先调用 use 方法注册该插件。

use 方法需要的参数可以是一个函数或者是对象，如果传递的是函数，use 内部会直接调用该函数，

如果传递的是一个对象，那么在 use 内部会调用该对象的 install 方法。

而 Vue Router 传递的是对象，所以在模拟 Vue Router 的时候，要实现一个 install 方法。

下面我们创建了 VueRouter 实例，所以 VueRouter 可以是构造方法或者是类，那么我们在模拟的时候，将其定义为类。并且该类中有一个静态的 install 方法，因为我们将 VueRouter 传递给了 use 方法。

在 VueRouter 类的构造方法中，需要有一个参数，该参数是一个对象，该对象中定义了路由的规则。

最后创建了 Vue 的实例，并且将创建好的 Vue Router 对象传递到该实例中。

在该类图中，上半部分是 VueRouter 的属性，而下半部分是 VueRouter 的方法。

options 作用是记录构造函数中传入的对象, 我们在创建 Vue Router 的实例的时候，传递了一个对象，而该对象中定义了路由规则。而 options 就是记录传入的这个对象的。

routeMap:是一个对象，记录路由地址与组件的对应关系，也就是一个键值对的形式，后期会 options 中路由规则解析到 routeMap 中。

data 是一个对象，该对象中有一个属性 current,该属性用来记录当前的路由地址，data 是一个响应式的对象，因为当前路由地址发生变化后，对应的组件要发生更新（也就说当地址变化后，要加载对应组件）。

install 是一个静态方法，用来实现 Vue 的插件机制。

Constructor 是一个构造方法，该该构造方法中会初始化 options ,data,routeMap 这几个属性。

inti 方法主要是用来调用下面的三个方法，也就把不同的代码分隔到不同的方法中去实现。

initEvent 方法，用来注册 popstate 事件，

createRouteMap 方法，该方法会把构造函数中传入进来的路由规则，转换成键值对的形式存储到 routeMap 中。 键就是路由的地址，值就是对应的组件

initComponents 方法，主要作用是用来创建 router-link 和 router-view 这两个组件的。

现在我们已经对 Vue Router 做了一个分析。

下面开始创建自己的 Vue Router.

### install 方法实现

在 Vue_router_app 项目的 src 目录下面创建一个 Vuerouter 目录，同时创建一个 index.js 文件，在该文件中创建如下的代码。

install 方法需要的参数是 Vue 的构造方法。

``` javascript
let _Vue = null;
export default class VueRouter {
  //调用install方法的时候，会传递Vue的构造函数
  static install(Vue) {
    //首先判断插件是否已经被安装，如果已经被安装，就不需要重复安装。
    //1、判断当前插件是否已经被安装:
    if (VueRouter.install.installed) {
      //条件成立，表明插件已经被安装，什么都不要做。
      return;
    }
    VueRouter.install.installed = true;
    //2、把Vue构造函数记录到全局变量中。
    _Vue = Vue;

    //3、把创建Vue实例时候传入的router对象注入到Vue实例上。
    _Vue.mixin({
      beforeCreate() {
        //在创建Vue实例的时候
        // 也就是new Vue()的时候，才会有$options这个属性，
        //组件中是没有$options这个属性的。
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router;
        }
      },
    });
  }
}
```

### 实现构造函数

Constructor 是一个构造方法，该该构造方法中会初始化 options ,data,routeMap 这几个属性。

``` javascript
constructor(options) {

    this.options = options;

    this.routeMap = {};

    this.data = _Vue.observable({
      current: "/",
    });
  }
```

### createRouteMap 方法实现

createRouteMap 方法，该方法会把构造函数中传入进来的 options 参数中的路由规则，转换成键值对的形式存储到 routeMap 中。 键就是路由的地址，值就是对应的组件

``` javascript
  createRouteMap() {
    this.options.routes.forEach((route) => {
      this.routeMap[route.path] = route.component;
    });
  }
```

### initComponents 方法实现

initComponents 方法，主要作用是用来创建 router-link 和 router-view 这两个组件的。

下面先在这个方法中创建 router-link 这个组件。

先来看一下 router-link 这个组件的基本使用

``` javascript
<router-link to="/users"> 用户管理</router-link>
```

我们知道，router-link 这个组件最终会被渲染成 a 标签，同时 to 作为一个属性，其值会作为 a 标签中的 href 属性的值。同时还要获取<\router-link>这个组件中的文本，作为最终超链接的文本。

``` javascript
 initComponents(Vue) {
    Vue.component("router-link", {
      props: {
        to: String,
      },
      template: '<a :href="to"><slot></slot></a>',
    });
  }
```

在上面的代码中，我们通过 Vue.component 来创建 router-link 这个组件，同时通过 props 接收 to 属性传递过来的值，并且对应的类型为字符串。

最终渲染的模板是一个 a 标签，href 属性绑定了 to 属性的值，同时使用<\slot\>插槽作为占位符，用具体的文字内容填充该占位符。

现在已经将 router-link 这个组件创建好了。

下面我们需要对我们写的这些代码进行测试。

要进行测试应该先将 createRouteMap 方法与 initComponents 方法都调用一次，那么问题是

在什么时候调用这两个方法呢？

我们可以在 VueRoute 对象创建成功后，并且将 VueRouter 对象注册到 Vue 的实例上的时候，调用这两个方法。

也就是在 beforeCreate 这个钩子函数中。

当然为了调用这两个方便，在这里我们又定义了 init 方法，来做了一次封装处理。

``` javascript
  init() {
    this.createRouteMap();
    this.initComponents(_Vue);
  }
```

对 init 方法的调用如下：

``` javascript
   beforeCreate() {
        //在创建Vue实例的时候
        // 也就是new Vue()的时候，才会有$options这个属性，
        //组件中是没有$options这个属性的。
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router;
            //调用init
          this.$options.router.init();
        }
      },

this.$options.router.init();
```

这句代码的含义：this 表示的就是 Vue 实例，$options 表示的就是在创建 Vue 的实例的时候传递的选项，如下所示：

``` javascript
const vm = new Vue({
  el: "#app",
  router,
});
```

通过上面的代码，我们可以看到，传递过来的选项中是有 router.

而这个 router 是什么呢？

``` javascript
const router = new VueRouter({});
```

就是 VueRouter 这个类的实例。而我们当前自己所模拟的路由,所创建的类就叫做 VueRouter（也就是以后在创建路由实例的时候，使用我们自己创建的 VueRouter 这个类来完成）.

而 init 方法就是 VueRouter 这个类的实例方法。所以可以通过 this.$options.router.init()的方式来调用。

下面我们来测试一下。

在 Vue_router_app 项目的 src 目录下面，创建 router.js 文件,文件定义路由规则.

如下代码所示：

``` javascript
import Vue from "Vue";
// import Router from "Vue-router";
import Router from "./Vuerouter"; //注意:这里导入的是自己定义的路由规则
import Login from "./components/Login.Vue";
import Home from "./components/Home.Vue";
Vue.use(Router);
export default new Router({
  model: "history",
  routes: [
    { path: "/", component: Home },
    { path: "/login", component: Login },
  ],
});
```

在 components 目录下面分别创建 Home.Vue 与 Login.Vue.

Home.Vue 的代码如下：

``` javascript
<template>
  <router-link to="/login">登录</router-link>
</template>

<script>
export default {};
</script>
```

Login.Vue 的代码如下:

``` javascript
<template>
  <div>
    登录页面
  </div>
</template>

<script>
export default {};
</script>
```

App.Vue 组件的内容如下：

``` javascript
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/login">Login</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {};
</script>
```

在 main.js 中完成路由的注册。

``` javascript
import Vue from "Vue";
import App from "./App.Vue";
//导入router.js
import router from "./router";
Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
```

运行上面的代码会出现如下的错误：

第二个错误是我们还没有创建 router-view 这个组件，所以才会出现该错误。这里暂时可以先不用考虑。

主要是第一个错误，该错误的含义是，目前我们使用的是运行时版本的 Vue, 模板编译器不可用。

你可以使用预编译把模板编译成 render 函数，或者是使用包含编译版本的 Vue.

以上错误说明了 Vue 的构建版本有两个，分别是“运行时版”和"完整版".

运行时版：不支持 template 模板，需要打包的时候提前编译。

完整版：包含运行时和编译器，体积比运行时版大 10k 左右，程序运行的时候把模板转换成 render 函数。性能低于运行时版本。

使用 Vue-cli 创建的项目默认为运行时版本,而我们创建的 VueRouter 类中有 template 模板，所以才会出现第一个错误。

官方文档：https://cn.Vuejs.org/v2/guide/installation.html

下面我们看一下解决方案：

在前面我们已经提到过，使用 Vue-cli 创建的项目是运行时项目，所以没有编译器，如果我们将其修改成完整版，就有编译器，对模板进行编译。

解决的方案：在项目的根目录创建 Vue.config.js 文件，在该文件中添加 runtimeCompiler 配置项，该配置项表示的是，是否使用包含运行时编译器的 Vue 构建

版本（完整版）。设置为 true 后你就可以在 Vue 组件中使用 template 选项了，但是这会让你的应用额外增加 10kb 左右。默认该选项的取值为 false.

Vue.config.js 文件配置如下

``` javascript
module.exports = {
  runtimeCompiler: true,
};
```

表示使用的是完整版，这时编译器会将 template 选项转换成 render 函数。

注意：要想以上配置内容起作用，必须重新启动服务器。

```bash
npm run serve
```

### render 函数

虽然使用完整版 Vue 可以解决上面的问题，但是由于带有编译器，体积比运行时版本大 10k 左右，所以性能比运行时版要低。

那么这一小节我们使用运行时版本来解决这个问题。

我们知道，完整版中的编译器的作用就是将 template 模板转成 render 函数，所以在运行时版本中我们可以自己编写 render 函数。

但是在这你肯定也有一个问题，就是在单文件组件中，我们一直都是在写<\template><\/template>,并且没有写 render 函数，

但是为什么能够正常的工作呢？这时因为在打包的时候，将<\template>编译成了 render 函数，这就是预编译。

最终代码如下：

``` javascript
 //该方法需要一个参数为Vue的构造函数。
  //当然也可以使用全局的_Vue.
  initComponents(Vue) {
    Vue.component("router-link", {
      props: {
        to: String,
      },
      // template: '<a :href="to"><slot></slot></a>',
      render(h) {

        return h(
          "a",
          {
            attrs: {
              href: this.to,
            },
          },
          [this.$slots.default]
        );
      },
    });
  }
```

注意：在测试之前一定要将根目录下的 Vue.config.js 文件删除掉，这样当前的环境为“运行时”环境。

### 创建 router-view 组件

router-view 组件就是一个占位符。当根据路由规则找到组件后，会渲染到 router-view 的位置。

在 initComponents 方法中创建 router-view 组件

``` javascript
 //该方法需要一个参数为Vue的构造函数。
  //当然也可以使用全局的_Vue.
  initComponents(Vue) {
    Vue.component("router-link", {
      props: {
        to: String,
      },
      // template: '<a :href="to"><slot></slot></a>',
      render(h) {

        return h(
          "a",
          {
            attrs: {
              href: this.to,
            },
          },
          [this.$slots.default]
        );
      },
    });
    const self = this;//修改this的指向
    Vue.component("router-view", {
      render(h) {
        //根据当前的路径从routeMap中查找对应的组件.
        const component = self.routeMap[self.data.current];
        //将组件转换成虚拟dom
        return h(component);
      },
    });
  }
```

下面，我们可以测试一下效果。

当我们单击链接的时候，发现了浏览器进行了刷新操作。表明向服务器发送了请求，而我们单页面应用中是不希望向服务器发送请求。

修改后的 initComponents 方法如下：

``` javascript
 //该方法需要一个参数为Vue的构造函数。
  //当然也可以使用全局的_Vue.
  initComponents(Vue) {
    Vue.component("router-link", {
      props: {
        to: String,
      },
      // template: '<a :href="to"><slot></slot></a>',
      render(h) {

        return h(
          "a",
          {
            attrs: {
              href: this.to,
            },
            on: {
              click: this.clickHandler,
            },
          },
          [this.$slots.default]
        );
      },
      methods: {
        clickHandler(e) {

          history.pushState({}, "", this.to);

          this.$router.data.current = this.to;

          //阻止向服务器发送器。
          e.preventDefault();
        },
      },
    });
    const self = this;
    Vue.component("router-view", {
      render(h) {
        //根据当前的路径从routeMap中查找对应的组件.
        const component = self.routeMap[self.data.current];
        //将组件转换成虚拟dom
        return h(component);
      },
    });
  }
```

给 a 标签添加了单击事件。

### initEvent 方法实现

现在有一个问题就是，当点击浏览器中的后退与前进按钮的时候，地址栏中的地址发生了变化，但是对应的组件没有发生变化。

这时候要解决这个问题， 就需要用到 popstate 事件

popstate 事件，可以发现浏览器历史操作的变化，记录改变后的地址，单击前进或者是后退按钮的时候触发该事件

``` javascript
initEvent() {
    window.addEventListener("popstate", () => {

      this.data.current = window.location.pathname;
    });
  }
```

针对 initEvent 方法的调用如下：

``` javascript
init() {
    this.createRouteMap();
    this.initComponents(_Vue);
    this.initEvent();
  }
```

## VueRouter 模拟实现与源码解读

在第二章中，我们已经对 VueRouter 做了一个基本的实现，通过这个基本的实现，已经对 VueRouter 的原理有了一个基本的理解。

但是，我们并没有实现路由嵌套的形式，这次我们重点来实现这一点。

### Vue.use()源码

源码位置：Vue/src/core/global-api/use.js

``` javascript
export function initUse(Vue: GlobalAPI) {
  //use方法的参数接收的是一个插件，该插件的类型可以是一个函数，也可以是一个对象
  Vue.use = function (plugin: Function | Object) {
    //_installedPlugins数组中存放已经安装的插件。
    const installedPlugins =
      this._installedPlugins || (this._installedPlugins = []);
    //判断一下传递过来的插件是否在installedPlugins中存在，如果存在，则直接返回
    if (installedPlugins.indexOf(plugin) > -1) {
      return this;
    }

    // additional parameters
    //将arguments转换成数组，并且将数组中的第一项去除。
    const args = toArray(arguments, 1);
    //把this(也就是Vue，这里是通过Vue.use来调用的)插入到数组中的第一个元素的位置。
    args.unshift(this);
    //这时plugin是一个对象，看一下是否有install这个函数。
    if (typeof plugin.install === "function") {
      //如果有install这个函数，直接调用
      //这里通过apply将args数组中的每一项展开传递给install这个函数。
      // plugin.install(args[0],args[1])
      //而args[0],就是上面我们所插入的Vue.这一点与我们前面在模拟install方法的时候是一样的。
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === "function") {
      //如果plugin是一个函数，则直接通过apply去调用
      plugin.apply(null, args);
    }
    //将插件存储到installedPlugins数组中。
    installedPlugins.push(plugin);
    return this;
  };
}
```

### install 方法分析

我们先来看一下 Vue-router 的目录结构

我们先来核心的文件。

components 目录下面，有两个文件。分别为 link.js 和 view.js 文件。

link.js 文件创建 RouterLink 组件

view.js 文件创建 RouterView 组件。

history 目录下的文件是记录路由的历史记录（hash.js 文件是关于 hash 模式，html5.js 关于 html5 的方式，base.js 公共的内容，abstract.js 是在服务端渲染中实现的路由历史记录）。

index.js 文件是用来创建 VueRouter

install.js 文件是关于 install 方法

我们自己模拟的 VueRouter 也实现上面的目录结构。

下面先来在 index.js 文件中实现基本代码。

``` javascript
export default class VueRouter {
  //在创建VueRouter对象的时候，会传递选项
  constructor(options) {
    //获取routes选项，该选项中定义路由规则
    this._options = options.routes || [];
  }
  // 注册路由变化的事件。该方法的参数是一个Vue实例，后期完善
  init(Vue) {}
}
```

下面实现 install.js 基本代码（通过查看源代码来实现）

``` javascript
export let _Vue = null; //将其导出，在其它文件中也可以使用Vue实例，而不需要单独的引入Vue的js文件
export default function install(Vue) {
  //获取Vue构造函数
  _Vue = Vue;
  _Vue.mixin({
    //通过混入以后，所有的Vue实例中都会有beforeCreate方法
    beforeCreate() {
      //判断是否为Vue的实例，如果条件成立为Vue的实例，否则为其它对应的组件（因为在创建Vue实例的时候会传递选项）
      if (this.$options.router) {
        //通过查看源码发现，Vue的实例会挂在到当前的私有属性_routerRoot属性上
        this._routerRoot = this;

        this._router = this.$options.router;
        //调用index.js文件中定义的init方法
        this._router.init(this);
      } else {
        this._routerRoot = this.$parent && this.$parent._routerRoot;
      }
    },
  });
}
```

### 组件创建测试

下面需要将 install 方法挂载到 VueRouter 上。

``` javascript
import install from "./install";
export default class VueRouter {
  //在创建VueRouter对象的时候，会传递选项
  constructor(options) {
    //获取routes选项，该选项中定义路由规则
    this._routes = options.routes || [];
  }
  // 注册路由变化的事件。
  init(Vue) {}
}
//将install方法挂载到VueRouter上
VueRouter.install = install;
```

下面，我们可以简单实现一下 Router-link 组件与 Router-view 组件，来做一个简单的测试。（接下来讲解如下内容）

components 目录下的 view.js 文件。

``` javascript
export default {
  render(h) {
    return h("div", "router-view");
  },
};
```

以上是 Router-View 组件的基本功能，后面在继续完善。

link.js 文件的实现如下：

``` javascript
export default {
  props: {
    to: {
      type: String,
      required: true,
    },
  },
  render(h) {
    //通过插槽获取`a`标签内的文本。
    return h("a", { domProps: { href: "#" + this.to } }, [this.$slots.default]);
  },
};
```

在 install.js 文件中，导入上面的组件进行测试。

``` javascript
import View from "./components/view";
import Link from "./components/link";
export let _Vue = null; //将其导出，在其它文件中也可以使用Vue实例，而不需要单独的引入Vue的js文件
export default function install(Vue) {
  //获取Vue构造函数
  _Vue = Vue;
  _Vue.mixin({
    //通过混入以后，所有的Vue实例中都会有beforeCreate方法
    beforeCreate() {
      //判断是否为Vue的实例，如果条件成立为Vue的实例，否则为其它对应的组件（因为在创建Vue实例的时候会传递选项）
      if (this.$options.router) {
        //通过查看源码发现，Vue的实例会挂在到当前的私有属性_routerRoot属性上
        this._routerRoot = this;

        this._router = this.$options.router;
        //调用index.js文件中定义的init方法
        this._router.init(this);
      } else {
        this._routerRoot = this.$parent && this.$parent._routerRoot;
      }
    },
  });
  //完成组件的注册
  Vue.component("RouterView", View);
  Vue.component("RouterLink", Link);
}
```

在上面的代码中，导入组件，并且完成组件的注册。

下面，我们测试一下。

在 src 目录下，在 router.js 文件中导入自己定义的 VueRouter.

``` javascript
import Router from "./my-Vue-router";
```

### 解析路由规则

下面，我们要做的就是对所有的路由规则进行解析，将其解析到一个数组中。方便根据地址找到对应的组件。

在源码的 index.js 文件中，创建了 VueRouter 类，对应的构造方法中，有如下代码：

``` javascript
this.matcher = createMatcher(options.routes || [], this);
```

createMatcher 方法是在 create-matcher.js 文件中创建的。

该方法返回的 matcher 就是一个匹配器，其中有两个成员，match,另外一个是 addRoutes

match:根据路由地址匹配相应的路由规则对象。

addRoutes 动态添加路由

首先在我们自己的 index.js 文件中添加如下的代码：

``` javascript
import install from "./install";
import createMatcher from "./create-matcher";
export default class VueRouter {
  //在创建VueRouter对象的时候，会传递选项
  constructor(options) {
    //获取routes选项，该选项中定义路由规则
    this._routes = options.routes || [];
    this.matcher = createMatcher(this._routes);
  }
  // 注册路由变化的事件。
  init() {}
  //init(Vue){}
}
//将install方法挂载到VueRouter上
VueRouter.install = install;
```

在上面的代码中，导入了 createMatcher 方法。

并且在调用该方法的时候传递了路由规则。

create-matcher.js 文件的代码如下：

``` javascript
import createRouteMap from "./create-route-map";
export default function createMatcher(routes) {
  const { pathList, pathMap } = createRouteMap(routes);
  function match() {}
  function addRoutes(routes) {
    createRouteMap(routes, pathList, pathMap);
  }
  return {
    match,
    addRoutes,
  };
}
```

下面，我们需要在 create-route-map.js 文件中实现 createRouteMap 这个方法。

``` javascript
export default function createRouteMap(routes, oldPathList, oldPathMap) {
  const pathList = oldPathList || [];
  const pathMap = oldPathMap || {};
  //遍历所有的路由规则，进行解析。同时还要考虑children的形式，
  //所以这里需要使用递归的方式。
  routes.forEach((route) => {
    addRouteRecord(route, pathList, pathMap);
  });

  return {
    pathList,
    pathMap,
  };
}

function addRouteRecord(route, pathList, pathMap, parentRecord) {
  //从路由规则中获取path。
  const path = parentRecord ? `${parentRecord.path}/${route.path}` : route.path;
  //构建记录
  const record = {
    path,
    component: route.component,
    parent: parentRecord, //如果是子路由的话，记录子路由对应的父record对象（该对象中有path,component）,相当于记录了父子关系
  };
  //如果已经有了path,相同的path直接跳过
  if (!pathMap[path]) {
    pathList.push(path);
    pathMap[path] = record;
  }
  //判断route中是否有子路由
  if (route.children) {
    //遍历子路由，把子路由添加到pathList与pathMap中。
    route.children.forEach((childRoute) => {
      addRouteRecord(childRoute, pathList, pathMap, record);
    });
  }
}
```

下面测试一下上面的代码。

``` javascript
import createRouteMap from "./create-route-map";
export default function createMatcher(routes) {
  const { pathList, pathMap } = createRouteMap(routes);
  console.log("pathList==", pathList);
  console.log("pathMap==", pathMap);
  function match() {}
  function addRoutes(routes) {
    createRouteMap(routes, pathList, pathMap);
  }
  return {
    match,
    addRoutes,
  };
}
```

在上面的代码中，我们打印了 pathList 与 pathMap.

当然，现在在我们所定义的路由规则中，还没有添加 children,构建相应的子路由。下面重新修改一下。

在项目根目录下的 router.js 文件中，添加对应的子路由规则。

``` javascript
import Vue from "Vue";
// import Router from "Vue-router";
// import Router from "./Vuerouter";
import Router from "./my-Vue-router";
import Login from "./components/Login.Vue";
import Home from "./components/Home.Vue";
import About from "./components/About.Vue";
import Users from "./components/Users";
Vue.use(Router);
export default new Router({
  // model: "history",
  routes: [
    { path: "/", component: Home },
    { path: "/login", component: Login },
    {
      path: "/about",
      component: About,
      children: [{ path: "users", component: Users }],
    },
  ],
});
```

这时候可以查看对应的输出结果。

### match 函数实现

在 create-matcher.js 文件中，我们实现了 createRouteMap 方法，同时还需要实现 match 方法。

match 方法的作用就是根据路由地址，匹配一个路由对象。其实就是从 pathMap 中根据路由地址，找出对应的路由记录。路由记录中记录了组件信息，找到以后就可以完成组件的创建，渲染了。

``` javascript
function match(path) {
  const record = pathMap[path];
  if (record) {
    //根据路由地址，创建route路由规则对象
    return createRoute(record, path);
  }
  return createRoute(null, path);
}
```

在上面的代码中，我们调用 match 方法的时候，会传递过来一个路径，我们根据这个路径可以从 pathMap 中找到对应的路由记录信息(这块在上一小节已经创建完毕)，如果找到了，我们还需要做进一步的处理，为什么呢？因为，我们传递过来的路径有可能是子路径，这时不光要获取到对应的子路由信息，我们还需要去查找对应的父路由的信息。所以这里需要进一步的处理，关于这块的处理封装到了 createRoute 这个方法中，而该方法在其它位置还需要，所以我们定义到 util 这个目录下 import createRoute from "./util/route";。

create-matcher.js 文件完整代码如下：

``` javascript
import createRouteMap from "./create-route-map";
import createRoute from "./util/route";
export default function createMatcher(routes) {
  const { pathList, pathMap } = createRouteMap(routes);
  console.log("pathList==", pathList);
  console.log("pathMap==", pathMap);
  //实现match方法
  function match(path) {
    const record = pathMap[path];
    if (record) {
      //根据路由地址，创建route路由规则对象
      return createRoute(record, path);
    }
    return createRoute(null, path);
  }
  function addRoutes(routes) {
    createRouteMap(routes, pathList, pathMap);
  }
  return {
    match,
    addRoutes,
  };
}
```

下面我们需要在 my-Vue-router 目录下面在创建一个 util 目录，在该目录下面创建 route.js 文件，该文件实现的代码如下：

``` javascript
export default function createRoute(record, path) {
  const matched = [];

  while (record) {
    matched.unshift(record);
    record = record.parent;
  }

  return {
    path,
    matched,
  };
}
```

总结：match 这个方法的作用就是根据路径，创建出路由规则对象，而所谓的路由规则对象其实就是包含了路径以及对应的路由记录的信息(这里有可能包含了父路由以及子路由记录，这块内容存储到一个数组中)。

以后，我们就可以根据路径直接获取到包含了整个路由记录的这个数组，从而可以将对应的组件全部创建出来。

### 历史记录处理

关于路由有三种模式：hash 模式，html5 模式，abstract 模式（该模式与服务端渲染有关）

在这里我们实现 hash 模式的历史记录管理，不管是哪种模式，都有相同的内容，这里我们相同的内容定义到

父类中。

在该父类中主要有如下内容：

router 属性：路由对象（ViewRouter）

current 属性，记录当前路径对应的路由规则对象{path:'/',matched:[]},关于该对象，我们在前面已经处理完了。也就是在 createRoute 方法中返回的内容。

transitionTo()

跳转到指定的路径，根据当前路径获取匹配的路由规则对象 route，然后更新视图。

在 my-Vue-router 目录下的，history 目录下的 base.js 文件，编写如下的代码：

``` javascript
import createRoute from "../util/route";
export default class History {
  // router路由对象ViewRouter
  constructor(router) {
    this.router = router;

    this.current = createRoute(null, "/");
  }

  transitionTo(path, onComplete) {
    this.current = this.router.matcher.match(path);
    //该回调函数在调用transitionTo方法的时候，会传递过来。
    onComplete && onComplete();
  }
}
```

父类已经实现了，下面实现对应的子类。也就是 HashHistory

HashHistory 继承 History, 同时要确保首次访问的地址为#/.

在 History 中还需要定义两个方法，第一个方法为：getCurrentLocation( ) 获取当前的路由地址(# 后面的部分)

setUpListener( )方法监听路由地址改变的事件（hashchange）。

在 history 目录下的 hash.js 文件中的代码实现如下：

``` javascript
import History from "./base";
export default class HashHistory extends History {
  constructor(router) {
    //将路由对象传递给父类的构造函数
    super(router);
    //确保 首次 访问地址加上 #/  （//由于没有添加this,为普通方法）
    ensureSlash();
  }
  // 获取当前的路由地址 （# 后面的部分）所以这里需要去除#
  getCurrentLocation() {
    return window.location.hash.slice(1);
  }
  // 监听hashchange事件
  //也就是监听路由地址的变化
  setUpListener() {
    window.addEventListener("hashchange", () => {
      //当路由地址发生变化后，跳转到新的路由地址。
      this.transitionTo(this.getCurrentLocation());
    });
  }
}

function ensureSlash() {
  //判断当前是否有hash
  // 如果单击的是链接，肯定会有hash
  if (window.location.hash) {
    return;
  }

  window.location.hash = "/";
}
```

### Init 方法实现

我们知道当创建 VueRouter 的时候，需要可以传递 mode，来指定路由的形式，例如是 hash 模式还是 html5 模式等。

所以这里需要根据指定的 mode 的模式，来选择 history 目录中中不同 js 来处理。

所以在 my-Vue-router 目录中的 index.js 文件中，做如下的修改：

``` javascript
import install from "./install";
import createMatcher from "./create-matcher";
import HashHistory from "./history/hash";
import HTML5History from "./history/html5";
export default class VueRouter {
  //在创建VueRouter对象的时候，会传递选项
  constructor(options) {
    //获取routes选项，该选项中定义路由规则
    this._routes = options.routes || [];
    this.matcher = createMatcher(this._routes);
    //获取传递过来的选项中的mode,mode中决定了用户设置的路由的形式。
    //这里给VueRouter添加了mode属性
    const mode = (this.mode = options.mode || "hash");
    switch (mode) {
      case "hash":
        this.history = new HashHistory(this);
        break;
      case "history":
        this.history = new HTML5History(this);
        break;
      default:
        throw new Error("mode error");
    }
  }
  // 注册路由变化的事件。
  init() {}
  //init(Vue){}
}
//将install方法挂载到VueRouter上
VueRouter.install = install;
```

首先导入 HashHistory 与 HTML5History.

``` javascript
import HashHistory from "./history/hash";
import HTML5History from "./history/html5";
```

下面获取选项中的 mode,如果在创建 VueRouter 对象的时候，没有指定 mode,那么默认的值为 hash.

下面就对获取到的 mode 进行判断，根据 mode 的不同的值，创建不同的 history 的实例。

``` javascript
//获取传递过来的选项中的mode,mode中决定了用户设置的路由的形式。
//这里给VueRouter添加了mode属性
const mode = (this.mode = options.mode || "hash");
switch (mode) {
  case "hash":
    this.history = new HashHistory(this);
    break;
  case "history":
    this.history = new HTML5History(this);
    break;
  default:
    throw new Error("mode error");
}
```

同时 html5.js 文件，添加了基本的代码

``` javascript
import History from "./base";
export default class HTML5History extends History {}
```

关于 Html5 的形式这里不在实现了。

下面完善一下 init 方法

``` javascript
 // 注册路由变化的事件。
  init() {}

  // 注册路由变化的事件(初始化事件监听器，监听路由地址的变化)。
  init() {
    const history = this.history;
    const setUpListener = () => {
      history.setUpListener();
    };
    history.transitionTo(
      history.getCurrentLocation(),
      //如果直接history.setUpListener
      // 这样的话setUpListener里面的this会有问题。
      setUpListener
    );
  }
```

在这里，调用了 transitionTo 方法的原因是，在 hash.js 文件中的 ensureSlash 方法中，完成了一次地址的修改，所以这里需要跳转一次。

同时完成了 hashchange 事件的绑定（路由变化的事件）。

下面可以进行测试一下，在 base.js 文件中的 transitionTo 方法中，打印出 current 属性的值。

``` javascript
  transitionTo(path, onComplete) {
    this.current = this.router.matcher.match(path);
    console.log("current===", this.current);
 //该回调函数在调用transitionTo方法的时候，会传递过来。
    onComplete && onComplete();
  }
```

下面，在浏览器的地址栏中输入了不同的 URL 地址后，在控制台上呈现出了不同的路由规则对象，也就是路由记录信息。

地址为子路由的地址，最终也输出了对应的父路由的记录信息。

后期就可以获取具体的组件来进行渲染。

### 设置响应式的\_route

下面我们要做的就是渲染组件。

这里我们先创建一个与路由有关的响应式属性，当路由地址发生变化了，对应的该属性也要发生变化，从而完成页面的重新渲染。

在 install.js 文件中添加如下的代码：

``` javascript
Vue.util.defineReactive(this, "_route", this._router.history.current);
```

以上完成了响应式属性的创建，但是要注意的是 defineReactive 方法为 Vue 的内部方法，不建议平时通过该方法来创建响应式对象。

``` javascript
  beforeCreate() {
      //判断是否为Vue的实例，如果条件成立为Vue的实例，否则为其它对应的组件（因为在创建Vue实例的时候会传递选项）
      if (this.$options.router) {
        //通过查看源码发现，Vue的实例会挂在到当前的私有属性_routerRoot属性上
        this._routerRoot = this;
        this._router = this.$options.router;
        //调用index.js文件中定义的init方法
        this._router.init(this);


        //在Vue的实例上创建一个响应式的属性`_route`.
        Vue.util.defineReactive(this, "_route", this._router.history.current);
      }
```

下面要考虑的就是当路由地址发生了变化后，需要修改\_route 属性的值。

在哪完成\_route 属性值的修改呢？

在 base.js 文件中，因为在该文件中定义了 transitionTo 方法，而该方法就是用来完成地址的跳转，同时完成组件的渲染。

base.js 文件修改后的代码如下：

``` javascript
import createRoute from "../util/route";
export default class History {
  // router路由对象ViewRouter
  constructor(router) {
    this.router = router;
    this.current = createRoute(null, "/");
    //这个回调函数是在hashhistory中赋值，作用是更改Vue实例上的_route，_route的值发生变化，视图会进行刷新操作
    this.cb = null;
  }
  //给cb赋值
  listen(cb) {
    this.cb = cb;
  }

  transitionTo(path, onComplete) {
    this.current = this.router.matcher.match(path);
    // 调用cb
    this.cb && this.cb(this.current);
    // console.log("current===", this.current);

    //该回调函数在调用transitionTo方法的时候，会传递过来。
    onComplete && onComplete();
  }
}
```

在 History 中的构造方法中初始化 cb 函数。

``` javascript
this.cb = null;
```

定义 listen 方法给 cb 函数赋值。

``` javascript
//给cb赋值
  listen(cb) {
    this.cb = cb;
  }
```

在 transitionTo 方法中调用 cb 函数，同时传递获取到的当前的路由规则对象也就是路由记录信息。

``` javascript
this.cb && this.cb(this.current);
```

在什么地方调用 listen 方法呢？

在 index.js 文件中的 init 方法中完成 listen 方法的调用。

``` javascript
// 注册路由变化的事件(初始化事件监听器，监听路由地址的变化)。
  init(app) {
    const history = this.history;
    const setUpListener = () => {
      history.setUpListener();
    };
    history.transitionTo(
      history.getCurrentLocation(),
      //如果直接history.setUpListener
      // 这样的话setUpListener里面的this会有问题。
      setUpListener
    );
    //调用父类的中的listen方法
    history.listen((route) => {
      app._route = route;
    });
  }
```

在上面的代码中调用了父类中的 listen 方法，然后将箭头函数传递到了 listen 中。

这时候，在 transitionTo 方法中调用 cb，也就是调用箭头函数，这时传递过来的参数 route,为当前更改后的路由规则信息，交给了 app 中的\_route 属性。

app 这个参数其实就是 Vue 的实例，因为在 install.js 文件中调用了 init 方法，并且传递的就是 Vue 的实例。

这样就完成了对 Vue 实例上的响应式属性\_route 值的修改，从而会更新组件。

### $route/$router 创建

创建$route与$router 的目的是能够在所有的 Vue 实例(组件)中，可以获取到。

$route 是路由规则对象，包含了 path,component 等内容

$router 为路由对象（ViewRouter 对象）。

通过查看源码(install.js)可以发现，其实就是将$router 与$route 挂载到了 Vue 的原型上。

所以可以直接将源码内容复制过来就可以了。

``` javascript
Object.defineProperty(Vue.prototype, "$router", {
  get() {
    return this._routerRoot._router;
  },
});

Object.defineProperty(Vue.prototype, "$route", {
  get() {
    return this._routerRoot._route;
  },
});
```

通过上面的代码，可以看到$route与$router 都是只读的，因为对应的值，在前面已经设置完毕，这里只是获取。

$router 是通过\_routerRoot 来获取。

$route 是通过\_routerRoot.\_route 来获取。

``` javascript
Vue.util.defineReactive(this, "_route", this._router.history.current);
```

在 Vue 对象上创建了\_route 属性，该属性的值为路由规则内容

### Router-View 创建

router-view 就是一个占位符，会用具体的组件来替换该占位符。

router-view 的创建过程如下：

获取当前组件的$route 路由规则对象
找到路由规则对象里面的 matched 匹配的 record(里面有 component)
如果是/about ,matched 匹配到一个 record，直接渲染对应的组件
如果是/about/users,matched 匹配到两个 record（第一个是父组件，第二个是子组件）
my-Vue-router/components 目录下的 view.js 代码如下：

``` javascript
export default {
  render(h) {
    //获取当前匹配的路由规则对象
    const route = this.$route;
    //获取路由记录对象.只有一个内容，所以获取的是`matched`中的第一项。
    const record = route.matched[0];
    if (!record) {
      return h();
    }
    //获取记录中对应的组件
    const component = record.component;
    return h(component);
  },
};
```

以上的代码处理的是没有子路由的情况。

下面，看一下子路由情况的处理。

当然在编写子路由的处理代码之前，我们先把案例中的路由完善一下。

在 src 目录下的 App.Vue 这个组件中，添加一个“关于”的链接。

``` javascript
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/login">Login</router-link>
      <router-link to="/about">About</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {};
</script>
```

对应在 About 这个组件中，完成子路由应用

``` javascript
<template>
  <div>
    关于组件
    <router-link to="/about/users">用户</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
export default {};
</script>

```

下面完善一下对子路由的处理。

``` javascript
export default {
  render(h) {
    //获取当前匹配的路由规则对象
    const route = this.$route;
    let depth = 0;
    //记录当前组件为RouterView
    this.routerView = true;
    let parent = this.$parent;
    while (parent) {
      if (parent.routerView) {
        depth++;
      }
      parent = parent.$parent;
    }
    //获取路由记录对象.
    // 如果是子路由，例如：子路由/about/users
    //子路由是有两部分内容，matched[0]:是父组件内容，matched[1]是子组件内容
    const record = route.matched[depth];
    if (!record) {
      return h();
    }
    //获取记录中对应的组件
    const component = record.component;
    return h(component);
  },
};
```

假如，现在我们在浏览器的地址栏中输入了：`http://localhost:8080/#/about` 地址，

是没有父组件，那么 depth 属性的值为 0，这时候获取的第一个组件然后进行渲染。

如果地址栏的内容为：`http://localhost:8080/#/about/users `这时候有子组件。对应的获取对应的父组件内容，开始进行循环。

的属性\_route.

``` javascript
Vue.util.defineReactive(this, “_route”, this._router.history.current);
```

下面要考虑的就是当路由地址发生了变化后，需要修改`_route`属性的值。

在哪完成`_route`属性值的修改呢？

在`base.js`文件中，因为在该文件中定义了`transitionTo`方法，而该方法就是用来完成地址的跳转，同时完成组件的渲染。

`base.js`文件修改后的代码如下：

``` javascript
import createRoute from "../util/route";
export default class History {
  // router路由对象ViewRouter
  constructor(router) {
    this.router = router;
    this.current = createRoute(null, "/");
    //这个回调函数是在hashhistory中赋值，作用是更改Vue实例上的_route，_route的值发生变化，视图会进行刷新操作
    this.cb = null;
  }
  //给cb赋值
  listen(cb) {
    this.cb = cb;
  }

  transitionTo(path, onComplete) {
    this.current = this.router.matcher.match(path);
    // 调用cb
    this.cb && this.cb(this.current);
    // console.log("current===", this.current);

    //该回调函数在调用transitionTo方法的时候，会传递过来。
    onComplete && onComplete();
  }
}
```

在 History 中的构造方法中初始化 cb 函数。

``` javascript
this.cb = null;
```

定义 listen 方法给 cb 函数赋值。

``` javascript
//给cb赋值
  listen(cb) {
    this.cb = cb;
  }
```

在 transitionTo 方法中调用 cb 函数，同时传递获取到的当前的路由规则对象也就是路由记录信息。

``` javascript
this.cb && this.cb(this.current);
```

在什么地方调用 listen 方法呢？

在 index.js 文件中的 init 方法中完成 listen 方法的调用。

``` javascript
// 注册路由变化的事件(初始化事件监听器，监听路由地址的变化)。
  init(app) {
    const history = this.history;
    const setUpListener = () => {
      history.setUpListener();
    };
    history.transitionTo(
      history.getCurrentLocation(),
      //如果直接history.setUpListener
      // 这样的话setUpListener里面的this会有问题。
      setUpListener
    );
    //调用父类的中的listen方法
    history.listen((route) => {
      app._route = route;
    });
  }
```

在上面的代码中调用了父类中的 listen 方法，然后将箭头函数传递到了 listen 中。

这时候，在 transitionTo 方法中调用 cb，也就是调用箭头函数，这时传递过来的参数 route,为当前更改后的路由规则信息，交给了 app 中的\_route 属性。

app 这个参数其实就是 Vue 的实例，因为在 install.js 文件中调用了 init 方法，并且传递的就是 Vue 的实例。

这样就完成了对 Vue 实例上的响应式属性\_route 值的修改，从而会更新组件。

### $route/$router 创建

创建$route与$router 的目的是能够在所有的 Vue 实例(组件)中，可以获取到。

$route 是路由规则对象，包含了 path,component 等内容

$router 为路由对象（ViewRouter 对象）。

通过查看源码(install.js)可以发现，其实就是将$router 与$route 挂载到了 Vue 的原型上。

所以可以直接将源码内容复制过来就可以了。

``` javascript
Object.defineProperty(Vue.prototype, "$router", {
  get() {
    return this._routerRoot._router;
  },
});

Object.defineProperty(Vue.prototype, "$route", {
  get() {
    return this._routerRoot._route;
  },
});
```

通过上面的代码，可以看到$route与$router 都是只读的，因为对应的值，在前面已经设置完毕，这里只是获取。

$router 是通过\_routerRoot 来获取。

$route 是通过\_routerRoot.\_route 来获取。

``` javascript
Vue.util.defineReactive(this, "_route", this._router.history.current);
```

在 Vue 对象上创建了\_route 属性，该属性的值为路由规则内容

### Router-View 创建

router-view 就是一个占位符，会用具体的组件来替换该占位符。

router-view 的创建过程如下：

获取当前组件的$route 路由规则对象
找到路由规则对象里面的 matched 匹配的 record(里面有 component)
如果是/about ,matched 匹配到一个 record，直接渲染对应的组件
如果是/about/users,matched 匹配到两个 record（第一个是父组件，第二个是子组件）
my-Vue-router/components 目录下的 view.js 代码如下：

``` javascript
export default {
  render(h) {
    //获取当前匹配的路由规则对象
    const route = this.$route;
    //获取路由记录对象.只有一个内容，所以获取的是`matched`中的第一项。
    const record = route.matched[0];
    if (!record) {
      return h();
    }
    //获取记录中对应的组件
    const component = record.component;
    return h(component);
  },
};
```

以上的代码处理的是没有子路由的情况。

下面，看一下子路由情况的处理。

当然在编写子路由的处理代码之前，我们先把案例中的路由完善一下。

在 src 目录下的 App.Vue 这个组件中，添加一个“关于”的链接。

``` javascript
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/login">Login</router-link>
      <router-link to="/about">About</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {};
</script>
```

对应在 About 这个组件中，完成子路由应用

``` javascript
<template>
  <div>
    关于组件
    <router-link to="/about/users">用户</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
export default {};
</script>

<style>
</style>
```

下面完善一下对子路由的处理。

``` javascript
export default {
  render(h) {
    //获取当前匹配的路由规则对象
    const route = this.$route;
    let depth = 0;
    //记录当前组件为RouterView
    this.routerView = true;
    let parent = this.$parent;
    while (parent) {
      if (parent.routerView) {
        depth++;
      }
      parent = parent.$parent;
    }
    //获取路由记录对象.
    // 如果是子路由，例如：子路由/about/users
    //子路由是有两部分内容，matched[0]:是父组件内容，matched[1]是子组件内容
    const record = route.matched[depth];
    if (!record) {
      return h();
    }
    //获取记录中对应的组件
    const component = record.component;
    return h(component);
  },
};
```

假如，现在我们在浏览器的地址栏中输入了：`http://localhost:8080/#/about` 地址，

是没有父组件，那么 depth 属性的值为 0，这时候获取的第一个组件然后进行渲染。

如果地址栏的内容为：`http://localhost:8080/#/about/users` 这时候有子组件。对应的获取对应的父组件内容，开始进行循环。

在循环的时候，做了一个判断，判断的条件就是当前的父组件必须为:RouterView 组件（子组件中 router-view 与父组件中的 router-view 构成了父子关系），才让 depth 加 1，然后取出子组件进行渲染。
