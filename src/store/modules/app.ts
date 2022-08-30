/*
 * @Descripttion:项目配置
 * @Author: znalin
 * @Date: 2022-08-29 11:24:47
 * @LastEditors: znalin
 * @LastEditTime: 2022-08-30 10:17:46
 */
import type {
  ProjectConfig,
  HeaderSetting,
  MenuSetting,
  TransitionSetting,
  MultiTabsSetting,
} from '/#/config';
import type { BeforeMiniState } from '/#/store';

import { defineStore } from 'pinia';
import { store } from '/@/store';

import { ThemeEnum } from '/@/enums/appEnum';
import { APP_DARK_MODE_KEY_, PROJ_CFG_KEY } from '/@/enums/cacheEnum';
import { Persistent } from '/@/utils/cache/persistent';
import { darkMode } from '/@/settings/designSetting';
import { resetRouter } from '/@/router';
import { deepMerge } from '/@/utils';

interface AppState {
  darkMode?: ThemeEnum;
  pageLoading: boolean;
  projectConfig: ProjectConfig | null;
  beforeMiniInfo: BeforeMiniState;
}
let timeId: TimeoutHandle;
// 项目配置存储实例
export const useAppStore = defineStore({
  id: 'app',
  state: (): AppState => ({
    darkMode: undefined, // 主题模式  dark|light
    pageLoading: false, //  页面加载状态
    //用于配置项目内展示的内容、布局、文本等效果，具体配置文件路径 src/settings/projectSetting.ts
    projectConfig: Persistent.getLocal(PROJ_CFG_KEY), // 项目配置 ProjectConfig
    beforeMiniInfo: {}, //当窗口缩小时记住菜单状态，并在恢复窗口时恢复这些状态（是否折叠、是否分割、类型、模式）
  }),
  getters: {
    // 页面加载状态
    getPageLoading(): boolean {
      return this.pageLoading;
    },
    // 主题模式
    getDarkMode(): 'light' | 'dark' | string {
      return this.darkMode || localStorage.getItem(APP_DARK_MODE_KEY_) || darkMode;
    },
    // 菜单状态快照
    getBeforeMiniInfo(): BeforeMiniState {
      return this.beforeMiniInfo;
    },
    // 项目配置
    getProjectConfig(): ProjectConfig {
      return this.projectConfig || ({} as ProjectConfig);
    },
    // 头部配置
    getHeaderSetting(): HeaderSetting {
      return this.getProjectConfig.headerSetting;
    },
    // 菜单配置
    getMenuSetting(): MenuSetting {
      return this.getProjectConfig.menuSetting;
    },
    // 动画配置
    getTransitionSetting(): TransitionSetting {
      return this.getProjectConfig.transitionSetting;
    },
    // 多标签配置
    getMultiTabsSetting(): MultiTabsSetting {
      return this.getProjectConfig.multiTabsSetting;
    },
  },
  actions: {
    // 设置页面加载状态
    setPageLoading(loading: boolean): void {
      this.pageLoading = loading;
    },
    // 设置主题模式 存于`localStorage`中
    setDarkMode(mode: ThemeEnum): void {
      this.darkMode = mode;
      localStorage.setItem(APP_DARK_MODE_KEY_, mode);
    },
    // 设置页面加载状态
    setBeforeMiniInfo(state: BeforeMiniState): void {
      this.beforeMiniInfo = state;
    },
    // 设置项目配置 项目自带的缓存类进行缓存操作
    setProjectConfig(config: DeepPartial<ProjectConfig>): void {
      this.projectConfig = deepMerge(this.projectConfig || {}, config);
      Persistent.setLocal(PROJ_CFG_KEY, this.projectConfig);
    },
    // 重置路由
    async resetAllState() {
      resetRouter();
      Persistent.clearAll(); // 清空缓存
    },
    // 使用定时器设置页面加载状态
    async setPageLoadingAction(loading: boolean): Promise<void> {
      if (loading) {
        clearTimeout(timeId);
        // Prevent flicker  防止闪烁
        timeId = setTimeout(() => {
          this.setPageLoading(loading);
        }, 50);
      } else {
        this.setPageLoading(loading);
        clearTimeout(timeId);
      }
    },
  },
});

// 用于没有使用 setup 组件时使用。
export function useAppStoreWithOut() {
  return useAppStore(store);
}
