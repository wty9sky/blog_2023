import type { DefaultTheme } from "vitepress";

export const nav: DefaultTheme.Config["nav"] = [
  {
    text: "文章",
    items: [
      {
        text: "前端",
        link: "/categories/frontend/index",
        activeMatch: "/categories/frontend/",
      },
      {
        text: "后端",
        link: "/categories/backend/index",
        activeMatch: "/categories/backend/",
      },
      // { text: '人工智能', link: '/categories/ai/index', activeMatch: '/categories/ai/' },
      // { text: '独游开发', link: '/categories/games/index', activeMatch: '/categories/games/' },
    ],
    activeMatch: "/categories/",
  },
  {
    text: "开发日志",
    items: [
      { text: "MD富文本编辑器", link: "/develop/editor/index", activeMatch: "/develop/editor" },
    ],
    activeMatch: "/develop/",
  },
  {
    text: "学习笔记",
    items: [
      { text: "React", link: "/notes/react/index", activeMatch: "/notes/react" },
      { text: "Rust", link: "/notes/rust/index", activeMatch: "/notes/rust" },
      { text: "Vue3", link: "/notes/vue3/index", activeMatch: "/notes/vue3" },
    ],
    activeMatch: "/notes/",
  },
  {
    text: "项目之旅",
    link: "/projects/index",
    activeMatch: "/projects",
  },
  {
    text: "简历",
    link: "/resume",
    activeMatch: "/resume",
  },
  {
    text: "关于",
    items: [
      { text: "关于我", link: "/about/me", activeMatch: "/about/me" },
      { text: "版本历程", link: "/about/version", activeMatch: "/about/version" }
    ],
    activeMatch: "/about/me",
  },
];
