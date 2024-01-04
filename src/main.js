
import './assets/css-vars.css';
import './assets/main.css';
import './assets/base.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from "pinia";
import router from './router';
// svg图标
import 'virtual:svg-icons-register';

import SvgIcon from '@/components/SvgIcon/index.vue';
import elementIcons from '@/components/SvgIcon/svgicon';


const app = createApp(App);
// 挂载pinia
app.use(createPinia());
app.use(router);

// 加载element图标
app.use(elementIcons);
// 全局注册图标组件
app.component('svg-icon', SvgIcon);
app.mount('#app');

// elementUI中文版支持
app.use(ElementPlus, {
    locale: zhCn
})

