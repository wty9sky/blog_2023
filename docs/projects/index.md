---
title: 我的项目之旅
aside: false
editLink: false
lastUpdated: false
showComment: false
showSidebar: false
sidebar: false
prev: false
next: false
---

<ClientOnly>
<ProjectList :projects="projects"/>
</ClientOnly>

<script setup>
import zxid from '../public/img/zxid_icon.png';
import fingerprint from '../public/img/fingerprint.png'
import swd from '../public/img/game.png'
import sword_design from '../public/img/sword_design.png'
import vue_icon from '../public/img/vue.png'
import myk from '../public/img/myk.png';
import airfly from '../public/img/airfly.png';
import earthworm from '../public/img/earthworm.png';
import swdwiki from '../public/img/swdwiki.svg';
import gamemic from '../public/img/gamemic.png';
import halo from '../public/img/halo.svg';
import totravel from '../public/img/totravel.png';
import life from '../public/img/life.png';
import love from '../public/img/love.png';


const companyProjects = {
  label: '主导公司项目',
  type:'full',
  list:[{
  label: '每日互动科技有限公司',
  value: 'tezx',
  time: "2022年1月-至今",
  projects: [
    {
      name: '泰尔卓信业务官网',
      desc: `泰尔卓信业务官网是为<b>每日互动科技有限公司</b>泰尔卓信项目组开发的卓信ID、推必安、泰尔卓信官网。`,
      icon: zxid,
      showUrl: true,
      openSource: false,
      time: '2022年1月-2022年4月',
      url: [
        {
          name: "泰尔卓信官网",
          url: "http://www.telzx.com/",
          type: 'url'
        },
        {
          name: "卓信ID",
          url: "https://zxid.caict.ac.cn/",
          type: 'url'
        },
        {
          name: "推必安",
          url: "https://tuibian.mobileservice.cn/",
          type: 'url'
        }
      ],
      tags: ['官网', '泰尔卓信', 'Vue3','Nest.js'],
      log: '/projects/01-泰尔卓信/01-泰尔卓信官网'
    },
    {
      name: '卓信业务管理平台',
      desc: `为<b>泰尔卓信</b>科技有限公司开发的卓信ID、推必安官网以及包含开发者管理、服务商管理、SDK版本管理、权限管理、多重配置管理、设备命中策略等功能的中后台管理平台。`,
      icon: zxid,
      showUrl: false,
      openSource: false,
      time: '2022年1月-2023年7月',
      tags: ['中后台', '微前端','微服务','Vue','Golang'],
      log: '/projects/01-泰尔卓信/02-泰尔卓信综合平台'
    },
    {
      name: '卓信&浏览器设备指纹SDK',
      desc: '为<b>泰尔卓信</b>科技有限公司开发的基于卓信ID、推必安的前后端SDK以及基于浏览器的设备指纹SDK，目的在于为服务商等提供不同平台下的卓信反欺诈ID的需求。',
      icon: fingerprint,
      time: '2023年2月-2023年7月',
      type: 'url',
      showUrl: false,
      openSource: true,
      gitUrls: [{
        name:'浏览器设备指纹方案[脱敏版]',
        type: 'github',
        url: 'https://github.com/wty9sky/fingerprint'
      }],
      tags: ['浏览器设备指纹', 'Rollup','SDK', '小程序SDK'],
      log: '/projects/01-泰尔卓信/03-卓信&浏览器设备指纹SDK'
    },
  ],
},{
  label:'黑龙江盛世雪城科技有限公司',
  value:'ssxc',
  time: "2022年1月-2022年1月",
  projects: [{
  name:'牡丹江海浪飞机场综合平台',
  desc:'本项目是基于牡丹江海浪飞机场原有官网、管理平台等需求重构改造，并开发安卓、iOS应用以及小程序，为海浪飞机场内部人员提供管理日常工作、机场维护等机场日常工作的平台。',
  icon:airfly,
  showUrl:false,
  time:'2020年10月-2022年12月',
  openSource:true,
  gitUrls:[{
    name:'Webpack实现jQuery和Vue项目共存',
    type:'github',
    url:'https://github.com/wty9sky/jq_vue_webpack'
  }],
  tags:['后台','小程序','Golang','React','Webpack'],
   log:'/projects/02-盛世雪城/01-牡丹江海浪飞机场管理平台'
},{
  name:'牡丹江防疫控制管理平台',
  desc:'在入职<b>盛世雪城</b>工作时期内，以开发组副组长身份主导负责的第一个项目，通过迭代与重构开发，在疫情时期与牡丹江国投合作为牡丹江地区防疫提供助力，同时通过该项目逐渐落地确定开发组后续项目的主要开发技术路线与开发规范。',
  icon:myk,
  showUrl:true,
  time:'2020年2月-2022年11月',
  openSource:false,
  url:[{
    type:'minapp',
  name: "访问牡疫控小程序",
  url: "./img/myk_ewm.jpg",
  }],
  tags:['后台','小程序','Serverless','重构'],
   log:'/projects/02-盛世雪城/03-牡疫控平台'
}]
}],
};
// const smallProjects = {
//   label:'参与项目',
//   type:'small',
//   list:[{
//   label:'黑龙江盛世雪城科技有限公司',
//   value:'ssxc',
//   time: "2022年1月-2022年1月",
//   projects: [{
//   name:'臻爱陪诊',
//   desc:'本项目是基于牡丹江海浪飞机场原有官网、管理平台等需求重构改造，并开发安卓、iOS应用以及小程序，为海浪飞机场内部人员提供管理日常工作、机场维护等机场日常工作的平台。',
//   icon:airfly,
//   showUrl:false,
//   time:'2020年10月-2022年12月',
//   openSource:true,
//   gitUrls:[{
//     name:'Webpack实现jQuery和Vue项目共存',
//     type:'github',
//     url:''
//   }],
//   tags:['后台','小程序','Golang','React','Webpack'],
//    log:'/projects/02-盛世雪城/01-牡丹江海浪飞机场管理平台'
// },{
//   name:'',
//   desc:'在入职<b>盛世雪城</b>工作时期内，以开发组副组长身份主导负责的第一个项目，通过迭代与重构开发，在疫情时期为牡丹江地区防疫提供较大助力，同时通过该项目逐渐落地确定开发组后续项目的主要开发技术路线与开发规范。',
//   icon:myk,
//   showUrl:true,
//   time:'2020年2月-2022年11月',
//   openSource:false,
//   url:[{
//     type:'minapp',
//   name: "访问牡疫控小程序",
//   url: "./img/myk_ewm.jpg",
//   }],
//   tags:['后台','小程序','Serverless','重构'],
//    log:'/projects/02-盛世雪城/03-牡疫控平台'
// }]
// }]
// }
const personProjects = {
  label:'独立开发',
    type:'full',
  list: [{
    label:'全栈应用',
  value: 'allstack',
  time: "2020年1月-至今",
  projects:[
    {
  name:'大宇游戏讨论创作社区',
  desc:'作为大宇游戏资深粉丝，仙剑已经有自己的社区了，大宇其他游戏还没有自己的社区，玩家分散在微博、贴吧等，所以想要开发大宇游戏社区，通过社区聚集玩家，为玩家提供更好的交流和创作环境。',
  icon:swdwiki,
  showUrl:true,
  time:'2023年7月-至今',
  url:[{
    type:'url',
  name: "轩辕天书社区（5月1日上线正式版）",
  url: "https://fans.swdwiki.com/",
  },
],
  openSource:false,
  devlopment:true,
  production:false,
    gitUrls:[{
    type:'前端源码[脱敏版]',
    url:'https://github.com/swdwiki/fans_web'
  },{
    type:'后端源码[脱敏版]',
    url:'https://github.com/swdwiki/fans_web_api'
  }],
  tags:['Nuxtjs','Nestjs','React Native','Flutter','鸿蒙','TypeScript'],
   log:'/projects/05-参与开源/01-earthworm'
},
{
  name:'Sword Design',
  desc:'Sword Design是基于游戏轩辕剑的粉丝社区相关产品衍生出来的包括PCWEB、小程序、APP等平台多平台的设计框架，未来可用于技术、游戏等新型移动社区类产品。目前正在开发中。',
  icon:sword_design,
  time:'2023年7月-至今',
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
  tags:['设计系统','Vue','React','UI框架','开源','独立开发'],
},
{
  name:'国产游戏社区平台',
  desc:'游戏社区App是基于Web端的功能开发的游戏讨论社区，基于ReactNative、Flutter、鸿蒙开发多端APP，实现',
  icon:gamemic,
  showUrl:true,
  time:'2023年7月-至今',
  url:[{
    type:'url',
  name: "国产游戏讨论社区(预计6月1日正式版上线)",
  url: "https://www.gamemic.cn/",
  }],
  openSource:false,
  devlopment:true,
  production:false,
    gitUrls:[{
    name:'Github',
    url:'https://github.com/cuixueshe/earthworm'
  }],
  tags:['Nuxtjs','Nestjs'],
   log:'/projects/05-参与开源/01-earthworm'
},
  ]
  },{
    label:'独立App',
  value: 'tezx',
  time: "2022年1月-至今",
  projects:[{
  name:'国产游戏社区App',
  desc:'游戏社区App是基于Web端的功能开发的游戏讨论创作社区，基于Flutter、鸿蒙开发多端APP。',
  icon:gamemic,
  showUrl:true,
  time:'2023年7月-至今',
  url:[{
    type:'url',
  name: "国产游戏社区App(2024年6月开放App下载&开源)",
  url: "https://www.gamemic.cn/app",
  }],
  openSource:false,
  devlopment:true,
  production:false,
    gitUrls:[{
    name:'Github',
    url:'https://github.com/cuixueshe/earthworm'
  }],
  tags:['Nuxtjs','Nestjs'],
   log:'/projects/05-参与开源/01-earthworm'
},{
  name:'好好生活',
  desc:'好好生活App是一款基于Swift、Flutter、鸿蒙开发的移动端APP，用于记录生活，包括健康、运动、饮食、日程、社交关系等，目前正在开发中。',
  icon:life,
  showUrl:false,
  time:'2023年7月-至今',
  openSource:false,
  //   gitUrls:[{
  //   name:'Github',
  //   url:'https://github.com/cuixueshe/earthworm'
  // }],
  tags:['Nuxtjs','Nestjs'],
   log:'/projects/05-独立App/02-好好生活'
},
{
  name:'Project-X(性生活记录)',
  desc:'Project-X是一款基于Swift、Flutter、鸿蒙开发的多端APP，主要功能为异性、LGBT等群体提供性生活记录的应用。<br>该App既可以用于记录观察性生活质量，也也可用于HIV群体的自我评估，以及对高危性行为的提醒和建议，实现尽可能补足缺失的性教育。',
  icon:love,
  showUrl:true,
  time:'2024年1月-至今',
  openSource:false,
  //   gitUrls:[{
  //   name:'Github',
  //   url:'https://github.com/cuixueshe/earthworm'
  // }],
  tags:['Flutter','Nestjs','SwiftUI','鸿蒙'],
   log:'/projects/04-独立App/03-ProjectX'
},
{
  name:'在路上',
  desc:'在路上App是一款旅行行程规划与记录的APP；<br>支持iOS/Android/鸿蒙三端，主要技术栈是ReactNative、Flutter、鸿蒙，目前正在开发中。',
  icon:totravel,
  showUrl:true,
  time:'2023年12月-至今',
  url:[{
    type:'url',
  name: "App官网",
  url: "https://app.swdwiki.com/totravel",
  }],
  openSource:false,
  //   gitUrls:[{
  //   name:'Github',
  //   url:'https://github.com/cuixueshe/earthworm'
  // }],
  tags:['ReactNative','鸿蒙','fastify'],
   log:'/projects/04-独立App/04-在路上'
}]
  }]
};

const openProjects = {
  label:'开源项目',
    type:'full',
  list: [
    {
    label:'参与开源',
  value: 'tezx',
  time: "2022年1月-至今",
  projects:[{
  name:'Earthworm英语学习工具',
  desc:'Earthworm 是崔大主导开发的英语学习工具;通过上瘾的游戏玩法，练习和养成习惯，从而更深入地了解英语的丰富性。',
  icon:earthworm,
  showUrl:true,
  time:'2024年2月-至今',
  url:[{
    type:'url',
  name: "Earthworm官网",
  url: "https://earthworm.cuixueshe.com/",
  }],
  openSource:true,
    gitUrls:[{
    name:'Github',
    url:'https://github.com/cuixueshe/earthworm'
  }],
  tags:['Nuxtjs','Nestjs','Docker'],
},
// {
//   name:'Halo博客系统',
//   desc:'在入职<b>盛世雪城</b>工作时期内，主导负责的第一个项目，通过迭代与重构开发，在疫情时期为牡丹江地区防疫提供较大助力，同时通过该项目逐渐落地确定开发组后续项目的主要开发技术路线与规范。',
//   icon:halo,
//   showUrl:true,
//   time:'2020年2月-2022年10月',
//   url:[{
//     type:'url',
//   name: "Earthworm官网",
//   url: "https://earthworm.cuixueshe.com/",
//   }],
//   openSource:true,
//     gitUrls:[{
//     name:'仓库地址',
//     url:'https://github.com/cuixueshe/earthworm'
//   }],
//   tags:['Nuxtjs','Nestjs']
// },
]
  }]
};


const projects = [
  companyProjects,
  // smallProjects,
  personProjects,
  openProjects];
</script>

<style scoped>
.vp-doc ul, .vp-doc ol{
    padding-left: 0;
}
.content-container {
  width: 1104px;
}
.content{
  width: 1104px;
}
:deep(.arco-tabs-nav-tab){
  @apply justify-center items-center;
}
</style>
