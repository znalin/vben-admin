/*
 * @Descripttion:
 * @Author: znalin
 * @Date: 2022-08-29 11:24:46
 * @LastEditors: znalin
 * @LastEditTime: 2022-08-29 15:59:27
 */
import type { AppRouteRecordRaw, AppRouteModule } from '/@/router/types';

import { PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE } from '/@/router/routes/basic';

import { mainOutRoutes } from './mainOut';
import { PageEnum } from '/@/enums/pageEnum';
import { t } from '/@/hooks/web/useI18n';
// 自动加载 `modules` 目录下的路由模块
const modules = import.meta.globEager('./modules/**/*.ts');

const routeModuleList: AppRouteModule[] = [];

Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeModuleList.push(...modList);
});
// 读取的路由并未立即注册，而是等权限认证完后通过 router.addRoutes 添加到路由实例，实现权限的过滤
export const asyncRoutes = [PAGE_NOT_FOUND_ROUTE, ...routeModuleList];

export const RootRoute: AppRouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: PageEnum.BASE_HOME,
  meta: {
    title: 'Root',
  },
};

export const LoginRoute: AppRouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('/@/views/sys/login/Login.vue'),
  meta: {
    title: t('routes.basic.login'),
  },
};

// Basic routing without permission
export const basicRoutes = [
  // 登录路由 /login
  LoginRoute,
  // 根路由 /
  RootRoute,
  // 新页面 /main-out
  ...mainOutRoutes,
  // 从定义 /redirect
  REDIRECT_ROUTE,
  // 404 /:path(.*)*
  PAGE_NOT_FOUND_ROUTE,
];
