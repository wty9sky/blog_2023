<script setup lang="ts">
import { defineOptions, defineProps, reactive, ref } from "vue";
import { Project } from "./type";

defineOptions({
  name: "ProjectList",
});
const projectVisible = ref(false);

const selectProject = () => {
  projectVisible.value = true;
};

interface Props {
  project: Project;
}

const props = withDefaults(defineProps<Props>(), {});
</script>

<template>
  <div>
    <a-modal
      v-model:visible="projectVisible"
      :footer="false"
      width="800px"
      @cancel="projectVisible = false"
    >
      <template #title> 项目详情 - {{ props.project.name }} </template>
      <div>
        <div
          class="border-gray-200 border-solid border group px-3 py-2 transition bg-gray-100 rounded-xl hover:scale-100 hover:opacity-100 relative flex flex-col items-start justify-start"
        >
          <div class="relative z-10 flex h-12 items-center justify-center">
            <div
              class="relative z-10 flex h-12 items-center justify-center w-12 h-12 rounded-full"
            >
              <img
                alt=""
                loading="lazy"
                width="36"
                height="36"
                decoding="async"
                class="h-9 w-9 rounded-full"
                :src="props.project.icon"
                style="color: transparent"
              />
            </div>
            <span
              class="pl-3 -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl"
            /><span class="relative text-sm z-10 font-bold">{{
              props.project.name
            }}</span>
            <div class="tags my-2 ml-2">
              <a-tag
                color="arcoblue"
                class="mr-2"
                v-for="(tag, index) of props.project.tags"
                :key="index"
                >{{ tag }}</a-tag
              >
            </div>
          </div>
          <span
            class="leading-5 relative z-10 mt-1 px-1 text-sm text-zinc-600 dark:text-zinc-200"
          >
            <span class="text-xs" v-html="props.project.desc"></span>
          </span>
        </div>
        <div
          class="mt-2 flex flex-row flex-nowrap justify-between items-center"
        >
          <div>
            <div class="flex flex-row justify-left items-center my-2">
              <span class="mr-2 my-1 text-base">项目时间</span>
              <span
                class="dark:text-gray-500 text-sm text-gray-400 flex flex-row flex-wrap justify-between items-center"
              >
                {{ props.project.time }}
              </span>
            </div>
            <div
              class="flex flex-row justify-left items-center my-2"
              v-if="props.project.showUrl"
            >
              <span class="mr-2 my-1 text-base">项目传送门</span>
              <div
                class="text-sm flex flex-row flex-wrap justify-between items-center"
              >
                <div v-for="(url, index) in props.project.url" :key="index">
                  <a
                    v-if="url.type === 'url'"
                    target="_blank"
                    :href="url.url"
                    class="flex flex-row justify-start items-center cursor-pointer mr-3 text-sm"
                  >
                    <span
                      class="dark:text-gray-500 text-sm relative z-40 flex items-center text-zinc-500 transition hover:-translate-y-0.5 hover:text-lime-600 dark:text-zinc-200 dark:hover:text-lime-400"
                    >
                      <span class="mr-2">{{ url.name }}</span
                      ><svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 flex-none"
                      >
                        <path
                          d="M20 13.5001C20 14.8946 20 15.5919 19.8618 16.1673C19.4229 17.9956 17.9955 19.423 16.1672 19.8619C15.5918 20.0001 14.8945 20.0001 13.5 20.0001H12C9.19974 20.0001 7.79961 20.0001 6.73005 19.4551C5.78924 18.9758 5.02433 18.2109 4.54497 17.2701C4 16.2005 4 14.8004 4 12.0001V11.5001C4 9.17035 4 8.0055 4.3806 7.08664C4.88807 5.8615 5.86144 4.88813 7.08658 4.38066C7.86344 4.05888 8.81614 4.00915 10.5 4.00146M19.7597 9.45455C20.0221 7.8217 20.0697 6.16984 19.9019 4.54138C19.8898 4.42328 19.838 4.31854 19.7597 4.24027M19.7597 4.24027C19.6815 4.16201 19.5767 4.11023 19.4586 4.09806C17.8302 3.93025 16.1783 3.97792 14.5455 4.24027M19.7597 4.24027L10 14"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                  </a>
                  <div
                    class="flex flex-row flex-wrap justify-between items-center text-gray-400 dark:text-gray-500"
                    v-else-if="url.type === 'minapp'"
                  >
                    <a-trigger
                      :trigger="['hover']"
                      show-arrow
                      :popup-translate="[0, 10]"
                    >
                      <span
                        class="text- flex flex-row flex-wrap justify-between items-center"
                        >点此扫码访问小程序</span
                      >
                      <template #content>
                        <div
                          class="demo-trigger flex flex-col items-center justify-center"
                        >
                          <a-image :src="url.url" alt="" width="140px" />
                          <span class="text-xs text-gray-500"
                            >扫码访问小程序</span
                          >
                        </div>
                      </template>
                    </a-trigger>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="flex flex-row justify-left items-center mb-2"
              v-if="
                props.project.openSource &&
                props.project.gitUrls &&
                props.project.gitUrls.length !== 0
              "
            >
              <span class="mr-2 my-1 text-base">仓库地址</span>
              <span
                class="flex flex-col flex-wrap justify-between items-center"
              >
                <a
                  v-for="(url, index) in props.project.gitUrls"
                  :key="index"
                  target="_blank"
                  :href="url.url"
                  class="flex flex-row justify-start items-center cursor-pointer mr-3"
                  ><span
                    class="dark:text-gray-500 relative z-40 flex items-center text-zinc-500 transition hover:-translate-y-0.5 hover:text-lime-600 dark:text-zinc-200 dark:hover:text-lime-400"
                  >
                    <icon-github />
                    <span class="mx-2">{{ url.url }}</span>
                  </span>
                </a>
              </span>
            </div>
          </div>
          <div class="">
            <a
              v-if="props.project.log"
              :href="props.project.log"
              class="relative z-40 text-sm flex items-center text-zinc-500 transition hover:text-gray-600"
              >开发日志
              <icon-double-right />
            </a>
          </div>
        </div>
      </div>
    </a-modal>
    <div @click="selectProject">
      <div class="relative z-10 flex h-12 items-center justify-start">
        <div
          class="relative z-10 flex h-12 items-center justify-center w-12 h-12 rounded-full"
        >
          <img
            alt=""
            loading="lazy"
            width="36"
            height="36"
            decoding="async"
            class="h-9 w-9 rounded-full"
            :src="props.project.icon"
            style="color: transparent"
          />
        </div>
        <div class="flex flex-col justify-center items-start">
          <span
            class="pl-3 -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl"
          /><span class="relative z-10 font-bold dark:text-zinc-200">{{
            props.project.name
          }}</span>
          <span class="text-gray-400 text-sm font-medium">{{
            props.project.time
          }}</span>
        </div>
      </div>
      <span
        class="leading-7 relative z-10 block my-[10px] text-sm text-zinc-600 dark:text-zinc-200"
      >
        <span
          class="line-clamp-4 min-h-[120px]"
          v-html="props.project.desc"
        ></span>
      </span>
      <div class="w-full h-8 tags my-2 overflow-hidden">
        <a-tag
          size="small"
          color="arcoblue"
          class="mr-2 my-1"
          v-for="(tag, index) of props.project.tags"
          :key="index"
          >{{ tag }}</a-tag
        >
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
</style>
