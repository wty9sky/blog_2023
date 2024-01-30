---
title: Rust入门基础
aside: true
editLink: false
lastUpdated: false
showComment: false
showDate: false
date: 2023-12-03 13:34:12
---

# Rust 入门

## 学习参考

Rust 语言之旅：https://tourofrust.com/17_zh-cn.html<br>
Rust 程序设计语言重编版：http://shouce.jb51.net/rust-book-chinese/index.html<br>
命令行学习 Rust：https://suibianxiedianer.github.io/rust-cli-book-zh_CN/<br>
Rust 程序设计语言：https://rust.bootcss.com/<br>

## 什么是 Rust？

Rust

- 一种静态编译的、运行速度快的语言
- 拥有强大的工具，且其生态也在快速发展
- 适合编写命令行应用：小巧、便携且运行速度快

## 通用概念

### 变量与可变性

- 声明变量用 let 关键字
- 默认情况下，变量是不可变的（immutable）
- 当变量不可变时，一旦值被绑定一个名称上，你就不能改变这个值。
- 尽管变量默认是不可变的，你仍然可以在变量名前添加 mut 来使其可变

```rust
fn main() {
    let mut x = 5;
    println!("The value of x is: {x}");
    x = 6;
    println!("The value of x is: {x}");
}
```

#### 变量与常量

- 常量（constant）
  - 常量在绑定值以后也是不可变的，但它与不可变的变量有很多区别
  - 不可以使用 mut ，常量总是不可变的
  - 声明常量使用 const 关键字，它的类型必须被标注
  - 常量可以在任何作用域内进行声明，包括全局作用域
  - 在程序运行期间，常量在其声明的作用域内一直有效，因此可以作为不同代码之间共享值
  - 常量只能被设置为常量表达式，而不可以是其他任何只能在运行时计算出的值
  - Rust 对常量的命名约定是在单词之间使用全大写加下划线

```rust
const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3;
```

#### 隐藏 Shadowing

可以定义一个与之前变量同名的新变量，即第一个变量被第二个 隐藏（Shadowing）

- 在后续的代码中这个变量名就是新的变量
- 实际上，第二个变量“遮蔽”了第一个变量
- 此时任何使用该变量名的行为中都会视为是在使用第二个变量
- 直到第二个变量自己也被隐藏或第二个变量的作用域结束
- 可以用相同变量名称来隐藏一个变量，以及重复使用 let 关键字来多次隐藏
- shadow 和把变量标记为 mut 是不一样的
- 使用 let 声明的同名新变量，也是不可变的
- 使用 let 声明的同名新变量，它的类型可以与之前不同

```rust
fn main() {
    let x = 5;
    let x = x + 1;
    {
        let x = x * 2;
        println!("The value of x in the inner scope is: {x}");
    }
    println!("The value of x is: {x}");
}
```

#### 和 mut 区别

- 当不小心尝试对变量重新赋值时，如果没有使用 let 关键字，就会导致编译时错误
- 通过使用 let，我们可以用这个值进行一些计算，不过计算完之后变量仍然是不可变的
- 当再次使用 let 时，实际上创建了一个新变量，我们可以改变值的类型，并且复用这个名字

```rust
//shadow
fn main() {

    let a = 2;
    let a = a + 1;
    let a = a * 3;
    println!("The value a is :{}",a);

}
```

```rust
//mut
fn main() {

    let mut a = 2;
    a = a + 1;
    a = a * 3;
    println!("The value a is :{}",a);

}
```

```rust
// shadow
fn main() {
    let str = "     ";
    let str = str.len();
    println!("len:{}",str);

}

// mut

fn main() {
    let mut str = "     ";
    str = str.len();//报错：把一个整数赋给字符串
    println!("len:{}",str);

}
```

### 数据类型

- Rust 是静态编译语言，在编译时必须知道所有变量的类型

#### 标量类型

- 标量类型代表单独的值
- 四种基本标量类型：整型、浮点型、布尔类型、字符类型

##### 整数类型

没有小数部分的数字，关联值是占据 32 bit 的无符号整数

- “有符号”和“无符号”代表数字能否为负值
- 有符号数以补码形式存储
- 无符号整数类型以 u 开头（无符号指的是，非负）
- 有符号整数类型以 i 开头
- i：有符号整数范围 $$ [-(2^n - 1) , 2^{n-1} - 1] $$ u：无符号整数范围 $$ [0,2^{n-1} - 1] $$
  <br>
  Rust 中的整型如下
  | 长度 | 有符号 | 无符号 |
  | :-----: | :----: | :------: |
  | 8-bit | i8 | u8 |
  | 16-bit | i16 | u16 |
  | 32-bit | i32 | u32 |
  | 64-bit | i64 | u64 |
  | 128-bit | i128 | u128 |
  | arch | isize | usize |

如表格所示，每种都分 i 和 u 以及固定的位数

> 每一个有符号的变体可以储存包含从 -(2n - 1) 到 2n - 1 - 1 在内的数字（n 是变体使用的位数）。<br>
> eg:i8 可以储存从 -(27) 到 27 - 1 在内的数字，也就是从 -128 到 127。<br>
> 无符号的变体可以储存从 0 到 2n - 1 的数字<br>
> eg： u8 可以储存从 0 到 28 - 1 的数字，也就是从 0 到 255。<br>
> isize 和 usize 类型依赖运行程序的计算机架构=>64 位架构上它们是 64 位的，32 位架构上它们是 32 位的。<br>
> 使用 isize 和 usize 的主要场景是对某种集合进行索引操作（不常见）<br>

###### 整型字面值

- 为了便于辨识整型字面值，可以在字面值中加入 _ 用作数字之间的分隔，如：1_000_000，_ 所起的作用仅仅是方面代码的阅读，它与 1000000 表示的相同的数值。<br>
- 另外除了字节字面值（即以 0，1 序列表示的数值），其他类型的整型字面值都可以加上类型说明符作为后缀以标识数值类型，如：255u8, 1024i64 或者 1024_i64 等。<br>

```rust
let a = 255u8
```

一个数字，可以采用不同的进制表示，如十进制，十六进制，八进制和是二进制等。区分这些不同进制的数的方式是根据字面值所带的前缀，如下表：

| 字面值类型                   | 例子        |
| ---------------------------- | ----------- |
| Decimal (十进制)             | 98_222      |
| Hex (十六进制)               | 0xff        |
| Octal (八进制)               | 0o77        |
| Binary (二进制)              | 0b1111_0000 |
| Byte (单字节字符)(仅限于 u8) | b'A'        |

###### 整型溢出

当整型变量超过其长度时候，就会出现整型溢出的问题，这会导致以下两种行为之一的发生。

1. debug 模式编译：Rust 检查这类问题并使程序 panic，这个术语被 Rust 用来表明程序因错误而退出
2. 使用 --release flag 在 release 模式中构建：Rust 不会检测会导致 panic 的整型溢出。

相反发生整型溢出时，Rust 会进行一种被称为二进制补码 wrapping 的操作=>(比此类型能容纳最大值还大的值会回绕到最小值)
eg: 值 256 变成 0，值 257 变成 1，依此类推。
程序不会 panic，不过变量可能也不会是你所期望的值。依赖整型溢出 wrapping 的行为被认为是一种错误。

###### 处理整型溢出

为了显式地处理溢出的可能性，可以使用这几类标准库提供的原始数字类型方法：

1. 所有模式下都可以使用 wrapping\_\* 方法进行 wrapping，如 wrapping_add
2. 如果 checked\_\* 方法出现溢出，则返回 None 值
3. 用 overflowing\_\* 方法返回值和一个布尔值，表示是否出现溢出
4. 用 saturating\_\* 方法在值的最小值或最大值处进行饱和处理

如果你不太清楚使用哪种数据类型，整数默认类型就是 i32

#### 浮点类型

Rust 有两种基础的浮点类型

- "f32，32 位，单精度"
- "f64，64 位，双精度"

```rust
let a = 1.0;//f64
let a :f32 = 1.0;//f32
```

默认会使用 f64 类型

##### 数值运算

Rust 中的所有数字类型都支持基本数学运算：

- 加法
- 减法
- 乘法
- 除法：整数除法会向零舍入到最接近的整数
- 取余

```rust
let sum = 5 + 10;
let difference = 97.8 - 24.1;
let producet = 4 * 30;
let quotient = 56.7 / 32.1;
let reminder = 54 % 5;
```

#### 布尔类型

- Rust 的布尔类型为
  - true
  - false
- 1 个字节大小
- 符号是 bool

```rust
let t = true;
let f :bool = false;
```

#### 字符类型

- Rust 语言中 char 类型被用来描述语言中最基础的单个字符
- 字符类型的字面值使用单引号
- 占用 4 个字节大小 （1 个字节 = 1 byte = 8 位 = 8 bit 比特 = 8 个 0，1）
- 是 Unicode 标量值，可以表示比 ASCⅡ 多得多的字符内容：拼音，中日韩文，零长度空白字符，emoji 表情等
- 范围：
  - U+0000 ~ U+D7FF
  - U+E000 ~ U+10FFFF
- 但 Unicode 中并没有 “字符” 的概念，所以直觉上认为的字符也许与 Rust 中的概念并不相符
- 字符类型是单引号,如果 let b :char = "₦" 这样声明会报错

```rust
let a = 'n';
let b :char = '₦';
let c = ' ';
```

### 复合类型

- 复合类型可以将多个值放在一个类型里

- Rust 提供了两种基础的复合类型
  - 元组（Tuple）
  - 数组

#### 元组（Tuple）

- Tuple 可以将多个类型的多个值放在一个类型里
- Tuple 的长度是固定的：一旦声明就无法改变

```rust
let tup:(i32,f68,u8)=(500,6.4,1);
```

##### 创建 Tuple

- 在小括号里，将值用逗号隔开
- Tuple 中的每个位置都对应一个类型，Tuple 中各元素的类型不必相同

```rust
let tup: (i32,f64,char) = (100,5.1,'a');//创建 Tuple
println!("{},{},{}",tup.0,tup.1,tup.2);
```

##### 获取 Tuple 的元素值

可以使用模式匹配来解构（destructure）一个 Tuple 来获取元素的值

```rust
let tup: (i32,f64,char) = (100,5.1,'a');
let (x, y, z) = tup;//给变量赋值
println!("{},{},{}", x, y, z);
```

##### 访问 Tuple 的元素

在 tuple 变量使用点标记法，后接元素的索引号

```rust
let tup: (i32,f64,char) = (100,5.1,'a');
println!("{},{},{}",tup.0,tup.1,tup.2);//访问 Tuple 的元素
```

##### 单元元组

- 不带任何值的元组有个特殊的名称，叫做 单元（unit） 元组
- 这种值以及对应的类型都写作 ()，表示空值或空的返回类型
- 如果表达式不返回任何其他值，则会隐式返回单元值

#### 数组

- 数组也可以将多个值放在一个类型里
- 数组中每个元素的类型必须相同
- 数组的长度也是固定的

##### 声明一个数组

- 在中括号里，各值用逗号分开

```rust
let a = [1, 2, 3, 4];
```

##### 数组的用处&和 Vector 区别

- 如果想让你的数据存放在 stack（栈）上而不是 heap（堆）上，或者想保证有固定数量的元素，这时使用数组更有好处
- 数组没有 Vector 灵活
- Vector 和数组类似，它由标准库提供
- Vector 的长度可以改变
- 如果不确定用数组还是 Vector，那大概率是 Vector

##### 数组的声明

- 数组的声明以这种形式表示 [ 类型；长度 ]

```rust
let a:[u32; 2];
a = [1,2];
```

> 一种特殊的数组声明
> 如果数组的每个元素值都相同，那么可以这样
>
> ```rust
> rust let a = [3; 5];//它就相当于 let a = [3, 3, 3, 3, 3];
> // 请注意，声明中间的是分号
> ```

##### 访问数组

- 跟其他语言一样，a[0]表示访问 a 数组的第一个
- 如果访问的索引超出了数组的范围，简单一些的 Rust 在 build 时候能检测出来，cargo run 的时候会报错
- 复杂一些的逻辑 build 就不会检测出来,但是运行会报错

```rust
let a = [1,2,3,4];
let index = [0,5,7];
println!("{}", a[index[2]]);
```

### 函数与注释

#### 函数

- Rust 语言中最重要的函数之一：main 函数，它是很多程序的入口点
- 用 fn 关键字来声明新函数，fn 后面跟着函数名和一对圆括号来定义函数，大括号告诉编译器哪里是函数体的开始和结尾。
- Rust 代码中的函数和变量名使用 snake case 规范风格（在 snake case 中，所有字母都是小写并使用下划线分隔单词）
- Rust 不关心函数定义所在的位置
- 只要函数被调用时出现在调用之处可见的作用域内就行

##### 参数

- 我们可以定义为拥有 参数（parameters）的函数，参数是特殊变量，是函数签名的一部分。当函数拥有参数（形参）时，可以为这些参数提供具体的值（实参）。
- 如果函数有参数，必须声明每个参数的类型。

```rust
fn main() {
another_function(5);
}

fn another_function(x: i32) {
println!("The value of x is: {x}");
}
```

- 在函数签名中，必须 声明每个参数的类型，要求在函数定义中提供类型注解，
- 当定义多个参数时，使用逗号分隔。

```rust
fn main() {
print_labeled_measurement(5, 'h');
}

fn print_labeled_measurement(value: i32, unit_label: char) {
println!("The measurement is: {value}{unit_label}");
}
```

##### 语句和表达式

- 函数体由一系列的语句和一个可选的结尾表达式构成。
- Rust 是一门基于表达式的语言，这是一个需要理解的（不同于其他语言）重要区别。
- 语句（Statements）是执行一些操作但不返回值的指令。
- 表达式（Expressions）计算并产生一个值。
- 使用 let 关键字创建变量并绑定一个值是一个语句
- 函数定义也是语句。
- 语句不返回值。因此，不能把 let 语句赋值给另一个变量。

```rust
fn main() {
let x = (let y = 6);
}

// let y = 6 语句并不返回值，所以没有可以绑定到 x 上的值。
```

- 表达式会计算出一个值，并且你将编写的大部分 Rust 代码是由表达式组成的。
- 表达式可以是语句的一部分
- 函数调用是一个表达式
- 宏调用是一个表达式
- 用大括号创建的一个新的块作用域也是一个表达式，例如：

```rust
    let y = {
        let x = 3;
        x + 1
    };
    // 是一个代码块，它的值是 4。这个值作为 let 语句的一部分被绑定到 y 上
```

- 表达式的结尾没有分号
- 如果在表达式的结尾加上分号，它就变成了语句，而语句不会返回值。
- 具有返回值的函数
- 函数可以向调用它的代码返回值。
- 不对返回值命名，但要在箭头（->）后声明它的类型
- 在 Rust 中，函数的返回值等同于函数体最后一个表达式的值
- 使用 return 关键字和指定值，可从函数中提前返回
- 但大部分函数隐式的返回最后的表达式

```rust
fn five() -> i32 {
5
}
```

在 five 函数中没有函数调用、宏、甚至没有 let 语句 —— 只有数字 5。这在 Rust 中是一个完全有效的函数。注意，也指定了函数返回值的类型，就是 -> i32

#### 注释

##### 行注释

这是一个简单的注释：

```rust
// hello, world
在 Rust 中，惯用的注释样式是以两个斜杠开始注释，并持续到本行的结尾。对于超过一行的注释，需要在每一行前都加上 //

// So we’re doing something complicated here, long enough that we need
// multiple lines of comments to do it! Whew! Hopefully, this comment will
// explain what’s going on.
```

##### 文档注释（后面）

```rust
/*
*注释
*/
```

#### 控制流

##### if 表达式

if 表达式允许根据条件执行不同的代码分支
所有的 if 表达式都以 if 关键字开头，其后跟一个条件
也可以包含一个可选的 else 表达式来提供一个在条件为 false 时应当执行的代码块
代码中的条件 必须 是 bool 值
Rust 并不会尝试自动地将非布尔值转换为布尔值，必须总是显式地使用布尔值作为 if 的条件。
可以将 else if 表达式与 if 和 else 组合来实现多重条件。
使用过多的 else if 表达式会使代码显得杂乱无章，所以如果有多于一个 else if 表达式，可以使用 match。

在 let 中使用 if
if 是一个表达式，我们可以在 let 语句的右侧使用它
变量必须只有一个类型，Rust 需要在编译时就确切的知道 number 变量的类型，这样它就可以在编译时验证在每处使用的 number 变量的类型是有效的

##### 循环重复执行

Rust 有三种循环：

- loop
- while
- for

###### loop

- loop 关键字告诉 Rust 一遍又一遍地执行一段代码直到你明确要求停止。
- Rust 提供了一种从代码中跳出循环的方法。可以使用 break 关键字来告诉程序何时停止循环。
- 循环中的 continue 关键字告诉程序跳过这个循环迭代中的任何剩余代码，并转到下一个迭代。
- 从循环返回值
- 可能会需要将操作的结果传递给其它的代码。如果将返回值加入你用来停止循环的 break 表达式，它会被停止的循环返回。

```rust
fn main() {
let mut counter = 0;

    let result = loop {
        counter += 1;

        if counter == 10 {
            break counter * 2;
        }
    };

    println!("The result is {result}");
}
```

###### 循环标签：在多个循环之间消除歧义

- 如果存在嵌套循环，break 和 continue 应用于此时最内层的循环。
- 你可以选择在一个循环上指定一个 循环标签（loop label），然后将标签与 break 或 continue 一起使用，使这些关键字应用于已标记的循环而不是最内层的循环。

```rust
fn main() {
let mut count = 0;
'counting_up: loop {
println!("count = {count}");
let mut remaining = 10;

        loop {
            println!("remaining = {remaining}");
            if remaining == 9 {
                break;
            }
            if count == 2 {
                break 'counting_up;
            }
            remaining -= 1;
        }

        count += 1;
    }
    println!("End count = {count}");

}
```

###### while 条件循环

- Rust 内置了一个语言结构，它被称为 while 循环，这种结构消除了很多使用 loop、if、else 和 break 时所必须的嵌套，这样更加清晰。
- 当条件为 true 就执行，否则退出循环。

###### for 遍历集合

- 可以使用 while 结构来遍历集合中的元素，比如数组，但是如果索引长度或测试条件不正确会导致程序 panic，使用 while 循环需要确定在循环的每次迭代中索引是否在数组的边界内。
- 作为更简洁的替代方案，可以使用 for 循环来对一个集合的每个元素执行一些代码。

```rust
fn main() {
let a = [10, 20, 30, 40, 50];
for element in a {
println!("the value is: {element}");
}
}
```

增强了代码安全性，并消除了可能由于超出数组的结尾或遍历长度不够而缺少一些元素而导致的 bug。
