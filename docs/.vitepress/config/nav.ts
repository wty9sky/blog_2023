import type { DefaultTheme } from "vitepress";

export const nav: DefaultTheme.Config["nav"] = [
  {
    text: "日志",
    items: [
      {
        text: "前端开发",
        link: "/categories/frontend/index",
        activeMatch: "/categories/frontend/",
      },
      {
        text: "后端开发",
        link: "/categories/backend/index",
        activeMatch: "/categories/backend/",
      },
      // { text: '人工智能', link: '/categories/ai/index', activeMatch: '/categories/ai/' },
      // { text: '独游开发', link: '/categories/games/index', activeMatch: '/categories/games/' },
    ],
    activeMatch: "/categories/",
  },
  {
    text: "学习笔记",
    items: [
      { text: "Rust", link: "/notes/rust/index", activeMatch: "/notes/rust" },
      { text: "Vue3", link: "/notes/vue3/index", activeMatch: "/notes/vue3" },
    ],
    activeMatch: "/notes/",
  },
  {
    text: "我的项目",
    link: "/projects/index",
    activeMatch: "/projects",
  },
  {
    text: "个人简历",
    link: "/resume",
    activeMatch: "/resume",
  },
  {
    text: "关于",
    items: [{ text: "关于我", link: "/about/me", activeMatch: "/about/me" }],
    activeMatch: "/about/me",
  },
];
