import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import i18n from './utils/plugins/i18n.ts';
import Unnnic from './utils/plugins/UnnnicSystem.ts';
import { gbKey, initializeGrowthBook } from './utils/Growthbook.js';

import './styles/global.scss';
import '@weni/unnnic-system/dist/style.css';


export default async function mountAgentBuilderApp({
  containerId = 'app',
} = {}) {
  const gbInstance = await initializeGrowthBook();

  let appRef = null;
  const app = createApp(App);

  const pinia = createPinia();

  app
  .use(pinia)
  .use(router)
  .use(Unnnic)
  .use(i18n)

  app.provide(gbKey, gbInstance);

  app.mount(`#${containerId}`);
  appRef = app;

  return {
    app: appRef,
  };
}

mountAgentBuilderApp();
