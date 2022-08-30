/*
 * @Descripttion:
 * @Author: znalin
 * @Date: 2022-08-29 11:24:47
 * @LastEditors: znalin
 * @LastEditTime: 2022-08-29 18:39:22
 */
import type { App } from 'vue';
import { createPinia } from 'pinia';
// 创建一个 pinia（根存储）
const store = createPinia();

export function setupStore(app: App<Element>) {
  // 注册到应用程序
  app.use(store);
}

export { store };
