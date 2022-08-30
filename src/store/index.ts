/*
 * @Descripttion:
 * @Author: znalin
 * @Date: 2022-08-29 11:24:47
 * @LastEditors: znalin
 * @LastEditTime: 2022-08-30 10:07:45
 */
import type { App } from 'vue';
import { createPinia } from 'pinia';
// 创建一个 pinia（根存储）
const store = createPinia();

export function setupStore(app: App<Element>) {
  // 注册到应用程序
  app.use(store);
}
// 同时单独将 pinia 实例导出，用于在 setup() 函数外使用 pinia store 实例。
export { store };
