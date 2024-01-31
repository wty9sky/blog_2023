---
title: Struct&枚举
aside: true
editLink: false
lastUpdated: false
showComment: false
showDate: false
date: 2023-12-31 19:56:35
---

## Struct&枚举

### 定义并实例化 struct

#### Struct，结构体

- 自定义的数据类型
- 让我们能为相关联的值命名，打包组合成有意义的组合
- 定义 struct
  - 使用 struct 关键字，并为整个 struct 命名
  - 在花括号内，为所有字段（Field）定义名称和类型

```rust
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}
```

#### 实例化 struct

- 想要使用 struct ，需要创建 struct 的实例
- 为每个字段指定具体值
- 无需按照声明的顺序进行指定

```rust
let user1 = User{
email:String::from("1841632321@qq.com"),
username:String::from("李泽辉"),
sign_in_count:1,
active:true,
}
```

#### 取得 struct 里面的某个值

- 使用点标记法

```rust
struct User {
username: String,
email: String,
sign_in_count: u64,
active: bool,
}

fn main() {
let user1 = User {
email: String::from("1841632321@qq.com"),
username: String::from("李泽辉"),
sign_in_count: 1,
active: true,
};
println!("{}", user1.username);
println!("{}", user1.email);
println!("{}", user1.sign_in_count);
println!("{}", user1.active);
}
```

#### 修改 struct 的值

- 修改了 username，注意要给实例 user1 加 mut 因为是可变的
- 而一旦这个实例 user1 是可变的，那么示例中的所有字段都是可变的

```rust
struct User {
username: String,
email: String,
sign_in_count: u64,
active: bool,
}

fn main() {
let mut user1 = User {
email: String::from("1841632321@qq.com"),
username: String::from("李泽辉"),
sign_in_count: 1,
active: true,
};
user1.username = String::from("李大聪明");

    println!("{}", user1.username);
    println!("{}", user1.email);
    println!("{}", user1.sign_in_count);
    println!("{}", user1.active);

}
```

#### struct 作为函数的返回值

- 传入用户名和邮箱，返回用户的结构体

```rust
fn return_user(email: String, username: String) -> User {
User {
email: email,
username: username,
sign_in_count: 1,
active: true,
}
}
```

#### 字段初始化简写

- 当字段名与字段值对应的变量名相同时，就可以使用字段初始化简写的方式

比如上面的例子，传入用户名和邮箱，结构体字段名和传入字段名一样，可以直接简写为下面的样子

```rust
fn return_user(email: String, username: String) -> User {
User {
email,
username,
sign_in_count: 1,
active: true,
}
}
```

#### struct 更新语法

- 当你想基于某个 struct 实例来创建一个新实例的时候，可以使用 struct 更新语法

```rust
struct User {
username: String,
email: String,
sign_in_count: u64,
active: bool,
}

fn main() {
let user1 = User {
email: String::from("1841632321@qq.com"),
username: String::from("李泽辉"),
sign_in_count: 1,
active: true,
};

let user2 = User {
    email: String::from("新邮箱"),//改变了email
    ..user1//其他的不改变可以直接这样写，表示这个新实例中剩下的没被赋值的字段(除了email)和user1的一样
};
}
```

## Tuple Struct

- 可定义类似 Tuple 的 Struct ，叫做 Tuple Struct

  - Tuple Struct 整体有个名，但里面的元素没有名
  - 它存在的意义是为了处理那些需要定义类型（经常使用）又不想太复杂的简单数据
  - "颜色"和"点坐标"是常用的两种数据类型，但如果实例化时写个大括号再写上两个名字就为了可读性牺牲了便捷性
  - Rust 不会遗留这个问题。

- 元组结构体对象的使用方式和元组一样，通过.和下标来进行访问：

```rust
fn main() {
struct Color(u8, u8, u8);
struct Point(f64, f64);

        let black = Color(0, 0, 0);
        let origin = Point(0.1, 0.2);

        println!("black = ({}, {}, {})", black.0, black.1, black.2);
        println!("origin = ({}, {})", origin.0, origin.1);
    }

//运行结果：
// black = (0, 0, 0)

// origin = (0.1, 0.2)
```

#### 结构体数据的所有权

- 我们声明 User ，里面的 username 和 email 时候用的是 String 而不是&str
- sign_in_count 和 active 又是标量类型

```rust
struct User {
username: String,
email: String,
sign_in_count: u64,
active: bool,
}
```

- 这个结构体拥有其所有数据的所有权，因为结构体失效的时候会释放所有字段。
- 但这不意味着结构体中不定义引用型字段，这需要通过"生命周期"机制来实现。
- 生命周期确保结构体引用的数据有效性跟结构体本身保持一致。如果你尝试在结构体中存储一个引用而不指定生命周期将是无效的

```rust
struct User {
username: &str,//这样会报错
email: &str,//报错，没有生命周期
sign_in_count: u64,
active: bool,
}
```

#### struct 的例子

计算长方形面积

```rust
fn main() {
    let w = 30;
    let h = 50;

    println!("面积是{}", area(w, h));
}

fn area(width: u32, height: u32) -> u32 {
    width * height
}
```

通过元组重构一下

```rust
fn main() {
    let rec: (u32, u32) = (30, 50);

    println!("面积是{}", area(rec));
}

fn area(dimensions: (u32, u32)) -> u32 {
    dimensions.0 * dimensions.1
}
```

- 元组帮助我们增加了一些结构性，并且现在只需传一个参数。
- 元组并没有给出元素的名称，所以计算变得更费解了，因为不得不使用索引来获取元组的每一部分
- 必须牢记 width 的元组索引是 0，height 的元组索引是 1
- 我们用结构体重构一下

```rust
struct Rectangle {
width: u32,
height: u32,
}

fn main() {
let rec = Rectangle {
width: 30,
height: 50,
};
println!("面积是{}", area(&rec));
}

fn area(rectangle: &Rectangle) -> u32 {
rectangle.width \* rectangle.height
}
```

- 这里定义了一个结构体并称其为 Rectangle。
- 在大括号中定义了字段 width 和 height，类型都是 u32。
- 在 main 中，我们创建了一个具体的 Rectangle 实例，它的宽是 30，高是 50。

- 函数 area 现在被定义为接收一个名叫 rectangle 的参数，其类型是一个结构体 Rectangle 实例的不可变借用。
- 我们希望借用结构体而不是获取它的所有权，这样 main 函数就可以保持 rect1 的所有权并继续使用它，所以这就是为什么在函数签名和调用的地方会有 &。

现在！area 的函数签名现在明确的阐述了我们的意图：使用 Rectangle 的 width 和 height 字段，计算 Rectangle 的面积。这表明宽高是相互联系的，并为这些值提供了描述性的名称而不是使用元组的索引值 0 和 1 。结构体胜在更清晰明了。

#### 输出结构体

输出结构体

```rust
//通过 println!会报错

struct Rectangle {
width: u32,
height: u32,
}

fn main() {
let rec = Rectangle {
width: 30,
height: 50,
};
println!("面积是{}", rec);//报错
}
```

<span>
当我们运行这个代码时，会出现带有如下核心信息的错误：<br>
error[E0277]: Rectangle doesn't implement std::fmt::Display<br>
println! 宏能处理很多类型的格式，不过，{} 默认告诉 println! 使用被称为 Display 的格式：意在提供给直接终端用户查看的输出。<br>
不过对于结构体，println! 应该用来输出的格式是不明确的，因为这有更多显示的可能性：是否需要逗号？需要打印出大括号吗？所有字段都应该
显示吗？由于这种不确定性，Rust 不会尝试猜测我们的意图，所以结构体并没有提供一个 Display 实现。<br>
</span>

```rust
struct Rectangle {
width: u32,
height: u32,
}

fn main() {
let rec = Rectangle {
width: 30,
height: 50,
};
println!("面积是{:?}", rec);//这里试一下
}
```

我们必须为结构体显式选择这个功能。为此，在结构体定义之前加上 #[derive(Debug)] 注解

```rust
#[derive(Debug)]
struct Rectangle {
width: u32,
height: u32,
}

fn main() {
let rec = Rectangle {
width: 30,
height: 50,
};
println!("面积是{:?}", rec);

}
```

```rust
#[derive(Debug)]
struct Rectangle {
width: u32,
height: u32,
}

fn main() {
let rec = Rectangle {
width: 30,
height: 50,
};
println!("面积是{:#?}", rec);

}
```

#### struct 方法

方法和函数很类似：fn 关键字、名称、参数、返回值
方法与函数不同之处：
方法是在 struct（ 或 enum、trait 对象）的上下文中定义
方法的第一个参数是 self，表示方法被调用的 struct 实例
定义方法
在 impl 块里定义方法
方法的第一个参数可以&self 借用，也可以获得其所有权，或者可变借用（和其它参数一样）

```rust
struct Rectangle {
width: u32,
height: u32,
}

impl Rectangle {
fn area(&self) -> u32 {
self.width \* self.height
}
}

fn main() {
let rec = Rectangle {
width: 30,
height: 50,
};
println!("面积是{}", rec.area());
}
```

带有更多参数的方法
我们要实现一个功能，判断一个长方形，是否能容纳下另一个长方形

```rust
struct Rectangle {
width: u32,
height: u32,
}

impl Rectangle {
fn can_hold(&self, other: &Rectangle) -> bool {
self.width > other.width && self.height > other.height
}
}

fn main() {
let rec1 = Rectangle {
width: 30,
height: 50,
};
let rec2 = Rectangle {
width: 10,
height: 40,
};
let rec3 = Rectangle {
width: 35,
height: 55,
};
println!("rec1 能否包括 rec2：{}", rec1.can_hold(&rec2));//调用 can_hold 时候，&self 代表 rec1，other 代表 rec2
println!("rec1 能否包括 rec3：{}", rec1.can_hold(&rec3));
}

//返回:

// rec1 能否包括 rec2：true
// rec1 能否包括 rec3：false
```

- 关联函数
  - 可以在 impl 块里定义不把 self 作为第一个参数的函数，他们叫关联函数（是函数，不是方法，不是通过实例对象.进行调用的）
  - 例如：String::from()就是一个关联函数
- 关联函数经常被用作返回一个结构体新实例的构造函数。
- 例如我们可以提供一个关联函数，它接受一个维度参数并且同时作为宽和高
- 这样可以更轻松的创建一个正方形 Rectangle 而不必指定两次同样的值：

```rust

#[derive(Debug)]
struct Rectangle {
width: u32,
height: u32,
}
impl Rectangle {
        fn square(size: u32) -> Rectangle {
            Rectangle {
                width: size,
                height: size,
            }
        }
    }

fn main() {
        let r = Rectangle::square(20);
        println!("{:#?}", &r);//输出一下
}
```

- 分成多个块

```rust
impl Rectangle {
fn square(size: u32) -> Rectangle {
Rectangle {
width: size,
height: size,
}
}
}
impl Rectangle {
fn can_hold(&self, other: &Rectangle) -> bool {
self.width > other.width && self.height > other.height
}
}
```

## 枚举与模式匹配

### 枚举

枚举允许我们列举所有可能的值来定义一个类型

#### 定义枚举

- IP 地址：IPv4，IPv6
- 创建枚举值,并且传入方法中

```rust
enum ipAddrKind {
V4,//枚举中所有可能的值叫做变体
V6,
}

fn main() {
let four = ipAddrKind::V4;
let six = ipAddrKind::V6;
route(four);
route(six);
route(ipAddrKind::V4);
route(ipAddrKind::V6);
}

fn route(ip_kind: ipAddrKind) {}
```

- 将数据附加到枚举的变体中
- 所有类型都可以进行附加数据

```rust
enum Message {
Quit,//匿名结构体
Move { x: i32, y: i32 },//坐标结构体
Write(String),//字符串
ChangeColor(i32, i32, i32),//元组
}
fn main() {
let q = Message::Quit;
let m = Message::Move { x: 10, y: 22 };
let q = Message::Write(String::from("字符串"));
let q = Message::ChangeColor(0, 255, 255);
}
```

- 为枚举定义方法
  - impl 关键字

```rust
#[derive(Debug)]
enum Message {
Quit,Move { x: i32, y: i32 },
Write(String),
ChangeColor(i32, i32, i32),
}
impl Message {
fn call(self) -> Message {
self
}
}
fn main() {
let q = Message::Quit;
let m = Message::Move { x: 10, y: 22 };
let w = Message::Write(String::from("字符串"));
let c = Message::ChangeColor(0, 255, 255);

let x = m.call();
println!("{:#?}", x);

}

```

## Option 枚举

- Rust 没有 Null ，所以 Rust 提供了类似 Null 概念的枚举-Option\<T\>
- 定义于标准库中
- 在 Prelude（预导入模块）中
  - 描述了：某个值可能存在（某种类型）或不存在的情况

```rust
enum Option<T> {
Some(T),
None,
}
```

可以直接使用，不需要像正常的枚举一样，Option::Some(5);

```rust
let some_number = Some(5); //std::option::Option<i32>
let some_string = Some("A String"); //std::option::Option<&str>
let absent_number: Option<i32> = None;//这里编译器无法推断类型，所以要显式的声明类型
```

如果你想针对 opt 执行某些操作，你必须先判断它是否是 Option::None：

```rust
fn main() {
let opt = Option::Some("Hello");
//let opt: Option<&str> = Option::None;
//let opt: Option<&str> = None;
//空值
match opt {
Option::Some(something) => {
println!("{}", something);
},
Option::None => {
println!("opt is nothing");
}
}
}
```

## 控制流运算符 - match

- 允许一个值与一系列模式进行匹配，并执行匹配的模式对应的代码
- 模式可以是字面值、变量名、通配符
- 有一个结构体 Coin 里面四个变体，对应四个分支返回值

```rust
enum Coin {
Penny,
Nickel,
Dime,
Quarter,
}

fn value_in_cents(coin: Coin) -> u8 {
//进行匹配
match coin {
Coin::Penny => {
println!("{}", 1);
1
}
Coin::Nickel => 5,
Coin::Dime => 10,
Coin::Quarter => 25,
}
}

fn main() {
value_in_cents(Coin::Penny);
}
```

- 绑定值的模式匹配(提取 enum 中的变体)
- 匹配的分支可以绑定到被匹配对象的部分值
- 因此可以从 enum 变体中提取值

```rust
#[derive(Debug)]
enum UsState {
Alabama,
Alaska { x: u32, y: u32 },
}

enum Coin {
Penny,
Nickel,
Dime { index: u8 },
Quarter(UsState),
}

fn value_in_cents(coin: Coin) -> u8 {
//匹配
match coin {
Coin::Penny => 1,
Coin::Nickel => 5,
Coin::Dime { index } => 10,
Coin::Quarter(state) => {
println!("state is {:#?}", state);
25
}
}
}

fn main() {
let c = Coin::Quarter(UsState::Alaska { x: 10, y: 20 }); //传值
let x = Coin::Dime { index: 2 };
println!("{}", value_in_cents(c)); //取值
println!("{}", value_in_cents(x)); //取值
}

// 结果
/*state is Alaska {
x: 10,
y: 20,
}
25
10
匹配 Option<T>
fn main() {
let five = Some(5); //定义一个 Option
let six = plus_one(five); //走 Some 分支，i+1
let none = plus_one(None); //为 None 返回 None
}

fn plus_one(x: Option<i32>) -> Option<i32> {
match x {
None => None,
Some(i) => Some(i + 1),
}
}
*/
```

- match 必须穷举所有可能
- Option 有两个变体，一个 None 一个 Some 必须都有分支

```rust
fn main() {}

fn plus*one(x: Option<i32>) -> Option<i32> {
match x {
None => None,
Some(i) => Some(i + 1),
}
}
```

- match 使用通配符\*
- 不用穷举所有可能性了

```rust
fn main() {
let v = 4;

    match v {
        1 => println!("1"),
        3 => println!("2"),
        _ => println!("other"),
    }

}
```

```
\_表示除了以上两种情况外，剩下所有的
```

## if let

处理只关心一种匹配，忽略其他匹配的情况，你可以认为他是只用来区分两种情况的 match 语句的语法糖

- 语法格式：
  - if let 匹配值 = 源变量 {语句块}
  - 用 match 来写，如果 i 是 0，输出 0，其他数字输出 other

```rust
fn main() {
let i = 0;
match i {
0 => println!("zero"),
\_ => println!("other"),
}
}
```

```rust
fn main() {
let i = 0;
if let 0 = i {
println!("zero")
} else {
println!("other")
}
}
```

- 上面的是标量，我们现在用枚举试一下

```rust
fn main() {
enum Book {
Papery(u32),
Electronic,
}
let book = Book::Papery(1);
if let Book::Papery(index) = book {
println!("{}", index)
} else {
println!("Electronic")
}
}
```
