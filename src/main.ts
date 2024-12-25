import { createApp } from "vue";
import Vue3Lottie from "vue3-lottie";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import _ from "lodash";

// 保存原始的 console.error
const originalConsoleError = console.error;

// 重写 console.error
console.error = (...args: any[]) => {
  if (args[0]?.toString().includes("ResizeObserver loop")) {
    return; // 屏蔽 ResizeObserver 警告
  }
  originalConsoleError(...args); // 调用原始的 console.error
};

//createApp(App).use(router).use(ElementPlus).mount("#app");

// 创建 Vue 应用
const app = createApp(App);
const debounced = _.debounce((msg: string) => {
  if (
    msg.includes("ResizeObserver") ||
    msg.includes("ResizeObserver loop completed with undelivered notifications")
  ) {
    return;
  }
  console.error(msg);
}, 100);

app.config.errorHandler = (err) => {
  if (err instanceof Error) {
    debounced(err.message);
  }
};
app.use(ElementPlus);
app.use(Vue3Lottie, { name: "Vue3Lottie" });

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component); // 动态注册所有图标
}

app.use(router);
app.mount("#app");
