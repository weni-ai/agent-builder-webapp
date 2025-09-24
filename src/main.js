import { createApp } from 'vue';

import App from './App.vue';
import i18n from './utils/plugins/i18n.ts';

import './styles/global.scss';
import '@weni/unnnic-system/dist/style.css';


export default async function mountAgentBuilderApp({
  containerId = 'app',
} = {}) {
  let appRef = null;
  const app = createApp(App);

  app.use(i18n)

  app.mount(`#${containerId}`);
  appRef = app;

  return {
    app: appRef,
  };
}

mountAgentBuilderApp();
