---
title: Vite实现原理与简单实现
aside: true
editLink: false
lastUpdated: false
showComment: false
showSidebar: true
---

# vite的实现原理及简单实现

## vite的实现原理
vite 在浏览器端使用ES6的 export、import 的方式导入、导出模块，同时实现了按需加载。vite 高度依赖 module script 特性。

处理步骤如下:

- 使用 koa 的中间件里获取请求 body 数据返回给浏览器
- 通过 es-module-lexer 解析源源文件资源，生成 AST，从而获取到 import 的内容
- 判断 import 的资源是否是 npm 模块
- 返回处理后的处理资源路径为："xxx" => "/@modules/xxx" 如：import { createApp } from '/@modules/vue'
- 将处理的 template, script, style 等内容所需的依赖以 http 请求的形式，通过 query 参数形式区分并加载SFC文件各个模块内容。

## 简单实现 vite
### 安装依赖
```bash
npm install es-module-lexer koa koa-static magic-string
```
- koa、koa-static 是vite的内部做服务开发
- es-module-lexer 分析 ES6import语法
- magic-string 实现重写字符串内容

```js
入口文件
// vite/src/server.js

const Koa = require('koa');

function createServer() {
    const app = new Koa();
    const root = process.cwd(); // 当前命令执行的路径

    // 构建上下文对象
    const context = { app, root };
    // 插件集合
    const resolvedPlugins = [];

    app.use((ctx, next) => {
        // 扩展 ctx 属性
        Object.assign(ctx, context);
        return next();
    });

    // 依次注册所有插件
    resolvedPlugins.forEach(plugin => plugin(context));
    return app;
}

createServer().listen(9999, () => {
    console.log('Vite Serve Start Port: 9999');
});
```

### 静态服务配置

```js
引入中间插件
// vite/src/server.js

const serveStaticPlugin = require('./serverPluginServeStatic');
// 插件集合
const resolvedPlugins = [
    serveStaticPlugin
];
```

指定当前目录下的文件和 public 目录下的文件可以直接被访问

```bash
// vite/src/serverPluginServeStatic.js

const static = require('koa-static');
const path = require('path');

function serveStaticPlugin ({app, root}) {
    // 以当前根目录作为静态目录
    app.use(static(root));
    // 以 public 目录作为根目录
    app.use(static(path.resolve(root, 'public')))
}


module.exports = serveStaticPlugin;
```


### 重写模块路径
ES6 模块会自动发送请求查找到响应文件，比如：import App from '/App.vue' 、import App from './App.vue'、import App from '../App.vue'

注意： import { createApp } from 'vue' 引入方式会报错：

Uncaught TypeError: Failed to resolve module specifier "vue". Relative references must start with either "/", "./", or "../".

vite的解决方案是: /@modules/xxx

比如： import { createApp } from '/@modules/vue'

引入中间插件
```js
// vite/src/server.js

const serveStaticPlugin = require('./serverPluginServeStatic');
const moduleRewritePlugin = require('./serverPluginModuleRewrite');
// 插件集合
const resolvedPlugins = [
    moduleRewritePlugin,
    serveStaticPlugin
];
```
对js文件中的 import 语法进行路径的重写，改写后的路径会再次向服务器拦截请求
```js
// vite/src/serverPluginModuleRewrite.js

const { parse } = require('es-module-lexer');
const MagicString = require('magic-string');

const { readBody } = require("./utils");

function serverPluginModuleRewrite({ app, root }) {
    app.use(async (ctx, next) => {

        await next();

        // 对类型是 js 的文件进行拦截处理
        if (ctx.body && ctx.response.is('js')) {
            // 读取文件中的内容
            const content = await readBody(ctx.body);
            // 重写 import 中无法识别的路径返回处理后的文件内容
            const rc = rewriteImports(content);

            /*
            rc就是修改后的内容：
            + import { createApp } from '/@modules/vue'
            // ....
            */
            ctx.body = rc;
        }
    })
}

// 重写请求路径 /@modules/xxx
function rewriteImports(source) {
    const imports = parse(source)[0];
    const magicString = new MagicString(source);

    if (imports.length) {
        for (let i = 0; i < imports.length; i++) {
            const { s, e } = imports[i];
            let id = source.substring(s, e);
            if (/^[^\/\.]/.test(id)) {
                id = `/@modules/${id}`;
                // 修改路径增加 /@modules 前缀
                magicString.overwrite(s, e, id);
            }
        }
    }
    return magicString.toString();
}

module.exports = serverPluginModuleRewrite;
```
utils.js
```js
// vite/src/utils.js

const { Readable } = require('stream');

function readBody(stream) {
    if (stream instanceof Readable) {
        return new Promise((resolve, reject) => {
            try {
                let res = '';
                stream
                    .on('data', (chunk) => res += chunk)
                    .on('end', () => resolve(res));
            } catch (error) {
                reject(error);
            }
        })
    } else {
        return stream.toString();
    }
}

exports.readBody = readBody;
```
### 解析 /@modules 引入的文件

- 引入中间插件

```js
// vite/src/server.js

const moduleResolvePlugin = require('./serverPluginModuleResolve');

const resolvedPlugins = [
    moduleRewritePlugin,
    moduleResolvePlugin,
    serveStaticPlugin
];
```

- 将 /@modules 开头的路径解析成对应的真实文件，返回给浏览器，这样请求的路径对应文件就正确了

```js
// vite/src/serverPluginModuleResolve.js

const fs = require('fs').promises;

const { resolveVue } = require('./utils');

function serverPluginModuleResolve({ app, root }) {
    const moduleRE = /^\/@modules\//;

    // 编译的模块使用commonjs规范,其他文件均使用es6模块
    const vueResolved = resolveVue(root);

    app.use(async (ctx, next) => {
        // 对 /@modules 开头的路径进行映射
        if (!moduleRE.test(ctx.path)) {
            return next();
        }
        // 去掉 /@modules/路径
        const id = ctx.path.replace(moduleRE, '');
        ctx.type = 'js';
        const content = await fs.readFile(vueResolved[id], 'utf8');
        ctx.body = content;
    });
}

module.exports = serverPluginModuleResolve;
```

utils.js

```js
// vite/src/utils.js

function resolveVue(root) {
    const compilerPkgPath = path.resolve(root, 'node_modules', '@vue/compiler-sfc/package.json');
    const compilerPkg = require(compilerPkgPath);
    // 编译模块的路径 node 中编译
    const compilerPath = path.join(path.dirname(compilerPkgPath), compilerPkg.main);
    const resolvePath = (name) => path.resolve(root, 'node_modules', `@vue/${name}/dist/${name}.esm-bundler.js`);
    // dom 运行
    const runtimeDomPath = resolvePath('runtime-dom');
    // 核心运行
    const runtimeCorePath = resolvePath('runtime-core');
    // 响应式模块
    const reactivityPath = resolvePath('reactivity');
    // 共享模块
    const sharedPath = resolvePath('shared');
    return {
        vue: runtimeDomPath,
        '@vue/runtime-dom': runtimeDomPath,
        '@vue/runtime-core': runtimeCorePath,
        '@vue/reactivity': reactivityPath,
        '@vue/shared': sharedPath,
        compiler: compilerPath,
    }
}

exports.resolveVue = resolveVue;
```

解析浏览器认识 .vue 的文件

调用 @vue/compiler-sfc 来编译
```js
const path = require('path');
const fs = require('fs').promises;

const { resolveVue } = require('./utils');

const defaultExportRE = /((?:^|\n|;)\s*)export default/;

function serverPluginVue({ app, root }) {
    app.use(async (ctx, next) => {
        if (!ctx.path.endsWith('.vue')) {
            return next();
        }
        // .vue 文件路径处理
        const filePath = path.join(root, ctx.path);
        // 获取文件内容
        const content = await fs.readFile(filePath, 'utf8');
        
        // 获取文件内容 （拿到 @vue/compiler-sfc 来编译 .vue 的文件）
        const { parse, compileTemplate } = require(resolveVue(root).compiler);
        // 使用 @vue/compiler-sfc来编译 .vue 的文件
        const { descriptor } = parse(content); // 解析文件内容
        
        if (!ctx.query.type) {
            let code = ``;
            if (descriptor.script) {
                const content = descriptor.script.content;
                const replaced = content.replace(defaultExportRE, '$1const __script =');
                code += replaced;
            }
            if (descriptor.template) {
                const templateRequest = ctx.path + `?type=template`;
                code += `\nimport { render as __render } from ${JSON.stringify(templateRequest)}`;
                code += `\n__script.render = __render`;
            }
            ctx.type = 'js';
            code += `\nexport default __script`;

            ctx.body = code;
        }
        if (ctx.query.type == 'template') {
            ctx.type = 'js';
            const content = descriptor.template.content;
            // 将文件中的引入的模板再次解析
            const { code } = compileTemplate({ source: content });

            ctx.body = code;
        }
    })
}

module.exports = serverPluginVue;
```