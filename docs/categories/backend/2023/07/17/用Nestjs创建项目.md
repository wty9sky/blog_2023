---
title: Nestjs快速上手
aside: true
editLink: false
lastUpdated: false
showComment: false
---

# Nestjs 快速上手

**NestJS** 是一个用于构建高效、可扩展的 **Node.js** 服务器端应用程序的框架。它采用了渐进式 **JavaScript** ，使用 **TypeScript** 构建并完全支持 **TypeScript**（但仍允许开发人员使用纯**JavaScript** 编码），并结合了**OOP**（面向对象编程）、**FP**（面向函数编程）和 **FRP**（面向函数的响应式编程）的元素。

## 快速创建项目

全局安装脚手架并启用严格模式创建项目；

```powershell
## 全局安装脚手架
npm i -g @nestjs/cli
## 启用 Typescript 严格模式创建项目
nest new project --strict
```

## 熟悉关键文件

`src`目录是主要的源码目录，主要由入口文件 `main.ts` 和 一组 `module`，`service`，`controller`构成。

```
project
├─ src
│  ├─ app.controller.ts		     # 业务数据交互的入口，实现数据在前后端的交互
│  ├─ app.service.ts           # 封装业务逻辑，将重复的业务逻辑在服务层进行封装
│  ├─ app.module.ts            # 负责模块的管理，通常 app.module 负责全局模块的管理
│  └─ main.ts                  # 入口文件，创建应用实例
├─ README.md
├─ nest-cli.json
├─ package.json
├─ tsconfig.build.json
└─ tsconfig.json
```

## 运行应用程序

1. 普通启动模式：`npm run start`
2. 监听启动模式：`npm run start:dev`
3. 调试启动模式：`npm run start:debug`

## 从模块管理开始

**Nestjs** 是典型的采用模块化组织应用结构的框架，通过上图可以看到，整个应用由一个根模块(**Application Module**)和多个功能模块共同组成。

### 创建模块：

- 完整命令：`nest generate module <module-name>`
- 简写命令：`nest g mo <module-name>`

每个模块都是一个由`@Module()`装饰器注释的类，应用中模块间的关系将由`@Module()`装饰器中携带的所有元数据描述。

```tsx
import { Module } from "@nestjs/common";

@Module({
  providers: [],
  imports: [],
  controllers: [],
  exports: [],
})
export class OrdersModule {}
```

### @Module() 元数据

通过 **Orders** 模块了解`@Module()`元数据如何组织模块：

/tab

| providers   | 注册订单提供者模块，如：负责订单 CRUD 的服务；               |
| ----------- | ------------------------------------------------------------ |
| controllers | 注册订单控制器模块，如：负责订单 CRUD 的路由处理；           |
| imports     | 注册与订单相关联的模块，如：与订单关联的用户查询服务；       |
| exports     | 导出订单提供者模块，如：用户查询需要订单提供者统计订单数量； |

💡 PS：**Orders** 模块通过`exports`将订单提供者模块导出的行为称为**模块共享**；

### 模块再导出

一个模块仅负责将一系列相关联的模块通过`imports`导入，紧接着就通过`exports`全部导出的行为就是模块在导出，利用**模块再导出**的能力，可以减少大量关联模块重复导入造成的负担。

```tsx
@Module({
  imports: [DatabaseModule, RedisModule, MongoModule],
  exports: [DatabaseModule, RedisModule, MongoModule],
})
export class ConnectionModule {}
```

💡 PS：在需要同时使用数据库连接、Redis 连接、Mongo 连接的情况下仅需要导 **ConnectionModule** 模块即可。

### 全局模块

如果需要 **ConnectionModule** 模块在任何地方都能开箱即用，那可以为其增加 `@Global()` 装饰器；

```tsx
@Global()
@Module({
  imports: [DatabaseModule, RedisModule, MongoModule],
  exports: [DatabaseModule, RedisModule, MongoModule],
})
export class ConnectionModule {}
```

## 控制器的使用

控制器用来接收和处理客户端发起的特定请求，不同的客户端请求将由 **Nestjs** 路由机制分配到对应的控制器进行处理。

### 创建控制器

- 完整命令：`nest generate controller <controller-name>`
- 简写命令：`nest g co <controller-name>`

控制器是使用`@Controller(’path’)`装饰器注释的类，其中`path`是一个可选的路由路径前缀，通过`path`可以将相关的路由进行分组。

```tsx
import { Controller, Get } from "@nestjs/common";

@Controller("orders")
export class OrdersController {
  @Get()
  index() {
    return "This is the order controller";
  }
}
```

💡 小结：

1. 当客户端通过 **GET** 方法对 `orders` 路由发送请求时将由 `index()` 处理函数响应。
2. 除`@Get()`装饰器外，**Nestjs** 还为 **HTTP** 标准方法提供的装饰有`@Post()`、`@Put()`、`@Delete()`、`@Patch()`、`@Options()`和`@Head()`，以及`@All()`用来处理所有的情况。
3. `@Controller(’path’)`中的 `path` 从设计上虽为可选参数，但在实际项目中未避免混乱会在创建控制器后优先分配 `path`。

### 读取请求对象

请求对象表示一个 **HTTP** 请求所携带的数据信息，如请求数据中的查询参数、路由参数、请求头、请求体等数据。通过在 **OrdersController** 控制器中编写更多的处理方法来演示接收不同的 **HTTP** 方法和不同位置的参数：

1. 通过 **GET** 方法获取订单列表数据，并通过**查询参数**传递订单分页数据：

```tsx
@Get('list')
list(@Query('page') page: number, @Query('limit') limit: number) {
  return `获取第${page}页，每页${limit}条订单`;
}
```

```powershell
curl --request GET \
  --url 'http://localhost:3000/orders/list?page=1&limit=20'
```

1. 通过 **GET** 方法查询指定 ID 的订单详情，并通过**路由参数**传递订单 ID；

```tsx
@Get('detail/:id')
findById(@Param() param: { id: number }) {
  return `获取 ID 为 ${param.id} 的订单详情`;
}
```

```powershell
curl --request GET \
  --url http://localhost:3000/orders/detail/1
```

1. 通过 **PATCH** 方法更新指定 ID 订单的最新状态，并通过路由参数传递订单 ID 及最新状态；

```tsx
@Patch(':id/:status')
updateByIdAndStatus(
  @Param('id') id: number,
  @Param('status') status: string,
) {
  return `将 ID 为 ${id} 订单状态更新为 ${status}`;
}
```

```powershell
curl --request PATCH \
  --url 'http://localhost:3000/orders/1/已退款'
```

1. 通过 **POST** 方法创建一个新的订单，并通过请求体 **Body** 接收订单数据；

```tsx
interface ICreateOrder {
  article: string;
  price: number;
  count: number;
  source: string;
}

@Post()
create(@Body() order: ICreateOrder) {
  return `创建订单，订单信息为 ${JSON.stringify(order)}`;
}
```

```powershell
curl --request POST \
  --url http://localhost:3000/orders \
  --header 'content-type: application/json' \
  --data '{
	"article": "HUAWEI-Meta60",
	"price": 5999,
	"count": 1,
	"source": "Made in China"
}'
```

💡 小结：

1. 控制器中不同的处理函数可以通过 **HTTP** 方法来区分；
2. 当多个处理函数需要使用相同的 **HTTP** 方法时需要添加处理函数级别的路由以示区分；
3. `@Param()`未指定参数时表示所有路由参数的集合，指定参数时表示对应指定的参数，`@Query()`与`@Param()`具有相同的特点。

### 更多装饰器

1. @Header(key, value)：

```tsx
@Post()
@Header('Cache-Control', 'none')
create(@Body() createOrderDto: CreateOrderDto) {
  return this.ordersService.create(createOrderDto);
}
```

1. @Redirect(res, statusCode)

```tsx
@Get(':id')
@Redirect('https://nestjs.com/', 301)
findOne(@Param('id') id: string) {
  return this.ordersService.findOne(+id);
}
```

💡 小结：

1. 301：资源被永久重定向到新的资源，客户端需要考虑同步更新；
2. 302：资源被临时重定向到新的资源，如：服务端升级时会启用临时资源；

下面列出的内置装饰器可简化请求数据信息的读取：

| @Request(), @Req()      | req                             |
| ----------------------- | ------------------------------- |
| @Response(), @Res()\*   | res                             |
| @Next()                 | next                            |
| @Session()              | req.session                     |
| @Param(key?: string)    | req.params / req.params[key]    |
| @Body(key?: string)     | req.body / req.body[key]        |
| @Query(key?: string)    | req.query / req.query[key]      |
| @Headers(name?: string) | req.headers / req.headers[name] |
| @Ip()                   | req.ip                          |
| @HostParam()            | req.hosts                       |

## 提供者的使用

在 Nestjs 中将提供服务的类及一些工厂类、助手类等称作提供者，它们同时均可以通过注入的方式作为依赖模块；

### 创建服务

- 完整命令：`nest generate service orders`；
- 简写命令：`nest g s orders`；

服务是典型的提供者，HTTP 请求在经过控制器处理后应该将复杂的任务交由服务层进行处理，如：将复杂的订单生成、查询、更新及删除等操作进行封装。

```tsx
import { Injectable } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Injectable()
export class OrdersService {
  create(createOrderDto: CreateOrderDto) {
    return "This action adds a new order";
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
```

💡 PS：**Nestjs** 应用启动时必须解析全部依赖，因此每个提供者都将实例化完成，同时在应用停止后每个提供者将全部被销毁，所以默认的提供者生命周期同应用的生命周期。

### 注入并使用

将 **OrdersService** 通过构造函数注入到 **OrdersController** 控制器，这样就得到了初始化后的 **ordersService** 成员，接着就可以在不同的处理函数调用服务中提供的能力。

```tsx
import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ordersService.findOne(+id);
  }
}
```

💡 PS：

除构造函数注入的这种方式外，还可以通过属性注入：

```tsx
@Inject()
private readonly ordersService: OrdersService;
```

## 中间件的使用

中间件是路由处理程序之前运行的函数，在中间件中可以访问 request 和 response 对象，以及将控制权传递给下一个中间件的`next()`函数。

### 创建中间件

- 完整命令：`nest generate middleware <middleware-name>`
- 简写命令：`nest g mi <middleware-name>`

中间件是一个使用`@Injectable()`装饰器注释且实现**NestMiddleware**接口的类，

```tsx
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const start = process.hrtime();
    res.on("finish", () => {
      const diff = process.hrtime(start);
      const time = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
      console.log(`${req.method} ${req.url} - ${time}ms`);
    });
    next();
  }
}
```

💡 PS：对于没有属性、没有额外的函数也没有额外的依赖的情况下，可以用一个普通的函数来表示中间件，这类中间件成为**功能类中间件**。

### 注册中间件

中间件的注册于控制器和提供者的注册方式不同，需要在消费中间件的模块通过继承 **NestModule** 并实现 `configure` 接口，如下面我们在订单模块中注册了这个 **Logger** 中间件：

```tsx
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { LoggerMiddleware } from "src/logger/logger.middleware";

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("orders");
  }
}
```

💡 PS：`forRoutes()`支持多种形式的参数来表示生效的范围，如：单字符串、多个字符串、RouteInfo 对象、单个控制器类或多个控制器类。

### 范围控制

**MiddlewareConsumer** 提供了`exclude`函数来按规则排除一些不应用中间件的路由，具体的规则可见 [path-to-regexp](https://github.com/pillarjs/path-to-regexp#parameters)：

```tsx
// 基于具体路由配置及模式匹配的排除方案
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: "orders", method: RequestMethod.GET },
    { path: "orders", method: RequestMethod.POST },
    "orders/(.*)"
  )
  .forRoutes("orders");
```

**MiddlewareConsumer** 提供的 `forRoutes`支持下面这种模式匹配的方式：

```tsx
forRoutes({ path: "ab*cd", method: RequestMethod.ALL });
```

### 中间件串联

当一个中间件处理完成后，如果请求还没有结束将有`next()`函数将控制权向下传递。如下面这个示例：为了允许客户端发起跨域访问，在 **Cors** 中间件中为每一个请求添加特殊的请求头后再交由 **Logger** 中间件继续执行。

```tsx
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    res.header("Access-Control-Allow-Origin", "*"); // 允许所有来源
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization"); // 允许指定的请求头
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    ); // 允许指定的请求方法
    next();
  }
}
```

```tsx
export class OrdersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware, LoggerMiddleware).forRoutes("orders");
  }
}
```

### 全局中间件

全局注册 **类中间件**，可以在根模块 **AppModule** 中注册，使用通配符的形式表示 `forRoutes('*')`：

```tsx
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware, LoggerMiddleware).forRoutes("*");
  }
}
```

如果需要全局注册 **功能类中间件** ，那么就可以在创建 **app** 实例后，通过 `app.use('')` 函数注册：

```tsx
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(3000);
```

## 守卫的使用

守卫依据服务运行期间的权限、角色及访问控制列表等条件来确定客户端的访问是否交由路由处理程序处理。相比于传统的中间件充当守卫的角色而言 ，NestJS 提供的守卫支持访问`ExecutionContext` \*\*\*\*实例，因此可以明确知道接着要执行什么。

### 创建守卫

- 完整命令：`nest generate guard <guard-name>`
- 简写命令：`nest g gu <guard-name>`

守卫也是一个使用`@Injectable()`装饰器注释的类，它需要实现 `CanActivate` 接口：

```tsx
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
```

### 基于角色守卫

首先要使用`Reflector`创建一个用来分配角色的装饰器，然后在对应的路由处理函数上添加这个装饰器并分配权限；

```tsx
import { Reflector } from "@nestjs/core";

export const Roles = Reflector.createDecorator<string[]>();
```

```tsx

@Roles(['admin'])
@Post()
create(@Body() createOrderDto: CreateOrderDto) {
  return this.ordersService.create(createOrderDto);
}
```

接着在`RolesGuard` 中通过 **执行上下文类** 获取被调用处理函数的引用，并注入`Reflector`来提取处理函数被分配的角色：

```tsx
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Roles } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const handler = context.getHandler();
    const roles = this.reflector.get<string[]>(Roles, handler);
    console.log(roles); // output ['admin']
    return true;
  }
}
```

现在假设与客户端协商通过 **Header** 中添加 `role` 属性来传递角色信息，那么在`RolesGuard`中可以通过执行上下文获取 **Request** 对象中的请求头数据，最后对比角色列表，并返回是否包含角色的结果：

```
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Roles } from './roles.decorator';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const handler = context.getHandler();
    const roles = this.reflector.get<string[]>(Roles, handler);
    const request: Request = context.switchToHttp().getRequest();
    const role = request.headers['role'] || '';
    return roles.includes(role as string);
  }
}
```

### 绑定守卫

控制器范围绑定：

```tsx
@Controller("orders")
@UseGuards(RolesGuard)
export class OrdersController {}

// or

@Controller("orders")
@UseGuards(new RolesGuard())
export class OrdersController {}
```

全局范围绑定：

```tsx
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new RolesGuard());

// or

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

## 拦截器的使用

拦截器是应用 AOP 切面编程模式来对路由处理函数进行功能扩展的技术，通过拦截器可以扩展下面这些能力：

- 在方法执行之前/之后绑定额外的逻辑
- 转换函数返回的结果
- 转换函数抛出的异常
- 扩展基本功能行为
- 根据特定条件完全覆盖函数（例如，缓存）

### 创建拦截器

- 完整命令：`nest generate interceptor <interceptor-name>`
- 简写命令：`nest g itc <interceptor-name>`

拦截器也是一个使用`@Injectable()`装饰器注释的类，它需要实现 `NestInterceptor` 接口：

```tsx
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class TimerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle();
  }
}
```

### 记录执行时间

当客户端的请求触发到 **TimerInterceptor** 拦截器时，将获取到请求对象实例，并记录下了请求进入的时间点；

当 `next.handle()` 函数返回结果后表示对应的路由处理函数已经执行完成。通过返回的 **Observable** 对象，可以在其管道中使用 `tap` 操作符记录结束时间并打印执行时长信息。

```tsx
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class TimerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const start = process.hrtime();

    return next.handle().pipe(
      tap(() => {
        const diff = process.hrtime(start);
        const time = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
        console.log(`${req.method} ${req.url} - ${time}ms`);
      })
    );
  }
}
```

### 绑定拦截器

控制器范围绑定：

```tsx
@UseInterceptors(TimerInterceptor)
export class OrdersController {}

// or

@UseInterceptors(new TimerInterceptor())
export class OrdersController {}
```

全局范围绑定：

```tsx
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new TimerInterceptor());

// or

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TimerInterceptor,
    },
  ],
})
export class AppModule {}
```

### 更多应用案例

1. 响应映射：使用**Rxjs**提供的`map`操作符对处理函数返回的数据做二次加工：

```tsx
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return {
          time: new Date().toISOString(),
          data,
        };
      })
    );
  }
}
```

1. 异常映射：使用**Rxjs**提供的`catchError`操作符抛出指定的异常：

```tsx
@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(catchError((err) => throwError(() => new BadGatewayException())));
  }
}
```

1. 处理函数超时：使用**Rxjs**提供的`timeout`和`catchError`共同实现处理函数超时：

```tsx
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5 * 1000),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      })
    );
  }
}
```

## 异常过滤器的使用

**NestJS** 内置的 **全局异常过滤器** 负责处理应用中所有未处理的 **HttpException** 及其子类的异常，其他异常将由内置过滤器生成默认的 JSON 响应：

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

### 标准异常

通过实例化 **NestJs** 内置的 `HttpException` 类来抛出的异常为标准异常，下面的代码展示了由 `message` 和 `statusCode` 组成的标准示例：

```tsx
@Get()
findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```

下面的代码完全自定义了抛出异常的 **JSON** 响应体：

```tsx
@Get()
async findAll() {
  try {
    // TODO
  } catch (error) {
    throw new HttpException(
      {
        status: HttpStatus.FORBIDDEN,
        error: 'This is a custom message',
      },
      HttpStatus.FORBIDDEN,
      {
        cause: error,
      },
    );
  }
}
```

```json
{
  "status": 403,
  "error": "This is a custom message"
}
```

### 自定义异常

继承 `HttpException` 类可以封装符合自己项目的自定义异常，正如上面完全自定义抛出异常 **JSON** 响应体的代码。

```tsx
import { HttpException, HttpStatus } from "@nestjs/common";

export class ForbiddenException extends HttpException {
  constructor(message: string, error?: any) {
    super(
      {
        status: HttpStatus.FORBIDDEN,
        error: message,
      },
      HttpStatus.FORBIDDEN,
      {
        cause: error,
      }
    );
  }
}
```

在 `findAll` 函数将抛出标准异常改为自定义的 `ForbiddenException` 异常：

```tsx
@Get()
async findAll() {
  try {
    await this.ordersService.findAll();
  } catch (error) {
    throw new ForbiddenException('This is a custom message', error);
  }
}
```

### 内置 HTTP 异常

下面这些是 **NestJS** 内置的 **HTTP** 异常类，它们与上面自定义异常一样都是继承自**HttpException**。

- `BadRequestException`
- `UnauthorizedException`
- `NotFoundException`
- `ForbiddenException`
- `NotAcceptableException`
- `RequestTimeoutException`
- `ConflictException`
- `GoneException`
- `HttpVersionNotSupportedException`
- `PayloadTooLargeException`
- `UnsupportedMediaTypeException`
- `UnprocessableEntityException`
- `InternalServerErrorException`
- `NotImplementedException`
- `ImATeapotException`
- `MethodNotAllowedException`
- `BadGatewayException`
- `ServiceUnavailableException`
- `GatewayTimeoutException`
- `PreconditionFailedException`

### 创建 HTTP 异常过滤器

创建异常过滤器来接管内置的 **全局异常过滤器** 实现使用不同项目的异常捕获处理，如增加异常的日志记录或改变 **JSON** 模式。

1. 创建过滤器：
   - 全局命令：`nest generate filter <filter-name>`
   - 简写命令：`nest g f <filter-name>`

```tsx
import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";

@Catch()
export class HttpExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {}
}
```

1. 通过`@Catch()` 指定默认创建的过滤器为指定的 `HttpException` 过滤器：

```tsx
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    console.log(exception, host);
  }
}
```

通过执行上下文对象(`host`)中的 **request** 获取当前请求的地址，异常对象(`exception`)获取当前异常状态码，并执行上下文对象(`host`)中重构 **response** 响应格式，完成响应重构：

```tsx
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

💡  小结：

1. `exception` 为当前捕获到的异常对象；
2. `host` 是当前的执行上下文对象；

### 绑定过滤器

路由执行函数范围绑定：

```tsx
@Get()
@UseFilters(new HttpExceptionFilter())
async findAll() {
  try {
    await this.ordersService.findAll();
  } catch (error) {
    throw new ForbiddenException('This is a custom message', error);
  }
}

// or

@Get()
@UseFilters(HttpExceptionFilter)
async findAll() {
  try {
    await this.ordersService.findAll();
  } catch (error) {
    throw new ForbiddenException('This is a custom message', error);
  }
}
```

控制器范围绑定：

```tsx
@UseFilters(new HttpExceptionFilter())
export class OrdersController {}

// or

@UseFilters(HttpExceptionFilter)
export class OrdersController {}
```

全局范围绑定：

```tsx
const app = await NestFactory.create(AppModule);
app.useGlobalFilters(new HttpExceptionFilter());

// or

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
```

### 创建通用异常过滤器

在创建 **HTTP** 异常过滤器的时候使用 `@Catch()` 装饰器绑定了特定的 `HttpException`，接下来就创建一个脱离特定异常类且与平台无关的通用异常过滤器。

```tsx
// create command：`nest g f all-exceptions`
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
```

绑定通用异常过滤器：

```tsx
const { httpAdapter } = app.get(HttpAdapterHost);
app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
```

## 管道的使用

管道有两个典型的应用场景，其一是转换(将输入数据转换为所需要的形式，如，将字符串转为数字类型)，其二是校验(校验传入数据是否有效，无效时将抛出异常)数据是否有效。因此管道将运行在路由处理函数的 `arguments` 上。

### 绑定管道

NestJs 提供了 9 个开箱即用的内置管道(`ValidationPipe`，`ParseIntPipe`，`ParseFloatPipe`，`ParseBoolPipe`，`ParseArrayPipe`，`ParseUUIDPipe`，`ParseEnumPipe`，`DefaultValuePipe`，`ParseFilePipe`)，接着就尝试绑定 `ParseIntPipe` 到 `findOne` 处理函数 函数，获 **number** 类型 的 `id` 参数：

```tsx
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  console.log(typeof id); // number
  return this.ordersService.findOne(id);
}
```

如果传递的参数无法转换为数字则抛出如下的异常：

```json
{
  "statusCode": 400,
  "timestamp": "2023-12-09T14:42:20.014Z",
  "path": "/orders/a"
}
```

通过实例化 `ParseIntPipe` 对象定义转换失败后的错误码：

```tsx
@Get(':id')
  findOne(
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    id: number,
  ) {
    console.log(typeof id); // number
    return this.ordersService.findOne(id);
  }
```

### 基于 schema 的验证

**zod** 是用来定义 **schema** 和 进行验证的模块，基于管道可以很好的时间路由处理函数参数的验证：

1. 安装 **zod**：`npm install --save zod` ；
2. 创建管道：`nest generate pipe zod-validation` or `nest g pi zod-validation`；
3. 完善管道：利用注入的`ZodObject` 解析参数数据格式；

```tsx
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { ZodObject } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject<any>) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException("Validation failed");
    }
    return value;
  }
}
```

1. 定义 schema：

```tsx
import { z } from "zod";

export const createOrderSchema = z
  .object({
    orderId: z.string(),
    orderNo: z.string(),
    orderName: z.string(),
    orderStatus: z.string(),
    orderAmount: z.number(),
    createTime: z.date(),
    updateTime: z.date(),
  })
  .required();

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
```

1. 绑定管道：

```tsx
@Post()
@UsePipes(new ZodValidationPipe(createOrderSchema))
create(@Body() createOrderDto: CreateOrderDto) {
  return this.ordersService.create(createOrderDto);
}
```

### 基于 class 的验证

在 **NestJS** 中可以使用 **class-validator** 模块实现基于类和装饰器的形式进行参数验证。

1. 安装 **class-validator**：`npm i --save class-validator class-transformer` ;
2. 创建管道：`nest generate pipe validation` or `nest g pi validation`；
3. 完善管道：利用 `metatype` 提供的参数元类型验证参数；

```tsx
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException("Validation failed");
    }
    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Number, Date];
    return !types.includes(metatype);
  }
}
```

1. 重新绑定管道：

```tsx
@Post()
create(@Body(new ValidationPipe()) createOrderDto: CreateOrderDto) {
  return this.ordersService.create(createOrderDto);
}
```

💡 全局绑定管道：

```tsx
const app = await NestFactory.create(AppModule);
app.useGlobalPipes(new ValidationPipe());

// or

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
```

## 总结

本篇文章介绍了 Nestjs 的使用，包括创建项目和模块，控制器、服务、模块、中间件、异常过滤器、管道、守卫和拦截器的使用。控制器处理客户端请求，服务封装复杂的业务逻辑，模块管理所有控制器和提供者，中间件更改请求响应对象，异常过滤器处理所有未处理的异常，管道对客户端数据进行转换和验证，守卫根据特定的权限角色决定是否进行处理，拦截器对处理函数进行切面上的扩展。
