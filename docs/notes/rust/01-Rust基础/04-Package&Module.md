---
title: Package&Module
aside: true
editLink: false
lastUpdated: false
showComment: false
showDate: false
date: 2023-12-31 19:56:35
---

# Package，Crate，Module

## 代码组织

- 目前为止我们都是在一个文件中编写的，主要是为了方便学习 Rust 语言的语法和概念。
- 对于一个工程来讲，组织代码是十分重要的。
- 通过对相关功能进行分组和划分不同功能的代码，你可以清楚在哪里可以找到实现了特定功能的代码，以及在哪里可以改变一个功能的工作方式。

## 模块系统

- Package（包）：
  - Cargo 的特性，让你构建、测试、共享 Crate
- Crate（箱）：
  - 一个模块树（当你要编译时，你要编译的那个文件就叫 crate），它可以编译生成一个 二进制文件 或 多个库文件
- Module（模块）、use：
  - 让你控制代码的组织、作用域、私有路径
- Path（路径）：
  - 为 struct、function、module 等项命名的方式

### Package 与 Crate

- Crate 的类型有两种：
  - binary crate（二进制）编译后产生二进制文件的源文件就叫 binary crate
  - library crate（库）编译后产生二进制文件的源文件就叫 library crate
- Crate Root（Crate 的根）：是源代码文件

Rust 编译器从这里开始，如果里面含有 mod 声明，那么模块文件的内容将在编译之前被插入 crate 文件的相应声明处

- 一个 Package：
  - 包含一个 Cargo.toml，它描述了如何构建这些 Crates
  - 只能包含 0-1 个 library crate
  - 可以包含任意数量的 binary crate
  - 但至少包含一个 crate （library 或 binary）

### Cargo 的惯例

一个例子：

我们创建一个新的项目（一个项目就是一个包）

cargo new my-project1
官方文档：src/main.rs ，是一个与包同名的 binary crate 的 crate 根

解释：src/main.rs 被 Cargo 传递给编译器 rustc 编译后，产生与包同名的二进制文件

cargo new --lib my-project2
官方文档：src/lib.rs，是与包同名的 library crate 的 crate 根

解释：src/lib.rs 被 Cargo 传递给编译器 rustc 编译后，产生与包同名的库文件

Cargo 会默认把这个文件作为根

如果一个 Package 同时包含 src/main.rs 和 src/lib.rs
那就说明它有一个 binary crate 一个 library crate
一个 Package 有多个 binary crate 的情况下
文件要放在 src/bin 下
每个文件都是单独的 binary crate

### 定义 Module 来控制作用域和私有性

Module
在一个 crate 内，将代码进行分组
增加可读性，易于复用
public private
建立 Mudule：
cargo new --lib module
在 lib.rs 文件中写入 module

我们定义一个模块，是以 mod 关键字为起始，然后指定模块的名字（本例中叫做 front_of_house），并且用花括号包围模块的主体。在模块内，我们还可以定义其他的模块，就像本例中的 hosting 和 serving 模块。模块还可以保存一些定义的其他项，比如结构体、枚举、常量、特性、或者函数。

```rust
mod front_of_house {
mod hosting {
fn add_to_waitlist() {}

        fn seat_at_table() {}
    }

    mod serving {
        fn take_order() {}

        fn server_order() {}

        fn take_payment() {}
    }

}
```

在前面我们提到了，src/main.rs 和 src/lib.rs 叫做 crate 根。之所以这样叫它们的原因是，这两个文件的内容都是一个从名为 crate 的模块作为根的 crate 模块结构，称为 模块树（module tree）。这个就是 lib.rs 的模块树

crate
└── front_of_house
├── hosting
│ ├── add_to_waitlist
│ └── seat_at_table
└── serving
├── take_order
├── serve_order
└── take_payment

### 路径 PATH

为了在 Rust 的模块中找到某个条目，需要使用路径
路径的两周形式
绝对路径：从 crate root 开始，使用 crate 名 或 字面值 crate
相对路径：从当前模块开始，使用 self 、super 或当前模块的标识符
路径至少由一个标识符组成，标识符之间使用 ::
如果定义的部分和使用的部分总是一起移动，用相对路径，可以独立拆解出来，用绝对路径

```rust
mod front_of_house {
mod hosting {
fn add_to_waitlist() {
println!("1111");
}
}
}

fn main() {
crate::front_of_house::hosting::add_to_waitlist();//绝对路径

    front_of_house::hosting::add_to_waitlist();//相对路径

}
```

会报错 module hosting is private

为什么 crate 和 front_of_house 不报错而是从 hosting 开始呢?

因为 fn main 和 crate, front_of_house 一样都是根节点，根节点之间访问无论私有公有

能放入 mod 内部中的一切都是默认是私有的，要把改为共有 pub

额外知识点
父级模块无法访问子模块中的条目
子模块可以使用所有祖先模块中的条目
公有是 pub

```rust
mod front_of_house {
pub mod hosting {
pub fn add_to_waitlist() {
println!("1111");
}
}
}

fn main() {
crate::front_of_house::hosting::add_to_waitlist();

    front_of_house::hosting::add_to_waitlist();

}
```

super 的用法

```rust
fn serve_order() {}

mod back_of_house {
fn fix_incorrect_order() {
cook_order();
super::serve_order();
}

    fn cook_order() {}

}
```

用 super 表示所在代码块的父级，

也就是 fix_incorrect_order 的父级 mod back_of_house,然后在这个目录下去找到 serve_order 方法

pub struct
pub 放在 struct 前：
struct 是公共的
struct 中的字段默认是私有的

```rust
mod back_of_house {
pub struct Breakfast {
pub x: String,//公有
y: String,//私有
}
}
```

pub enum
pub 放在 enum 前面
enum 是公共的
enum 的变体也都是公共的

```rust
mod back_of_house {
pub enum Appetizer {
Soup,
Salad,
}
}
```

### use 关键字

可以使用 use 关键字将路径导入到作用域内
仍然遵守私有性规则

```rust
mod front_of_house {
pub mod hosting {
pub fn add_to_waitlist() {}
}
}

use crate::front_of_house::hosting;//绝对路径
use front_of_house::hosting; //相对路径

//相当于 在这里定义了
pub mod hosting {
pub fn add_to_waitlist() {}
}

pub fn eat_at_restaurant() {
hosting::add_to_waitlist();
hosting::add_to_waitlist();
hosting::add_to_waitlist();
}
```

函数：将函数的父级模块引入作用域是常用做法
下面这种做法可以，但并不是习惯方式。

```rust
mod front_of_house {
pub mod hosting {
pub fn add_to_waitlist() {}
}
}

use crate::front_of_house::hosting::add_to_waitlist;

pub fn eat_at_restaurant() {
add_to_waitlist();
}
struct，enum，其他：指定完整路径（指定到本身）
use std::collections::HashMap;

fn main() {
let mut map = HashMap::new();//直接指定到方法
map.insert(1, 2);
}
```

有一种情况两个不同的类，下面有同名的方法，我们不能指定本身，要加上父级路径

```rust
use std::fmt;
use std::io;

fn f1() -> fmt::Result {}//会报错因为没有返回值

fn f2() -> io::Result {}//会报错

fn main() {}
```

### as

我们有另外一种做法 as

as 关键字可以为引入的路径指定本地的别名

```rust
use std::fmt::Result;
use std::io::Result as IoResult;

fn f1() -> Result {}

fn f2() -> IoResult {}

fn main() {}
```

使用 pub use 重新导出名称

使用 use 将路径（名称）导入到作用域内后，该名称在此作用域内是私有的
可以将条目引入作用域
该条目可以被外部代码引入到它们的作用域

```rust
mod front_of_house {
pub mod hosting {
pub fn add_to_waitlist() {}
}
}

use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
hosting::add_to_waitlist();
}
```

意思就是，use 引入的模块，同一个文件是公有的，但是别的文件访问是私有的，解决这个问题只需要在 use 前面加一个 pub 就可以了

现在 eat_at_restaurant 函数可以在其作用域中调用 hosting::add_to_waitlist，外部代码也可以使用这个路径。

```rust
mod front_of_house {
pub mod hosting {
pub fn add_to_waitlist() {}
}
}

pub use crate::front_of_house::hosting;//像这样

pub fn eat_at_restaurant() {
hosting::add_to_waitlist();
}
```

### 使用外部包

Cargo.toml 文件添加依赖的包

```rust
[dependencies]
rand = "0.5.5"
```

use 将特定条目引入作用域
标准库（std）也被当作外部包，但是不需要修改 dependencies 来包含它

### 使用嵌套路径清理大量的 use 语句

如果使用同一个包或模块下的多个条目
可以使用嵌套路径，在同一行内将上述条目进行引入
路径相同的部分 : : { 路径差异的部分 }

```rust
use std::cmp::Ordering;
use std::io;
```

变为

```rust
use std::{cmp::Ordering, io};
```

特殊情况：

```rust
use std::io;
use std::io::Write;
```

变为

```rust
use std::io::{self, Write};
```

### 通配符

我么可以使用 \* 把路径中所有的公共条目都引入到作用域

把这个路径下的所有都引入了

use std::collections::\*;
谨慎使用

应用场景：
测试：将所有被测试代码引入 tests 模块
有时被用于预导入（prelude）模块

### 将模块内容移动到其他文件

模块定义时，如果模块名后边是 " ; " ，而不是代码块
Rust 会从与模块同名的文件中加载内容
模块树的结构不会变化
两层分离
初始内容（ lib.rs 文件 ）

```rust
mod front_of_house {
pub mod hosting {
pub fn add_to_waitlist() {}
}
}

use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
hosting::add_to_waitlist();
}
```

新建 front_of_house.rs 文件

在 lib.rs 文件中

```rust
mod front_of_house;//从 front_of_house 文件引入

use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
hosting::add_to_waitlist();
}
```

在 front_of_house.rs 文件中

```rust
pub mod hosting {
pub fn add_to_waitlist() {}
}
```

三层分离
如果想把，hosting 里面的内容再次独立出来
新建一个 front_of_house 的文件 ，里面写上 hosting.rs

hosting.rs 内容

```rust
pub fn add_to_waitlist() {}
```

front_of_house 内容

```rust
pub mod hosting;
```

lib.rs 内容

```rust
mod front_of_house;

use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
hosting::add_to_waitlist();
}
```
