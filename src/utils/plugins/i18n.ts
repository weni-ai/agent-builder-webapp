import { createI18n } from 'vue-i18n';

import en from '@/locales/en.json';
import ptbr from '@/locales/pt_br.json';
import es from '@/locales/es.json';

const languages = {
  'en-US': en,
  'pt-BR': ptbr,
  es,
};

const messages = Object.assign(languages);

const i18n = createI18n({
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages,
  warnHtmlInMessage: 'off',
});

export default i18n;
