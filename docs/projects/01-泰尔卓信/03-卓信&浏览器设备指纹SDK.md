---
title: 卓信&浏览器设备指纹SDK
aside: false
editLink: false
lastUpdated: false
showComment: false
---

# 卓信&浏览器设备指纹SDK

## 项目背景
卓信SDK是集成卓信ID业务、移动&联通&电信三大运营商免验证码登录和反欺诈方案、浏览器&小程序设备指纹，且对不同服务商、手机厂商进行客制化匹配


## 项目需求
- 卓信ID的SDK支持主要是IOS和Android，现在需要支持手机端浏览器和小程序
- 需要实现能够覆盖大部分浏览器设备指纹的方案
- 需要支持小程序端
- 需要高度混淆且不可逆，同时保证混淆后的打包大小不超过50KB，越小越好


## 项目难点
- 现有浏览器设备指纹方案重复率高，准确命中率较低
- 浏览器指纹方案需要兼容移动端、PC端、小程序端，且需要支持多种浏览器和小程序
- 三大运营商的接口规范与卓信ID、推必安接口不统一，且存在跨域的问题
- 有6家服务商需要客制化SDK，原有方案需要手动命令构建并上传部署，时间成本过高
- 不同服务商客制化SDK更新周期不一致，且存在跨版本问题，每次部署后，都导致其他服务商的构建版本号变化，影响其他服务商的使用
- 代码需要混淆，经反混淆后不可逆，且需要保证代码混淆后不改变功能


### 项目评估&选型


## 开发盘点
### 按项目需求



### 按项目难点
- 问题：现有浏览器设备指纹方案重复率高，准确命中率较低
现有浏览器设备指纹方案是使用`fingerprintjs`，但存在重复率过高的问题，而付费版本费用较高，也存在一定重复率

#### 第一层设备指纹
根据`fingerprintjs`的方案，筛选可用的指标，重新写第一层基础浏览器指纹的代码
可用指标：<br>
fonts、domBlockers、fontPreferences、audio、screenFrame、osCpu、languages、colorDepth、deviceMemory、screenResolution、hardwareConcurrency、timezone、sessionStorage、localStorage、indexedDB、openDatabase、cpuClass、platform、plugins、canvas、touchSupport、vendor、vendorFlavors、cookiesEnabled、colorGamut、invertedColors、forcedColors、monochrome、contrast、reducedMotion、hdr、math

#### JA3指纹方案


- 问题：运营商接口规范与卓信ID、推必安接口不统一，且存在跨域问题




- 问题：
  - 有6家服务商需要客制化SDK，原有方案需要手动命令构建并上传部署，时间成本高；
  - 不同服务商客制化SDK更新周期不一致，且存在跨版本问题，每次部署后，都导致其他服务商的构建版本号变化，影响其他服务商的使用；



- 问题：代码需要混淆，经反混淆后不可逆，不暴露接口信息，且需要保证代码混淆后不改变功能

## 混淆打包方案
关于混淆打包，最早想的是Webpack方案，首先尝试了Webapck打包



但Webpack打包后，代码体积反而更大了，经过Vite、Rollup、Weback多个打包方案的试验，最终采用Rollup方案。


#### 未来展望


## 项目总结




背景
运营同事发现大量的拼单、淘宝和闲鱼上的会员账号租借服务、外借账号等问题已经影响到了公司营收。为了缓解这种问题，我们决定限制单一账号能够保持登陆状态的设备数量，以此提高租借账号的成本。要想限制设备，首先要解决的问题就是如何识别一台设备。这可以借助FingerprintJS 来解决，然而并不是所有指纹选项都能够投入到生产环境。高熵值的指纹确实可以增加设备的识别率，但却会导致设备指纹频繁变化，从而引起用户频繁掉线，最终影响用户体验。因此我需要解决的第一个问题就是在设备识别率和用户体验之间找到一个熵值的平衡点。我采取的方案是先在各个试点项目中接入计算指纹的逻辑，并不定期给后端发送最新指纹计算结果，后端将这些数据收集起来进行分析，最终在指纹变化频率在可接受范围内找到尽可能多的指纹选项。

数据
每条记录都包含下列字段。

指纹(由小写字母和数字组成的32位字符串)

下列32项是从用户浏览器收集到的指纹的名称。每个名称对应表的一个同名字段。如果对这些指纹的计算逻辑有兴趣可以看看我的这篇文章

fonts、domBlockers、fontPreferences、audio、screenFrame、osCpu、languages、colorDepth、deviceMemory、screenResolution、hardwareConcurrency、timezone、sessionStorage、localStorage、indexedDB、openDatabase、cpuClass、platform、plugins、canvas、touchSupport、vendor、vendorFlavors、cookiesEnabled、colorGamut、invertedColors、forcedColors、monochrome、contrast、reducedMotion、hdr、math

标记(由小写字母和数字组成的32位字符串)：browserMark

创建时间(unix)：createdAt

生成单个指纹所需时间(秒)：generateTime

筛选可用指纹
上述的32类指纹不一定每个都符合我们的上线指标，因此要经过筛选。判断一个指纹是否可用需要参考两个指标，这两个指标必须同时合格才能被认定是可用指纹。

「平均变化周期」指标
在这一指标中，我需要观察单个指纹的「平均变化周期」 是否在大多数设备上都能达到可接受的水平。

后端计算
中间变量的计算规则
在计算出最终结果之前会产生一些中间变量，下面列出了这些变量的计算规则。这些计算规则只是为了讲述清楚我希望得到什么样的计算结果，而不是要对计算过程的写法做出的规定。

fcc(指纹变化周期)
依据browserMark对记录分组，同组按照createdAt升序排列。 从头依次遍历组内记录，对每条记录还需依次遍历其全部种类的指纹。对于每一类指纹，都应做如下处理：

用当前记录的指纹比对相同指纹的「上一条记录」，判断两者是否一致。若不一致 则认为此指纹发生了变化。 那么指纹本次的变化周期为当前记录的createdAt减去当前指纹的「上一条记录」的createdAt得到的差值。同时当前记录作为此指纹的「上一条记录」。若一致 则认为指纹没有变化，继续遍历下一条记录。

如果上面这段描述不够清晰，可以结合下面的伪代码来辅助理解:

const allRecord //查询得到的全部记录
const fccCollector = {}

for (let gi = 0; gi < allRecord.groupCount; gi++) {
  const lastRecordMap = {} //这里存储了各指纹的「上一条记录」
  const group = allRecord[gi] //当前分组

  for (let ri = 0; ri < group.rowCount; ri++) {
    const row = group[ri]; //当前记录(行)

    for (let ci = 0; ci < row.columnCount; ci++) {
      const col = row[ci]; //当前列
      const fingerprintName = col.name;//指纹的名称
      const fingerprintValue = col.value;//指纹的值
      const lastRecord = lastRecordMap[fingerprintName];//取出「上一条记录」
      if (lastRecord && lastRecord.value != fingerprintValue) {//此时认为指纹发生了变化
        const fcc = col.createdAt - lastRecord.createdAt; //计算本次的变化周期
        fccCollector[col.browserMark][fingerprintName] = fcc //将本次fcc存起来
        lastRecordMap[fingerprintName] = { value: fingerprintValue, createdAt: row.createdAt };
      }
      else if (!lastRecord) {//此时认为是此类型指纹首次出现
        lastRecordMap[fingerprintName] = { value: fingerprintValue, createdAt: row.createdAt };
      }

    }
  }
}

1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
上述伪代码中fccCollector变量的结构如下:

fccCollector={
  browserMark1:{
    fonts:[123,4341,111], //单位s,每一个数组元素是一个变化周期
    domBlockers:[4213],
    ...//依次是32个指纹
  },
  browserMark2:{
    fonts:[123],
    domBlockers:[123],
    ...
  },
  ...//依次是全部的browserMark
}
1
2
3
4
5
6
7
8
9
10
11
12
13
上述伪代码中lastRecord变量的结构如下:

  {
    fonts:{
    	value:"cde2267cc4c61e7bd9ebb893e2da3193",
    	createdAt:1640835596
    },
    domBlockers:{
    	value:"fa2fc67cc4c61e7bd9ebb893e2da3512",
    	createdAt:1640835341
    },
    ...
  }
1
2
3
4
5
6
7
8
9
10
11
afcc(指纹平均变化周期):
全部变化周期相加的和除以变化周期的数量，对计算结果向上取整。如果没有变化，则认为变化周期是0。但凡有变化，由于向上取整，平均变化周期必然大于等于1。伪代码如下:

//例如计算browserMark为cde2267cc4c61e7bd9ebb893e2da3193的设备的fonts指纹的平均变化周期

function calculateAfcc() {
  const browserMark = "cde2267cc4c61e7bd9ebb893e2da3193"
  const fontsFcc = fccCollector[browserMark].fonts;
  let sum = 0
  if (fontsFcc.length > 0) {
    for (let i = 0; i < fontsFcc.length; i++) {
      sum += fontsFcc[i]
    }
    return Math.ceil(sum / fontsFcc.length)
  }
  return 0
}



1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
最终结果的计算规则
后端计算方法允许接受两个 参数：

t：数据的时间范围。只对范围t内的数据做计算。

x：指纹必须满足的「平均变化周期」下限。单位是秒。(基本等同于token过期时间)

计算结果 如下：

p：「平均变化周期」大于等于x的browserMark 占比。
计算方法的描述
根据t来筛选指定日期范围内的记录，并按照browserMark分组，分组数记为c。然后计算每组内每种指纹的「平均变化周期」，也就是说每个browserMark都会对应32个「平均变化周期」。然后按照32种指纹将全部「平均变化周期」分成32组，每组有c条数据。遍历这c条数据计算出值大于等于x的条目的数量，用这个数量除以c，得到p。

前端展现

（为保护机密，上图使用虚拟数据）

因为很难做到某个指纹在所有设备上的平均变化周期都大于等于x，因此在前端还要经过一道筛选，来决定要放弃多少设备。

n：能够接受的p的最小值。即某种指纹的p大于等于n则认为指纹的平均变化周期指标是合格的。

cn：100%-n得到的值。基本等同于放弃cn台设备的使用体验（实际放弃的设备比例会小于cn）。

「生成时间」指标
在这一指标中，我需要观察指纹的「生成时间」 是否在大多数设备上都能达到可接受的水平。

后端计算
中间变量的计算规则
在计算出最终结果之前会产生一些中间变量，下面列出了这些变量的计算规则。同样的，这些计算规则只是为了讲述清楚我希望得到什么样的计算结果，而不是要对计算过程的写法做出的规定。

每台设备的某指纹的平均生成时间
依据browserMark对记录做分组，用组内每条记录的createdAt相加得到的和除以组内记录的数量得到平均生成时间。对计算结果向上取整。

最终结果的计算规则
后端计算方法允许接受两个 参数，如下：

t：数据的时间范围。只对范围t内的数据做计算。

x：指纹必须满足的「生成时间」上限。单位是ms。（因为每次接口请求都要计算指纹，所以等指纹功能上线后每个项目的每个接口的都会至多增加「x*合格指纹数量」的时间花费。）

计算结果 如下：

p：「平均生成时间」小于等于x的browserMark 占比。
计算方法的描述
根据t来筛选指定日期范围内的记录，并按照browserMark分组，分组数记为c。然后计算每组内每种指纹的「平均生成时间」，也就是说每个browserMark都会对应32个「平均生成时间」。然后按照32种指纹将全部「平均生成时间」分成32组，每组有c条数据。遍历这c条数据计算出值小于等于x的条目数量，用这个数量除以c，得到p。

前端展现
因为很难做到某个指纹在所有设备上的平均生成时间都小于等于x，因此在前端还要经过一道筛选，来决定要放弃多少设备的使用体验。

n：能够接受的p的最大值。即某种指纹的p大于等于n则认为此指纹的平均生成时间指标是合格的。

cn：100%-n得到的值。基本等同于放弃cn台设备的使用体验（实际放弃的设备比例会小于cn）。
