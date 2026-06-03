import { createI18n } from 'vue-i18n';

import en from '@/locales/en.json';
import ptbr from '@/locales/pt_br.json';
import es from '@/locales/es.json';
import ro from '@/locales/ro.json';
import { icuMessageCompiler } from '@/utils/plugins/icuMessageCompiler';

const languages = {
  en,
  'pt-br': ptbr,
  es,
  ro,
};

const messages = Object.assign(languages);

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
  messageCompiler: icuMessageCompiler,
  globalInjection: true,
  warnHtmlInMessage: 'off',
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  missingWarn: false,
  fallbackWarn: false,
});

export default i18n;
