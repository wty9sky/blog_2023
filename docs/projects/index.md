---
title: 我的项目
aside: false
editLink: false
lastUpdated: false
showComment: false
showSidebar: false
sidebar: false
prev: false
next: false
---

<ProjectCard :projects="projectList" :games="gameList" :ais="aiList" />

<script setup>
const projectList=[
  {
  name:'泰尔卓信综合平台',
  desc:`为<b>泰尔卓信</b>科技有限公司开发的卓信ID、推必安官网以及包含开发者管理、服务商管理、SDK版本管理、权限管理、多重配置管理、设备命中策略等功能的中后台管理平台。`,
  icon:'../public/img/zxid_icon.png',
  showUrl:true,
  openSource:false,
  time:'2022年1月-2023年7月',
  url:[
    {
      name: "泰尔卓信官网",
      url: "http://www.telzx.com/",
      type:'url'
    }, 
    {
        name: "卓信ID",
        url: "https://zxid.caict.ac.cn/",
        type:'url'
    }, 
    {
      name: "推必安",
      url: "https://tuibian.mobileservice.cn/",
      type:'url'
    }],
    tags:['官网','中后台','管理系统','SDK管理'],
    log:'/projects/01-前端&全栈开发/01-泰尔卓信综合平台'
    },
    {
  name:'卓信&浏览器设备指纹SDK',
  desc:'为<b>泰尔卓信</b>科技有限公司开发的基于卓信ID、推必安的前后端SDK以及基于浏览器的设备指纹SDK，目的在于为服务商等提供不同平台下的卓信SDK需求。',
  icon:'../public/img/fingerprint.png',
  time:'2023年2月-2023年7月',
  type:'url',
  showUrl:false,
  openSource: false,
  tags:['设备指纹','Rollup','SDK开发','小程序SDK'],
   log:'/projects/01-前端&全栈开发/01-泰尔卓信综合平台'
},
{
  name:'游戏讨论&创作社区',
  desc:'以掘金社区、CSDN等平台为模版，个人独立开发的基于游戏领域开发的包括WEB、APP、小程序等多个平台的社区，实现玩家通过社区进行讨论和创作，正在开发中。未来会基于该社区开发通用社区模版并提供插件市场。',
  icon:'../public/img/game.png',
  time:'2023年2月-至今',
  type:'url',
  showUrl:true,
  url:[{
  name: "轩辕天书社区",
  url: "http://fans.swdwiki.com/",
  type:'url'
  }],
  openSource: true,
  gitUrls:[{
    type:'github',
    url:'https://github.com/swdwiki/fans_web',
  }],
  tags:['全栈','独立开发','Nestjs','Golang','APP开发'],
   log:'/projects/01-前端&全栈开发/02-游戏讨论&创作社区'
}, {
  name:'Sword Design',
  desc:'Sword Design是基于游戏轩辕剑的粉丝社区相关产品衍生出来的包括PCWEB、小程序、APP等平台多平台的设计框架，未来可用于技术、游戏等新型移动社区类产品。目前正在开发中。',
  icon:'../public/img/sword_design.png',
  time:'2023年3月-至今',
  type:'url',
  showUrl:true,
  url:[{
  name: "文档地址",
  url: "http://design.swdwiki.com/docs",
  type:'url'
  }],
  openSource:true,
  gitUrls:[{
    type:'github',
    url:'https://github.com/swdwiki/swordui',
  }],
  tags:['设计系统','多平台','UI框架','开源','独立开发'],
},{
  name:'Vue3源码解析',
  desc:'深入了解Vue3的原理，实现最简vue3模型，用于深入学习vue3，理解vue3的核心逻辑。',
  icon:'../public/img/vue.png',
  time:'2022年-2023年',
  type:'url',
  showUrl:false,
  url:[{
  name: "学习笔记",
  url: "/notes/vue3/index",
  type:'url'
  }],
  openSource:true,
  gitUrls:[{
    type:'github',
    url:'https://github.com/wty9sky/mini-vue3',
  }],
  tags:['实验','源码解析','实现原理','Vue3'],
},
// {
//       name:'Rust小工具',
//       desc:'基于Rust开发的各种小工具，持续性学习和开发Rust小工具，以及实现前端工具链，并产出学习与开发笔记。',
//       icon:'../public/img/rust_icon.png',
//       type:'url',
//       showUrl:true,
//       time:'2023年2月-至今',
//       url:[{
//         type:'url',
//         name: "DEMO",
//         url: "https://github.com/wty9sky/rust-tools",
//       },{
//         type:'url',
//         name: "学习笔记",
//         url: "/notes/rust/index",
//       }],
//       openSource:true,
//       gitUrls:[{
//         type:'github',
//         url:'https://github.com/wty9sky/rust-tools',
//       }],
//       tags:['实验','Rust','工具','工具链','学习笔记'],
// },
{
  name:'牡丹江防疫控制管理平台',
  desc:'在入职<b>盛世雪城</b>工作时期内，主导负责的第一个项目，通过迭代与重构开发，在疫情时期为牡丹江地区防疫提供较大助力，同时通过该项目逐渐落地确定开发组后续项目的主要开发技术路线与规范。',
  icon:'../public/img/myk.png',
  showUrl:true,
  time:'2020年2月-2022年10月',
  url:[{
    type:'minapp',
  name: "访问牡疫控小程序",
  url: "./img/myk_ewm.jpg",
  }],
  openSource:false,
  tags:['后台','小程序','Serverless','重构'],
   log:'/projects/01-前端&全栈开发/03-牡疫控平台'
}];

const gameList=[]
const aiList = []
</script>

<style scoped>
.vp-doc ul, .vp-doc ol{
    padding-left: 0;
}
</style>
