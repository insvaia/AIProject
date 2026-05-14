import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
// 引入默认样式
import "./style/index.css";
import App from "./App.vue";
import router from "./router";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
// 引入状态管理仓库
import { createPinia } from "pinia";

const app = createApp(App);

const pinia = createPinia();

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus);
app.use(router);
app.use(pinia);
app.mount("#app");
