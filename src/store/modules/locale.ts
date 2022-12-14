/*
 * @Descripttion: 国际化/多语言
 * @Author: znalin
 * @Date: 2022-08-29 11:24:47
 * @LastEditors: znalin
 * @LastEditTime: 2022-08-30 10:30:58
 */
import type { LocaleSetting, LocaleType } from '/#/config';

import { defineStore } from 'pinia';
import { store } from '/@/store';

import { LOCALE_KEY } from '/@/enums/cacheEnum';
import { createLocalStorage } from '/@/utils/cache';
import { localeSetting } from '/@/settings/localeSetting';

const ls = createLocalStorage();
// 获取 localStorage缓存或系统配置信息
const lsLocaleSetting = (ls.get(LOCALE_KEY) || localeSetting) as LocaleSetting;

interface LocaleState {
  localInfo: LocaleSetting;
}
// 国际化实例
export const useLocaleStore = defineStore({
  id: 'app-locale',
  state: (): LocaleState => ({
    localInfo: lsLocaleSetting,
  }),
  getters: {
    // 是否显示语言选择器
    getShowPicker(): boolean {
      return !!this.localInfo?.showPicker;
    },
    // 当前语言 默认 简体中文
    getLocale(): LocaleType {
      return this.localInfo?.locale ?? 'zh_CN';
    },
  },
  actions: {
    /**
     * 设置多语言信息并缓存
     * @param info multilingual info
     */
    setLocaleInfo(info: Partial<LocaleSetting>) {
      this.localInfo = { ...this.localInfo, ...info };
      ls.set(LOCALE_KEY, this.localInfo);
    },
    /**
     * 初始化多语言信息并从本地缓存加载现有配置
     */
    initLocale() {
      this.setLocaleInfo({
        ...localeSetting,
        ...this.localInfo,
      });
    },
  },
});

// 用于没有使用 setup 组件时使用。
export function useLocaleStoreWithOut() {
  return useLocaleStore(store);
}
