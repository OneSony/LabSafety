import { createApp } from "vue";
import Vue3Lottie from "vue3-lottie";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
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

app.use(ElementPlus);
app.use(Vue3Lottie, { name: "Vue3Lottie" });

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component); // 动态注册所有图标
}

app.use(router);
app.mount("#app");
