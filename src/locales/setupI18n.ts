/*
 * @Descripttion:
 * @Author: znalin
 * @Date: 2022-08-29 11:24:46
 * @LastEditors: znalin
 * @LastEditTime: 2022-08-30 09:05:03
 */
import type { App } from 'vue';
import type { I18n, I18nOptions } from 'vue-i18n';

import { createI18n } from 'vue-i18n';
import { setHtmlPageLang, setLoadLocalePool } from './helper';
import { localeSetting } from '/@/settings/localeSetting';
import { useLocaleStoreWithOut } from '/@/store/modules/locale';

const { fallback, availableLocales } = localeSetting;

export let i18n: ReturnType<typeof createI18n>;

async function createI18nOptions(): Promise<I18nOptions> {
  const localeStore = useLocaleStoreWithOut(); // 国际化本地存储
  const locale = localeStore.getLocale; // 语言环境/当前语言
  const defaultLocal = await import(`./lang/${locale}.ts`); // 从服务器端获取语言翻译文件
  const message = defaultLocal.default?.message ?? {}; // 本地化的语言环境信息

  setHtmlPageLang(locale);
  setLoadLocalePool((loadLocalePool) => {
    loadLocalePool.push(locale);
  });

  return {
    legacy: false,
    locale, // 语言环境
    fallbackLocale: fallback, // 预设的语言环境
    // 本地化的语言环境信息
    messages: {
      [locale]: message,
    },
    availableLocales: availableLocales, // 以词法顺序排列的 messages 中的可用语言环境列表
    // 是否将根级别语言环境与组件本地化语言环境同步。 如果为 false，则无论根级别语言环境如何，都要为每个组件语言环境进行本地化。
    sync: true,
    // true - warning off  是否取消本地化失败时输出的警告。如果为 true，则禁止本地化失败警告。
    silentTranslationWarn: true, // true - warning off
    missingWarn: false,
    // 是否在回退到 fallbackLocale 或 root 时取消警告。如果为 true，则仅在根本没有可用的转换时生成警告，而不是在回退时。
    silentFallbackWarn: true,
  };
}

// 初始化国际化实例
export async function setupI18n(app: App) {
  // 获取国际化插件 vue-i18n 配置项
  const options = await createI18nOptions();
  i18n = createI18n(options) as I18n;
  app.use(i18n);
}
