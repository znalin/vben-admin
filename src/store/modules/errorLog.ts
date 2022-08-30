/*
 * @Descripttion:错误日志
 * @Author: znalin
 * @Date: 2022-08-29 11:24:47
 * @LastEditors: znalin
 * @LastEditTime: 2022-08-30 10:22:13
 */
import type { ErrorLogInfo } from '/#/store';

import { defineStore } from 'pinia';
import { store } from '/@/store';

import { formatToDateTime } from '/@/utils/dateUtil';
import projectSetting from '/@/settings/projectSetting';

import { ErrorTypeEnum } from '/@/enums/exceptionEnum';

export interface ErrorLogState {
  errorLogInfoList: Nullable<ErrorLogInfo[]>;
  errorLogListCount: number;
}
// 错误日志存储实例
export const useErrorLogStore = defineStore({
  id: 'app-error-log',
  state: (): ErrorLogState => ({
    errorLogInfoList: null, // 错误日志信息数组
    errorLogListCount: 0, // 错误日志信息总数
  }),
  getters: {
    getErrorLogInfoList(): ErrorLogInfo[] {
      return this.errorLogInfoList || [];
    },
    getErrorLogListCount(): number {
      return this.errorLogListCount;
    },
  },
  actions: {
    // 添加错误日志
    addErrorLogInfo(info: ErrorLogInfo) {
      // 更新错误日志时间属性
      const item = {
        ...info,
        time: formatToDateTime(new Date()),
      };
      // 将日志信息加入名为 errorLogInfoList 的数组中
      this.errorLogInfoList = [item, ...(this.errorLogInfoList || [])];
      // 同时更新错误日志总数
      this.errorLogListCount += 1;
    },
    // 重置错误日志总数数值
    setErrorLogListCount(count: number): void {
      this.errorLogListCount = count;
    },

    /**
     * 在ajax请求错误后触发
     * @param error
     * @returns
     */
    addAjaxErrorInfo(error) {
      const { useErrorHandle } = projectSetting;
      if (!useErrorHandle) {
        return;
      }
      const errInfo: Partial<ErrorLogInfo> = {
        message: error.message,
        type: ErrorTypeEnum.AJAX,
      };
      if (error.response) {
        const {
          config: { url = '', data: params = '', method = 'get', headers = {} } = {},
          data = {},
        } = error.response;
        errInfo.url = url;
        errInfo.name = 'Ajax Error!';
        errInfo.file = '-';
        errInfo.stack = JSON.stringify(data);
        errInfo.detail = JSON.stringify({ params, method, headers });
      }
      this.addErrorLogInfo(errInfo as ErrorLogInfo);
    },
  },
});

// 用于没有使用 setup 组件时使用。
export function useErrorLogStoreWithOut() {
  return useErrorLogStore(store);
}
