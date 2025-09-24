import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Particles from '@tsparticles/vue3';
import { loadSlim } from '@tsparticles/slim';

import App from './App.vue';
import router from './router';
import i18n from './utils/plugins/i18n.ts';
import UnnnicDivider from './components/Divider.vue';
import UnnnicIntelligenceText from './components/unnnic-intelligence/Text.vue';
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

  app.use(Particles, {
    init: async (engine) => {
      await loadSlim(engine);
    },
  });

  app.component('UnnnicDivider', UnnnicDivider);
  app.component('UnnnicIntelligenceText', UnnnicIntelligenceText);

  app.provide(gbKey, gbInstance);

  app.mount(`#${containerId}`);
  appRef = app;

  return {
    app: appRef,
  };
}

mountAgentBuilderApp();
