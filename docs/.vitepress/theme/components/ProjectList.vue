<script setup lang="ts">
import { defineOptions, defineProps, reactive, ref } from "vue";
import { Projects } from "./type";

defineOptions({
  name: "ProjectList",
});

interface Props {
  projects: Array<Projects>;
}

const props = withDefaults(defineProps<Props>(), {});

const selectIndex = ref(0);
const selectProjectIndex = (index)=>{
  console.log(index);
  selectIndex.value = index;
}
</script>

<template>
  <div>
    <div class="mx-auto bg-white dark:bg-gray-900">
      <div class="relative">
        <div class="mx-auto lg:max-w-5xl">
          <header class="max-w-4xl">
            <h2 class="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
              我的<b class="text-3xl ml-2">过去</b>·<b class="text-4xl">现在</b>·<b class="text-5xl mr-2">未来</b>项目之旅。
            </h2>
            <p class="mt-6 text-base text-zinc-600 dark:text-zinc-400">
              多年来，我参与或主导过各种各样的项目，包括<b>开源</b>、<b>实验</b>、
              <b>独立开发</b>，下面是经过筛选觉得还不错的项目，也是我在技术领域中尝试和探索的见证。
            </p>
          </header>
          <a-tabs :active-key="selectIndex" @change="selectProjectIndex" :animation="true" size="large" type="rounded">
            <a-tab-pane v-for="(wrap, index) in props.projects" :key="index" :title="wrap.label">
              <div class="my-[20px]" v-for="(info, index) in wrap.list" :key="index">
                <span style="text-decoration: none" class="text-base no-underline font-bold block text-center">{{
            info.label }}</span>
                <span v-if="info.time" class="text-sm block text-center text-gray-500">{{ info.time }}</span>
                <ul role="list" class="pl-10 grid grid-cols-2 gap-x-4 gap-y-4">
                  <li v-for="(project, index) in info.projects" :key="index"
                    class="border-gray-200 border-solid border hover:border-gray-400 group px-3 py-4 transition  dark:hover:bg-gray-600 hover:bg-gray-100 rounded-xl hover:scale-100 hover:opacity-100 relative flex flex-col items-start justify-start mt-2">
                    <ProjectCard :project="project" />
                  </li>
                </ul>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-trigger {
  padding: 10px;
  width: 160px;
  background-color: var(--color-bg-popup);
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
}

.content-container {
  width: 1104px;
}
</style>
