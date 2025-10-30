import { createApp } from 'vue';
import { createPinia } from 'pinia';
import * as Sentry from '@sentry/vue';
import Particles from '@tsparticles/vue3';
import { loadSlim } from '@tsparticles/slim';

import App from './App.vue';
import router from './router';
import i18n from './utils/plugins/i18n.ts';
import UnnnicDivider from './components/Divider.vue';
import UnnnicIntelligenceText from './components/unnnic-intelligence/Text.vue';
import Unnnic from './utils/plugins/UnnnicSystem.ts';
import { gbKey, initializeGrowthBook } from './utils/Growthbook.js';
import env from './utils/env';
import { isFederatedModule } from './utils/moduleFederation';
import { getJwtToken, setupTokenRefreshListener } from './utils/jwt.js';
import { getProjectUuid } from './utils/project.js';
import { setupLanguageListener } from './utils/language.js';
import { useUserStore } from './store/User.js';

import './styles/global.scss';
import '@weni/unnnic-system/dist/style.css';

export default async function mountAgentBuilderApp({
  containerId = 'app',
  initialRoute,
} = {}) {
  const gbInstance = await initializeGrowthBook();

  const isInIframe = window.self !== window.top;
  if (!isFederatedModule && isInIframe) {
    await Promise.all([
      getJwtToken(),
      getProjectUuid(),
      setupLanguageListener(),
    ]);
  }

  let appRef = null;
  const app = createApp(App);

  const pinia = createPinia();

  app.use(pinia).use(router).use(Unnnic).use(i18n);

  if (!isFederatedModule && isInIframe) {
    const userStore = useUserStore();
    setupTokenRefreshListener(userStore);
  }

  app.use(Particles, {
    init: async (engine) => {
      await loadSlim(engine);
    },
  });

  if (isFederatedModule && initialRoute) await router.replace(initialRoute);

  if (env('SENTRY_URL')) {
    Sentry.init({
      app,
      dsn: env('SENTRY_URL'),
      environment: env('SENTRY_ENVIRONMENT'),
      integrations: [
        Sentry.browserTracingIntegration({ router }),
        // Sentry.replayIntegration(), // Disabled due to CSP violations in federated module
      ],
      tracesSampleRate: 1.0,
      // replaysSessionSampleRate: 0.1,
      // replaysOnErrorSampleRate: 1.0,
      trackComponents: true,
      beforeSend: (event) => {
        if (window.location.hostname === 'localhost') {
          return null;
        }

        return event;
      },
    });
  }

  app.component('UnnnicDivider', UnnnicDivider);
  app.component('UnnnicIntelligenceText', UnnnicIntelligenceText);

  app.provide(gbKey, gbInstance);

  app.mount(`#${containerId}`);
  appRef = app;

  return { app: appRef, router };
}

if (!isFederatedModule) {
  mountAgentBuilderApp();
}
