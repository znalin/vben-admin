/*
 * @Descripttion: 全局注册 antdv的Input、Layout组件和手写的Button组件
 * @Author: znalin
 * @Date: 2022-08-29 11:24:44
 * @LastEditors: znalin
 * @LastEditTime: 2022-08-29 18:45:34
 */
import type { App } from 'vue';
import { Button } from './Button';
import {
  // Need
  Button as AntButton,
  Input,
  Layout,
} from 'ant-design-vue';

const compList = [AntButton.Group];

export function registerGlobComp(app: App) {
  compList.forEach((comp) => {
    app.component(comp.name || comp.displayName, comp);
  });
  // 注册 antdv的Input、Layout组件和手写的Button组件
  app.use(Input).use(Button).use(Layout);
}
