---
title: JavaScript中的深浅拷贝
aside: true
editLink: false
lastUpdated: false
showComment: false
showSidebar: true
---


# “深拷贝” 与 “浅拷贝” 

## 基础概念
JavaScript的数据类型
- Javascript有五种基本数据类型和两种引用类型
- 基本类型（栈内存）
    Undefined，Null，Boolean，Number和String
- 引用数据类型（堆内存）
    - Object
    - Array

- Undefined和Null的区别
    - Undefined类型只有一个值，就是undefined，已声明未赋值的变量输出的结果
    - Null类型也只有一个值，也就是null， 一个不存在的对象的结果

## 深浅拷贝使用对象
- 主要针对复杂数据类型（Object，Array）的复制问题。
浅拷贝与深拷贝都可以实现在已有对象上再生出一份的作用。但是对象的实例是存储在堆内存中然后通过一个引用值去操作对象，由此拷贝的时候就存在两种情况了：

## 浅拷贝和深拷贝的区别
- 拷贝引用和拷贝实例的区别
- 浅拷贝（shallow copy）：
    - 只复制指向某个对象的指针，而不复制对象本身，新旧对象共享一块内存；   
    - 深拷贝（deep copy）：复制并创建一个一摸一样的对象，不共享内存，修改新对象，旧对象保持不变。

## 浅拷贝的实现
浅拷贝的意思就是只复制引用，而未复制真正的值，有时候我们只是想备份数组，但是只是简单让它赋给一个变量，改变其中一个，另外一个就紧跟着改变。
### 对象的浅拷贝：
```javascript
var obj = {
   name:'Hanna Ding',
   age: 22
}
var obj2 = obj;
obj2['c'] = 5;
console.log(obj); //Object {name: "Hanna Ding", age: 22, c: 5}
console.log(obj2); //Object {name: "Hanna Ding", age: 22, c: 5}
```

### 数组的浅拷贝：
```js
var arr = [1, 2, 3, '4'];

var arr2 = arr;
arr2[1] = "test"; 
console.log(arr); // [1, "test", 3, "4"]
console.log(arr2); // [1, "test", 3, "4"]

arr[0]="fisrt"
console.log(arr); // ["fisrt", "test", 3, "4"]
console.log(arr2); // ["fisrt", "test", 3, "4"]
```
- 利用 = 赋值操作符实现了一个浅拷贝
- 随着 arr2 和 arr 改变，arr 和 arr2 也随着发生了变化
## 深拷贝的实现
### 数组的深拷贝
#### 使用slice()和concat()方法来解决上面的问题
##### slice()
```js
var arr = ['a', 'b', 'c'];
var arrCopy = arr.slice(0);
arrCopy[0] = 'test'
console.log(arr); // ["a", "b", "c"]
console.log(arrCopy); // ["test", "b", "c"]
```
##### concat()
```js
var arr = ['a', 'b', 'c'];
var arrCopy = arr.concat();
arrCopy[0] = 'test'
console.log(arr); // ["a", "b", "c"]
console.log(arrCopy); // ["test", "b", "c"]
```
#### 局限性
slice() 和 concat()拷贝的局限性
```js
var arr1 = [{"name":"Roubin"},{"name":"RouSe"}];//原数组
var arr2 = [].concat(arr1);//拷贝数组
arr1[1].name="Tom";
console.log(arr1);//[{"name":"Roubin"},{"name":"Tom"}]
console.log(arr2);//[{"name":"Roubin"},{"name":"Tom"}]
```
结论：使用.concat()和浅拷贝的结果一样
那slice()会出现什么结果
```js
var arr1 = [{"name":"weifeng"},{"name":"boy"}];//原数组
var arr2 = arr1.slice(0);//拷贝数组
arr1[1].name="girl";
console.log(arr1);// [{"name":"weifeng"},{"name":"girl"}]
console.log(arr2);//[{"name":"weifeng"},{"name":"girl"}
```
结论：使用.slice()和浅复制的结果一样
```js
var a1=[["1","2","3"],"2","3"];
var a2=a1.slice(0);
a1[0][0]=0; //改变a1第一个元素中的第一个元素
console.log(a1);  //[["0","2","3"],"2","3"]
console.log(a2);   //[["0","2","3"],"2","3"]
```

- 由于数组的内部属性值是引用对象（Object，Array），slice和concat对对象数组的拷贝，整个拷贝还是浅拷贝，拷贝之后数组各个值的指针还是指向相同的存储地址.
- 因此，slice和concat这两个方法，仅适用于对不包含引用对象的一维数组的深拷贝

arrayObj.slice(start, [end]) 该方法返回一个 Array 对象，其中包含了 arrayObj 的指定部分。不会改变原数组
arrayObj.concat() 方法用于连接两个或多个数组。该方法不会改变现有的数组，而仅仅会返回被连接数组的一个副本。
其实也就是下面实现的方式，但还是用上面的方法来实现比较简单高效些

```js
function deepCopy(arr1, arr2) {
   for (var i = 0; i < arr1.length; ++i) {
       arr2[i] = arr1[i];
   }
}
```

##### ES6扩展运算符实现数组的深拷贝
```js
var arr = [1,2,3,4,5]
var [ ...arr2 ] = arr
arr[2] = 5
console.log(arr)  //[1,2,5,4,5]
console.log(arr2)  //[1,2,3,4,5]
```

#### 对象的深拷贝
- 对象的深拷贝实现原理： 定义一个新的对象，遍历源对象的属性并赋给新对象的属性

- 两种方案：
    - 利用递归来实现每一层都重新创建对象并赋值
    - 利用 JSON 对象中的 parse 和 stringify
##### ES6扩展运算符实现对象的深拷贝
```js
var obj = {
  name: 'FungLeo',
  sex: 'man',
  old: '18'
}
var { ...obj2 } = obj
obj.old = '22'
console.log(obj)   ///{ name: 'FungLeo', sex: 'man', old: '22'}
console.log(obj2)  ///{ name: 'FungLeo', sex: 'man', old: '18'}
```

```js
var obj = {
   name:'xiao ming',
   age: 22
}

var obj2 = new Object();
obj2.name = obj.name;
obj2.age = obj.age

obj.name = 'xiaoDing';
console.log(obj); //Object {name: "xiaoDing", age: 22}
console.log(obj2); //Object {name: "xiao ming", age: 22}
```
obj2是在堆中开辟的一个新内存块，将obj1的属性赋值给obj2时，obj2是同直接访问对应的内存地址。
- 递归的方法
    - 递归的思想就很简单了，就是对每一层的数据都实现一次 创建对象->对象赋值的操作。
```js
function deepClone(source){
  const targetObj = source.constructor === Array ? [] : {}; // 判断复制的目标是数组还是对象
  for(let keys in source){ // 遍历目标
    if(source.hasOwnProperty(keys)){
      if(source[keys] && typeof source[keys] === 'object'){ // 如果值是对象，就递归一下
        targetObj[keys] = source[keys].constructor === Array ? [] : {};
        targetObj[keys] = deepClone(source[keys]);
      }else{ // 如果不是，就直接赋值
        targetObj[keys] = source[keys];
      }
    } 
  }
  return targetObj;
}

var obj = {
    name: 'Hanna',
    age: 22
}
var objCopy = deepClone(obj)
obj.name = 'ding';
console.log(obj);//Object {name: "ding", age: 22}
console.log(objCopy);//Object {name: "Hanna", age: 22}
```

- 对象与Json相互转换
JSON.stringify/parse的方法

- JSON.stringify()：是将一个 JavaScript 值转成一个 JSON 字符串。



- JSON.parse():是将一个 JSON 字符串转成一哥JavaScript 值或对象。
JavaScript 值和 JSON 字符串的相互转换。

```js
function  deepClone(origin){
    var clone={};
    try{
        clone= JSON.parse(JSON.stringify(origin));
    }
    catch(e){
        
    }
    return clone;

}
```
未封装和封装的进行比较：
```js
const originArray = [1,2,3,4,5];
const cloneArray = JSON.parse(JSON.stringify(originArray));
console.log(cloneArray === originArray); // false
const originObj = {a:'a',b:'b',c:[1,2,3],d:{dd:'dd'}};
const cloneObj = JSON.parse(JSON.stringify(originObj));
console.log(cloneObj === originObj); // false
 
cloneObj.a = 'aa';
cloneObj.c = [1,1,1];
cloneObj.d.dd = 'tt';
 
console.log(cloneObj); 
console.log(originObj);
/****************封装层**************/
function  deepClone(origin){
    var  clone={};
    try{
       clone= JSON.parse(JSON.stringify(origin));
    }
    catch(e){
        
    }
    return clone;

}
const originObj = {a:'a',b:'b',c:[1,2,3],d:{dd:'dd'}};
const cloneObj = deepClone(originObj);
console.log(cloneObj === originObj); // false
 //改变值
cloneObj.a = 'aa';
cloneObj.c = [4,5,6];
cloneObj.d.dd = 'tt';

console.log(cloneObj); // {a:'aa',b:'b',c:[1,1,1],d:{dd:'tt'}};
console.log(originObj);// {a:'a',b:'b',c:[1,2,3],d:{dd:'dd'}};
```
- 虽然上面的深拷贝很方便（请使用封装函数进行项目开发以便于维护），但是，只适合一些简单的情景（Number, String, Boolean, Array, Object），扁平对象，那些能够被 json 直接表示的数据结构。function对象，RegExp对象是无法通过这种方式深拷贝。



## JSON.stringify()在深浅拷贝中的坑
### 处理undefined、Function和Symbol值
- undefined、Function和Symbol值不是有效的JSON值，用JSON.stringify()转换对象时，如果对象中有以上值时会被省略，或者被更改为null。

例如：
```javascript
const obj1 = { 
    foo: function() {}, 
    bar: undefined, 
    baz: Symbol('example') 
};  
const obj2 = {
    arr: [function(){}]
};  
const jsonString = JSON.stringify(obj1);  
console.log('obj1转换后的值为:',jsonString); 
console.log('obj2转换后的值为:',JSON.stringify(obj2)); 
// 输出: '{}'  
// 输出: {"arr":[null]}
```
### 布尔、数字和字符串对象
- 布尔、数字和字符串对象在字符串化过程中会被转换为它们对应的原始值。

```javascript
const boolObj = new Boolean(true);  
const jsonString = JSON.stringify(boolObj);  
console.log(jsonString); // 输出: 'true'
```

### 忽略Symbol键的属性
- Symbol键属性在字符串化过程中完全被忽略，即使使用替换函数也是如此。这意味着与Symbol键关联的任何数据都将在生成的JSON字符串中被排除。

```javascript
const obj1 = {
    [Symbol('example')]: 'value'
};  
const obj2 = {
    [Symbol('example')]: [function(){}]
    };  
const jsonString = JSON.stringify(obj1);  
console.log(jsonString);
console.log(JSON.stringify(obj2));
 // 均输出: '{}'  
```
### 处理无穷大（Infinity）、NaN和Null值
- Infinity、NaN 和 null 值在字符串化过程中都被视为 null。
```javascript
const obj = { 
    value: Infinity, 
    error: NaN, 
    nothing: null
    };  
const jsonString = JSON.stringify(obj);  
console.log(jsonString); 
// 输出: '{"value":null,"error":null,"nothing":null}'
```

### Date对象被视为字符串
- Date实例通过实现toJSON()函数来返回一个字符串（与date.toISOString()相同），因此在字符串化过程中被视为字符串。

```javascript
const dateObj = new Date();
const jsonString = JSON.stringify(dateObj);
console.log(jsonString); 
// 输出："2024-01-31T09:42:00.179Z"
```

### 循环引用异常
如果 JSON.stringify() 遇到具有循环引用的对象，它会抛出一个错误。循环引用发生在一个对象在循环中引用自身的情况下。

```javascript
const circularObj = { self: null };
circularObj.self = circularObj;
JSON.stringify(circularObj); 
// Uncaught TypeError: Converting circular structure to JSON
```

#### BigInt转换错误
- 使用JSON.stringify（）转换BigInt类型的值时引发错误。
```javascript
const bigIntValue = BigInt(42);  
JSON.stringify(bigIntValue); // Uncaught TypeError: Do not know how to serialize a BigInt
```

### 总结
- 对象中有时间类型的时候，序列化之后会变成字符串类型。
- 对象中有undefined和Function类型数据的时候，序列化之后会直接丢失。
- 对象中有NaN、Infinity和-Infinity的时候，序列化之后会显示null。
- 对象循环引用的时候，会直接报错。


