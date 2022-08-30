/*
 * @Descripttion:
 * @Author: znalin
 * @Date: 2022-08-29 11:24:47
 * @LastEditors: znalin
 * @LastEditTime: 2022-08-30 10:38:22
 */
import { ErrorTypeEnum } from '/@/enums/exceptionEnum';
import { MenuModeEnum, MenuTypeEnum } from '/@/enums/menuEnum';
import { RoleInfo } from '/@/api/sys/model/userModel';

// Lock screen information
export interface LockInfo {
  // Password required
  pwd?: string | undefined;
  // Is it locked?
  isLock?: boolean;
}

// Error-log information
export interface ErrorLogInfo {
  // Type of error
  type: ErrorTypeEnum;
  // Error file
  file: string;
  // Error name
  name?: string;
  // Error message
  message: string;
  // Error stack
  stack?: string;
  // Error detail
  detail: string;
  // Error url
  url: string;
  // Error time
  time?: string;
}

export interface UserInfo {
  userId: string | number; // 用户id
  username: string; // 用户名称
  realName: string; // 真实名称
  avatar: string; // 头像
  desc?: string; // 描述
  homePath?: string; // 用户指定不同的后台首页
  roles: RoleInfo[]; // 用户角色信息
}

export interface BeforeMiniState {
  menuCollapsed?: boolean;
  menuSplit?: boolean;
  menuMode?: MenuModeEnum;
  menuType?: MenuTypeEnum;
}
