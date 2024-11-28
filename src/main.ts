import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// 保存原始的 console.error
const originalConsoleError = console.error;

// 重写 console.error
console.error = (...args: any[]) => {
  if (args[0]?.toString().includes("ResizeObserver loop")) {
    return; // 屏蔽 ResizeObserver 警告
  }
  originalConsoleError(...args); // 调用原始的 console.error
};

createApp(App).use(store).use(router).use(ElementPlus).mount("#app");
