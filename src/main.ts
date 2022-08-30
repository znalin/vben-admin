/*
 * @Descripttion:
 * @Author: znalin
 * @Date: 2022-08-26 14:43:29
 * @LastEditors: znalin
 * @LastEditTime: 2022-08-30 14:11:18
 */
import '/@/design/index.less';
import 'virtual:windi-base.css';
import 'virtual:windi-components.css';
import 'virtual:windi-utilities.css';
import 'virtual:svg-icons-register';
import App from './App.vue';
import { createApp } from 'vue';
// 初始化系统的配置、项目配置、样式主题、持久化缓存等等
import { initAppConfigStore } from '/@/logics/initAppConfig';
// 配置全局错误处理
import { setupErrorHandle } from '/@/logics/error-handle';
// 配置路由
import { router, setupRouter } from '/@/router';
// 路由守卫、权限判断、初始化缓存数据
import { setupRouterGuard } from '/@/router/guard';
// 配置存储
import { setupStore } from '/@/store';
// 注册全局指令
import { setupGlobDirectives } from '/@/directives';
// 国际化
import { setupI18n } from '/@/locales/setupI18n';
// 注册全局组件
import { registerGlobComp } from '/@/components/registerGlobComp';
if (import.meta.env.DEV) {
  import('ant-design-vue/dist/antd.less');
}
// 项目的初始化配置
async function bootstrap() {
  // 创建应用实例
  const app = createApp(App);

  // 配置存储使用Pinia
  setupStore(app);

  // 初始化系统的配置、项目配置、样式主题、持久化缓存等等
  initAppConfigStore();

  // 注册全局组件
  registerGlobComp(app);

  // 多语言配置
  await setupI18n(app);

  // 配置路由
  setupRouter(app);

  // 路由守卫、权限判断、初始化缓存数据
  setupRouterGuard(router);

  // 注册全局指令
  setupGlobDirectives(app);

  // 配置全局错误处理
  setupErrorHandle(app);

  // https://next.router.vuejs.org/api/#isready
  // await router.isReady();

  app.mount('#app');
}

bootstrap();
