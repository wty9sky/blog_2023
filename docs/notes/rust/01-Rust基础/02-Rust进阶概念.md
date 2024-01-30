---
title: Rust进阶概念
aside: true
editLink: false
lastUpdated: false
showComment: false
showDate: false
date: 2023-12-03 13:34:12
---

# Rust 进阶

所有权
所有权是 Rust 最独特的特性，它让 Rust 无需 GC 就保证内存安全

1、什么是所有权
Rust 的核心特性就是所有权
所有程序在运行时都必须管理它们使用计算机内存的方式
有些语言有垃圾收集机制，在程序运行时，它们会不断寻找不再使用的内存（C#、Java）
在其他语言中，程序员必须显式的分配和释放内存（C、C++）
Rust 采用了第三种方式
内存是通过一个所有权系统来管理的，其中包含一组编译器在编译时检查的规则
当程序运行时，所有权特性不会减慢程序的运行速度（因为都在编译期完成了）
2、Stack and Heap（栈内存和堆内存）
在像 Rust 这样的系统级编程语言中，一个值是在 stack 上还是在 heap 上对语言的行为和你为什么要做某些决定是由更大的影响的
在你的代码运行的时候，Stack 和 Heap 都是你可用的内存，但他们的结构很不相同
1）存储数据
Stack 会按值的接收顺序来存储，按相反的顺序将它们移除（先进后出，后进先出）
添加数据叫做 ”压入栈“
移除数据叫做 ”弹出栈“
所有存储在 Stack 上的数据必须拥有已知的固定的大小
编译时大小未知的数据或运行时大小可能发生变化的数据必须存放在 Heap 上
把值压到 Stack 上不叫 ”分配“（因为实际上不需要分配，数据在 Stack 上挨着放就可以了）
Heap 内存组织性差一些
当你把数据放入 Heap 时，你会请求一定数量的空间
操作系统在 Heap 里找到一块足够大的空间，把它标记为在用，并返回一个指针，也就是这个空间的地址
这个过程叫做在 Heap 上进行分配，有时仅仅称为 ”分配“
因为指针是已知固定大小的，可以把指针存放在 Stack 上（也就是说，Stack 存储着 Heap 的指针）
如果想要实际的数据，你必须使用指针来定位
把数据压到 Stack 上要比在 Heap 上分配快得多
因为（入栈时）操作系统无需为存储新数据去搜索内存空间；其位置总是在栈顶。
相比之下，在堆上分配内存则需要更多的工作，这是因为操作系统必须首先找到一块足够存放数据的内存空间，并接着做一些记录为下一次分配做准备。
2）访问数据
访问 Stack 中的数据要比访问 Heap 中的数据要快，因为需要通过指针才能找到 Heap 中的数据
处理器在处理的数据彼此较近的时候（比如在栈上），比较远的时候（比如在堆上）能更快
3）函数调用
当你的代码调用函数时，值被传入函数（也包括指向 Heap 的指针）。函数本地的变量被压到 Stack 上，当函数结束后，这些值会从 Stack 上弹出
3、所有权存在的原因
所有权解决的问题：
跟踪代码的哪些部分正在使用 Heap 的哪些数据
最小化 Heap 上的重复数据量
可以清理 Heap 上未使用的数据以避免空间不足
一旦你懂得了所有权，那么就不需要经常去想 Stack 或 Heap 了
但是知道管理 Heap 数据是所有权存在的原因，这也有助于理解它为什么会这样工作
4、所有权的规则
每个值都有一个变量，这个变量是该值的所有者
每个值同时只能有一个所有者
当所有者超出作用域（scope）时，该值将被删除
1）变量作用域（Scope）
Scope 就是程序中一个有效范围
跟别的语言一样
fn main() {
//s 不可用
let s = "hello";//s 可用
//可以对 s 进行相关操作
}//s 作用域到此结束，s 不可用
2）String 类型
String 类型比那些基础标量数据类型更复杂
基础数据类型存放在 Stack 上，离开作用域就会弹出栈
我们现在用一个存储在 Heap 上面的类型，来研究 Rust 是如何回收这些数据的
String 会在 Heap 上分配，能够存储在编译时未知数量的文本
创建 String 类型的值
可以使用 from 函数从字符串字面值创建出 String 类型
let mut s = String::from("hello");
::表示 from 是 String 类型下的函数
这类字符串是可以被修改的
fn main() {
let mut s = String::from("hello");
s.push_str(" word");
println!("{}", s);
}
内存与分配
字符串字面值 let a = "AA"，在编译时就知道他的内容了，其文本内容直接被硬编码到最终的可执行文件中
速度快、高效，是因为其不可变性
String 类型，为了支持可变性，需要在 Heap 上分配内存来保存编译时未知的文本内容
操作系统必须在运行时来请求内存
通过调用 String::from 实现
当用完 String 后，需要用某种方式把内存返还给操作系统
这步，在拥有 GC 的语言中，GC 会跟踪并清理不再使用的内存
没有 GC，就需要我们去识别内存何时不再使用，并调用代码将内存空间返还
如果忘了，那就是浪费内存
如果提前做的，变量就会非法
如果做了两次，也是 Bug，必须一次分配对应一次释放

Rust 采用了不同的方式：对于某个值来说，当拥有它的变量走出范围时，内存会立即自动的交还给操作系统
drop 函数，变量走出作用域，Rust 会自动执行这个函数，释放空间
变量和数据交互的方式：
移动（Move）
基本数据类型:

多个变量可以使用同一个数据
整数是已知且固定大小的简单的值，这两个 5 被压到了 Stack 中
基本数据类型不存在什么 浅拷贝、深拷贝，只有引用类型涉及，因为基本数据类型操作都是在 Stack 上进行的
let x = 5;
let y = x;
String 类型（或者说用到了 Heap 的类型，也叫引用类型）：

let s1 = String::from("hello");//第一步如图一所示
let s2 = s1; //第二步如图二所示
一个 String 由 3 部分构成（放在 Stack 中），存放字符串内容的部分在 Heap 上
一个指向存放字符串内容的内存的指针
一个长度（len：表示存放这个字符串所需的字节数）
一个容量 （capacity：指 String 从操作系统中总共获得内存的总字节数）
图一：

当把 s1 赋给 s2，String 的数据被复制了一份：
在 Stack 上复制了一份，指针、长度、容量
并没有复制指针所指向的 Heap 数据
图二：

当变量离开作用域时，Rust 会自动调用 drop 函数，并将变量使用的 heap 内存释放
当 s1，s2 离开作用域时，它们都会尝试释放相同的内存
二次释放（double free）Bug
为了保证内存的安全
Rust 没有尝试复制被分配的内存（Heap 中的存储内容没有被复制）
Rust 让 s1 失效
当 s1 离开作用域的时候，Rust 不需要释放任何东西
fn main() {
let s1 = String::from("hello");
let s2 = s1;
println!("{}", s1);//会报错
}
这种操作，有点像浅拷贝（复制 Stack 中的索引信息，指向同一个 Heap 内存地址），但是 Rust 后续删除了第一个变量，所以我们叫了一个新名字 移动（Move）
另外，这里还隐含了一个设计选择：Rust 永远也不会自动创建数据的 深拷贝（在 Stack 中创建新的索引，在 Heap 中创建新空间存储数据，这个新索引，指向新空间，数据是一样的）。因此，任何 自动 的复制可以被认为对运行时性能影响较小
( 因为都是 Move，没对 Heap 进行操作）。

克隆（Clone）
如果真想对 Heap 上的 String 数据进行深度拷贝，而不仅仅是 Stack 上的索引数据，可以使用 Clone 方法（以后细说）
这样我们拿 s1 就不会报错了，因为他是这样的了，如图三

fn main() {
let s1 = String::from("hello");
let s2 = s1.clone();
println!("{}, {}", s1, s2);
}
图三：

Stack 上的数据进行复制
还记得我们上面说过，基本数据类型所有的操作都是在 Stack 上进行的么

Copy 这个 trait（特质） 在编译器的眼里代表的是什么意思呢？简单点总结就是说，如果一个类型 impl 了 Copy trait，意味着任何时候，我们可以通过简单的内存拷贝(C 语言的按位拷贝 memcpy)实现该类型的复制，而不会产生任何问题。有点像注解
Copy trait，用于像整数这样完全存放在 Stack 上面的类型
所有需要分配内存的都不是 Copy trait
一些拥有 Copy trait 的类型：
所有整数类型
bool
char
所有浮点类型
元组（Tuple），如果里面所有字段都是 Copy 的，那这个元组也是
（i32,i32）这个是
（i32，String）这个不是
5、所有权与函数（例子）
在语义上，将值传递给函数和把值赋给变量是类似的
将值传递给函数将发生移动和复制
例子：

fn main() {
let s = String::from("Hello World");//这里声明引用类型，String，
take_ownership(s);//放入函数，发生了移动

        let a = 1;//声明整型
        makes_copy(a);//实际上传入的是a的副本
    }//a:在Stack中的本来数据被drop

    fn take_ownership(some_string: String) {
        println!("{}", some_string);
    }//s:这里Heap中的数据被drop了

    fn makes_copy(some_number: u32) {
        println!("{}", some_number);
    }//a:在Stack中的副本数据被drop

6、返回值与作用域
函数在返回值的过程中同样也会发生所有权的转移

fn main() {
let s1 = gives_ownership(); //返回值的所有权转移给 s1 发生了移动

        let s2 = String::from("hello");

        let s3 = takes_and_gives_back(s2);//s2 所有权移交给这个方法，然后又移交给s3
    }

    fn gives_ownership() -> String {
        let some_string = String::from("hello");
        some_string
    }

    fn takes_and_gives_back(a_string: String) -> String {
        a_string
    }

一个值赋给其他变量时就会发生移动
当一个包含 Heap 数据的变量离开作用域时，它的值就会被 drop 函数清理，除非数据所有权移动到另一个变量上了
7、让函数使用某个值，但不获得所有权
fn main() {
let s1 = String::from("hello");

        let (s2, len) = calculate_length(s1);//把s1的所有权移交到，这个方法中的s，然后再返回

        println!("The length of '{}' is {}", s2, len);
    }

    fn calculate_length(s: String) -> (String, usize) {
        let length = s.len();//这个length是usize类型，基础类型，存储在Stack中

        (s, length)//这里length返回一个副本就可以了
    }

这种做法，不得不把变量作为参数传入，然后又作为返回值传出，很繁琐

针对这个场景，Rust 有一个特性，叫做 “引用” （Reference）
