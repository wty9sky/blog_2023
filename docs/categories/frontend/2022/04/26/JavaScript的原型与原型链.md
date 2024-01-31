---
title: JavaScript的原型与原型链
aside: true
editLink: false
lastUpdated: false
showComment: false
---

# JavaScript 的原型与原型链

## 原型

JavaScript 原型是每个对象都具有的属性，它指向一个对象，通常称之为原型对象。
当访问一个对象的属性或方法时，JavaScript 引擎首先会在该对象自身查找，如果找到则直接使用。如果找不到，则会去该对象的原型对象中查找。
下面一个简单的例子来说明原型的概念：

```js
// 创建一个构造函数
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// 在构造函数的原型对象上定义方法
Person.prototype.sayHello = function () {
  console.log(
    "Hello, my name is " + this.name + " and I am " + this.age + " years old."
  );
};

// 创建一个对象
var person1 = new Person("Alice", 25);

// 调用对象的方法
person1.sayHello(); // 输出：Hello, my name is Alice and I am 25 years old.

// person1 对象没有自己的 sayHello 方法，但它可以通过原型链找到 Person 构造函数的原型对象，并调用原型对象上的方法。
```

定义了一个构造函数 Person，它有两个属性 name 和 age，并在构造函数的原型对象上定义了一个方法 sayHello。然后通过 new 关键字创建了一个对象 person1，然后就可以通过 person1.sayHello() 来调用原型对象上的方法。
这里需要注意的是，所有通过 new 关键字创建的对象都会共享同一个原型对象，即它们的原型指向的是同一个对象。
这就是 JavaScript 原型的基本概念和用法，它是实现继承和共享属性和方法的重要机制。

## 原型链

JavaScript 中的原型链是基于对象的继承机制，它通过每个对象都具有一个指向其原型对象的内部链接来实现。
当访问一个对象的属性或方法时，如果该对象本身该属性或方法，JavaScript 引擎会沿着对象的型链一直向上找，直到找到或者到达原型链的末端。如果最终还没有到，则返回 undefined。

下是一个简单的例子来说明型链的概念：

```js
// 定义一个构造函数
function Animal(name) {
  this.name = name;
}

// 在构造函数的原型对象上定义方法
Animal.prototype.eat = function (food) {
  console.log(this.name + " is eating " + food);
};

// 定义一个子构造函数
function Cat(name) {
  this.name = name;
}

// 创建一个父对象实例
var animal = new Animal("Tom"); // 将父对象实例为子对象的原型
Cat.prototype = animal;

// 创建一个子对象实例
var cat = new Cat("Kitty");

// 调用子对象的方法
cat.eat("fish"); // 输出：Kitty is eating fish
```

定义了一个构造函数 Animal 和一个子构造函数 Cat。创建了一个父对象实例 animal，并在它的原型对象上定义了一个方法 。然后将父对象实例 animal 设置为子对象 Cat 的原型对象，这样子对象 cat 就可以通过原型链访问到父对象 animal 的属性和方法。
当调用 cat.eat("fish") 时，由于 cat 对象本身没有 eat 方法，JavaScript 引擎会沿着原型链逐级向查找，找到父对象 animal 的 eat 方法，并执行。
这就是 JavaScript 中原型链的基本原理：对象通过原型链实现属性和方法的承，每个对象通过内部链接指向其原型对象，形成一个链条。
需要注意的是，原型链是单向的，子对象可以访问父对象属性和方法，但父对象不能访问子对象的属性和方法。

## 隐式原型和显式原型

隐式原型和显式原型是原型链中的两个重要概念。

隐式原型（**proto**）：每个对象都有一个隐式原型，它指向创建该对象的构造函数的原型对象。可以通过 obj.**proto**来访问对象的隐式原型。

显式原型（prototype）：每个构造函数都有一个显式原型，它是一个对象，用于存储该构造函数创建的对象共享的属性和方法。可以通过 constructor.prototype 来访问构造函数的显式原型。

区别：

隐式原型是每个对象都具有的属性，它是对象与构造函数之间的连接。而显式原型是构造函数才具有的属性，它定义了构造函数的实例对象共享的属性和方法。

隐式原型指向的是创建该对象的构造函数的原型对象，而显式原型指向的是构造函数的原型对象本身。

通过修改显式原型可以影响构造函数创建的所有对象的属性和方法，而修改隐式原型只会影响一个对象的原型链。

下面通过代码来说明隐式原型和显式原型的概念：

```js
// 定义构造函数
function Person(name, age) {
this.name = name;// 定义 name 属性
this.age = age; // 定义 age 属性
}

// 在构造函数的显式原型上定义一个方法
Person.prototype.sayHello = function () {
console.log("Hello, my name is " + this.name);
};

// 创建一个对象实例
var person1 = new Person("Alice", 25);

// 访问对象的属性和方法
console.log(person1.name); // 输出：Alice
person1.sayHello(); // 输出：Hello, my name is Alice

// 访问对象的隐式原型和显式原型
console.log(person1.**proto**); // 输出：指向构造函数的显式原型对象
console.log(Person.prototype); // 输出：构造函数的显式原型对象
console.log(person1.**proto** === Person.prototype); // 输出：true
```

定义了一个构造函数 Person，并在它的显式原型上定义了一个方法 sayHello。然后通过 new 关键字创建了一个对象实例 person1。
可以通过 person1.name 访问对象的属性，通过 person1.sayHello() 调用对象的方法。
由于对象 person1 是通过构造函数 Person 创建的，因此它的隐式原型指向的是 Person 构造函数的显式原型对象。通过 person1.**proto 或者 Person.prototype 访问到显式原型对象。
需要注意的是，**proto\_\_ 是一个非标准的属性，尽量避免在实际开发中直接使用它，而是使用 Object.getPrototypeOf() 或者 Object.setPrototypeOf() 来操作原型。

## 构造器 constructor

构造器（constructor）是 JavaScript 中一种特殊的方法，用于创建和初始化对象。它通常用于构造函数（Constructor Function）中。
构造函数是一种特殊的函数，用于创建对象。构造函数通常以大写字母开头，这是为了与普通函数做区分。构造函数除了用于创建对象外，还可以定义实例对象的属性和方法。
构造器（constructor）是构造函数中的一个特殊方法，用于实例化对象时进行初始化操作。构造器的作用是在创建新对象的同时，给这个对象设置初始的属性和方法。

下面是一个示例，用于演示构造函数和构造器的概念和用法：

```js
// 定义一个构造函数
function Person(name, age) {
  // 构造器（constructor），用于初始化对象
  this.name = name;
  this.age = age;

  // 定义实例方法
  this.sayHello = function () {
    console.log("Hello, my name is " + this.name);
  };
}

// 创建实例对象
var person1 = new Person("Alice", 25);
var person2 = new Person("Bob", 30);

// 调用实例方法
person1.sayHello(); // 输出：Hello, my name is Alice
person2.sayHello(); // 输出：Hello, my name is Bob
```

在上面的示例中，定义了一个构造函数 Person，它接受两个参数 name 和 age，并在构造器中分别给实例对象设置了 name 和 age 属性。
通过 new 关键字，可以实例化 Person 构造函数，创建了两个实例对象 person1 和 person2。每个实例对象都有自己独立的 name 和 age 属性。
构造函数中定义了一个实例方法 sayHello，通过调用实例对象的 sayHello 方法，实例对象可以打印出自己的名字。
需要注意的是，每个实例对象都会有一个独立的 sayHello 方法，这可能会导致内存占用较大。为了避免这个问题，可以使用原型方法的方式来定义方法，从而实现属性和方法的共享，提高代码内存利用率。例如：

```js
// 定义一个构造函数
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// 定义实例方法
Person.prototype.sayHello = function () {
  console.log("Hello, my name is " + this.name);
};
```

这样，每个实例对象共享一个 sayHello 方法，避免了重复创建实例方法的问题。
总结起来，构造器（constructor）是构造函数中用于初始化对象的特殊方法。它在实例化对象时被调用，通过构造器可以给对象设置初始的属性和方法。构造函数和构造器在 JavaScript 开发中非常常见，有助于实现对象的创建和初始化。
四、三个重要属性
在 JavaScript 中，**proto**、prototype、constructor 是三个与原型链密切相关的属性或特性。

**proto** 是一个非标准的属性，它是对象与构造函数之间的连接，它指向创建该对象的构造函数的原型对象。可以通过 obj.**proto** 来访问对象的隐式原型。

prototype 是函数对象所特有的属性，它是一个对象，用于存储该构造函数创建的对象共享的属性和方法。例如，通过 Person.prototype 可以定义 Person 构造函数创建的实例对象共享的方法。

constructor 是原型对象上的一个属性，它指向创建该对象的构造函数，Person.prototype.constructor 指向 Person 构造函数本身。

它们之间的关系如下：

对象的 **proto** 属性指向所属构造函数的 prototype 属性，即对象的隐式原型指向构造函数的显式原型。
构造函数的 prototype 属性是一个普通对象，它具有 constructor 属性，指向创建该对象的构造函数自身。
构造函数创建的通过隐式原型与构造函数的显式原型相连接，形成一个原型链。

举例来说明：

```js
 function Person(name) {
this.name = name;
}

// 通过构造函数的显式原型定义方法
Person.prototype.sayHello = function() {
console.log("Hello, my name is " + this.name);
};

var person1 = new Person("Alice");
person1.sayHello(); // 输出：Hello, my name is Alice

// 隐式原型和显式原型的关系
console.log(person1.**proto** === Person.prototype); // 输出：true

// 构造函数和原型对象关系
console.log(person1.constructor === Person); // 输出：true
console.log(Person.prototype.constructor === Person); // 输出：true
```

通过构造函数 Person 和其原型对象 Person.prototype 实现了对象 person1 的属性和方法的共享。
person1.**proto** 指向构造函数 Person 的 prototype，因此隐式原型和显式原型是相连的。
person1.constructor 指向 Person 构造函数本身，而 Person.prototype.constructor 也指向 Person 构造函数。
这种关系形成了一个完整的原型链，实现了属性和方法的继承和共享。

## 总结

原型和原型链是 JavaScript 中非常重要的概念，理解它们的作用对于开发和理解 JavaScript 代码非常重要。

### 原型的作用：

实现属性和方法的共享：通过原型，可以将对象的属性和方法存储在原型对象中，从而实现多个对象之间的属性和方法的共享，避免了在每个对象实例中复制相同的属性和方法，节省了内存空间。
实现对象的继承：通过原型链，可以创建对象之间的继承关系，子对象可以继承父对象的属性和方法，并在此基础上进行扩展，实现了对象之间的继承和多态特性。

### 原型链的作用：

属性和方法的查找：当访问对象的属性或方法时，首先在自身对象中查找，如果找不到，则沿着原型链向上查找，直到找到该属性或方法为止。这样可以实现属性和方法的继承和共享，提高代码的重用性。
原型链的终点是 Object.prototype，它是所有对象的基础原型，包括 JavaScript 内置对象和自定义对象。

- JavaScript 是一门基于原型和原型链的面向对象的语言，理解原型和原型链是深入理解 JavaScript 语本身的必备基础。
- 理解原型和原型链可以更好地理解和使用 JavaScript 的核心特性，如继承、原型继承、对象创建等。
- 原型和原型链是深入学习和理解 JavaScript 高级特性的前提基础，如闭包、作用域、模块化等。
- 在实际开发中，原型和原型链相关的知识经常用于设计和构建复杂的 JavaScript 应用、设计模式和代码优化。
