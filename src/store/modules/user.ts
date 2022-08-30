/*
 * @Descripttion: 用户状态
 * @Author: znalin
 * @Date: 2022-08-29 11:24:47
 * @LastEditors: znalin
 * @LastEditTime: 2022-08-30 13:42:49
 */
import type { UserInfo } from '/#/store';
import type { ErrorMessageMode } from '/#/axios';
import { defineStore } from 'pinia';
import { store } from '/@/store';
import { RoleEnum } from '/@/enums/roleEnum';
import { PageEnum } from '/@/enums/pageEnum';
import { ROLES_KEY, TOKEN_KEY, USER_INFO_KEY } from '/@/enums/cacheEnum';
import { getAuthCache, setAuthCache } from '/@/utils/auth';
import { GetUserInfoModel, LoginParams } from '/@/api/sys/model/userModel';
import { doLogout, getUserInfo, loginApi } from '/@/api/sys/user';
import { useI18n } from '/@/hooks/web/useI18n';
import { useMessage } from '/@/hooks/web/useMessage';
import { router } from '/@/router';
import { usePermissionStore } from '/@/store/modules/permission';
import { RouteRecordRaw } from 'vue-router';
import { PAGE_NOT_FOUND_ROUTE } from '/@/router/routes/basic';
import { isArray } from '/@/utils/is';
import { h } from 'vue';
import { Console } from 'console';

interface UserState {
  userInfo: Nullable<UserInfo>; // 用户信息
  token?: string;
  roleList: RoleEnum[];
  sessionTimeout?: boolean;
  lastUpdateTime: number;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    // 用户信息
    userInfo: null,
    // token
    token: undefined,
    // 角色列表
    roleList: [],
    // 登录是否超期失效
    sessionTimeout: false,
    // 用户信息最后更新时间
    lastUpdateTime: 0,
  }),
  getters: {
    // 从状态中获取用户信息、token、角色列表、登录是否超期失效、最后更新时间，若用户信息、token、角色列表为空，则从缓存中获取值。
    getUserInfo(): UserInfo {
      return this.userInfo || getAuthCache<UserInfo>(USER_INFO_KEY) || {};
    },
    getToken(): string {
      return this.token || getAuthCache<string>(TOKEN_KEY);
    },
    getRoleList(): RoleEnum[] {
      return this.roleList.length > 0 ? this.roleList : getAuthCache<RoleEnum[]>(ROLES_KEY);
    },
    getSessionTimeout(): boolean {
      return !!this.sessionTimeout;
    },
    getLastUpdateTime(): number {
      return this.lastUpdateTime;
    },
  },
  actions: {
    // 更新用户信息、token、角色列表等，同时使用 setAuthCache 进行缓存。
    setToken(info: string | undefined) {
      this.token = info ? info : ''; // for null or undefined value
      setAuthCache(TOKEN_KEY, info);
    },
    setRoleList(roleList: RoleEnum[]) {
      this.roleList = roleList;
      setAuthCache(ROLES_KEY, roleList);
    },
    setUserInfo(info: UserInfo | null) {
      this.userInfo = info;
      this.lastUpdateTime = new Date().getTime();
      setAuthCache(USER_INFO_KEY, info);
    },
    // 设置用户登录状态
    setSessionTimeout(flag: boolean) {
      this.sessionTimeout = flag;
    },
    // 清空重置用户登录状态
    resetState() {
      this.userInfo = null;
      this.token = '';
      this.roleList = [];
      this.sessionTimeout = false;
    },
    /**
     * @description: 获取 token，并存储本地缓存
     */
    async login(
      params: LoginParams & {
        goHome?: boolean;
        mode?: ErrorMessageMode;
      },
    ): Promise<GetUserInfoModel | null> {
      try {
        const { goHome = true, mode, ...loginParams } = params;
        // 1、调用登录接口，此服务接口为数据mock&联调，根据项目自行替换真实服务
        const data = await loginApi(loginParams, mode);
        // 2、获取 token，并存储本地缓存
        const { token } = data;
        this.setToken(token);
        // 登录后预处理操作
        return this.afterLoginAction(goHome);
      } catch (error) {
        return Promise.reject(error);
      }
    },

    /**
     * @description: 用户登录后，进行角色、权限、菜单、路由等配置操作
     */
    async afterLoginAction(goHome?: boolean): Promise<GetUserInfoModel | null> {
      if (!this.getToken) return null;
      // 3、获取用户信息
      const userInfo = await this.getUserInfoAction();
      // 4、根据返回用户登录信息，设置角色列表
      const sessionTimeout = this.sessionTimeout;
      if (sessionTimeout) {
        // 用户登录状态
        this.setSessionTimeout(false);
      } else {
        const permissionStore = usePermissionStore();
        if (!permissionStore.isDynamicAddedRoute) {
          // 若是路由还没态添加过，根据不同的权限处理方式构建路由列表
          // 获取路由配置并动态添加路由配置
          const routes = await permissionStore.buildRoutesAction();
          routes.forEach((route) => {
            router.addRoute(route as unknown as RouteRecordRaw);
          });
          router.addRoute(PAGE_NOT_FOUND_ROUTE as unknown as RouteRecordRaw);
          permissionStore.setDynamicAddedRoute(true);
        }
        // 调用权限存储构建路由列表
        goHome && (await router.replace(userInfo?.homePath || PageEnum.BASE_HOME));
      }
      return userInfo;
    },

    /**
     * @description: 获取用户信息
     */
    async getUserInfoAction(): Promise<UserInfo | null> {
      if (!this.getToken) return null;
      // 调用 mock 服务 getUserInfo()
      const userInfo = await getUserInfo();
      console.log(userInfo);
      const { roles = [] } = userInfo;
      if (isArray(roles)) {
        const roleList = roles.map((item) => item.value) as RoleEnum[];
        // 设置权限列表，并存储本地缓存
        this.setRoleList(roleList);
      } else {
        userInfo.roles = [];
        this.setRoleList([]);
      }
      // 设置用户信息，并存储本地缓存
      this.setUserInfo(userInfo);
      return userInfo;
    },
    /**
     * @description: 退出
     */
    async logout(goLogin = false) {
      if (this.getToken) {
        try {
          // 调用 mock 服务
          await doLogout();
        } catch {
          console.log('注销Token失败');
        }
      }
      // 清空 token
      this.setToken(undefined);
      // 用户登录状态失效
      this.setSessionTimeout(false);
      // 清空用户信息
      this.setUserInfo(null);
      // 跳转系统登录界面
      goLogin && router.push(PageEnum.BASE_LOGIN);
    },

    /**
     * @description: 弹出系统确认框
     */
    confirmLoginOut() {
      const { createConfirm } = useMessage();
      const { t } = useI18n();
      createConfirm({
        iconType: 'warning',
        title: () => h('span', t('sys.app.logoutTip')),
        content: () => h('span', t('sys.app.logoutMessage')),
        onOk: async () => {
          await this.logout(true);
        },
      });
    },
  },
});

// 用于没有使用 setup 组件时使用。
export function useUserStoreWithOut() {
  return useUserStore(store);
}
