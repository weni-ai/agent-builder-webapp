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
import { moduleStorage } from './utils/storage';
import { safeImport, isFederatedModule } from './utils/moduleFederation';

import './styles/global.scss';
import '@weni/unnnic-system/dist/style.css';

let sharedStore = null;

try {
  const { useSharedStore } = await safeImport(
    () => import('connect/sharedStore'),
    'connect/sharedStore',
  );
  sharedStore = useSharedStore?.();
} catch (error) {
  console.error(error);
}

export default async function mountAgentBuilderApp({
  containerId = 'app',
  initialRoute,
} = {}) {
  const gbInstance = await initializeGrowthBook();

  let appRef = null;
  const app = createApp(App);

  const pinia = createPinia();

  app.use(pinia).use(router).use(Unnnic).use(i18n);

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

  if (sharedStore) {
    moduleStorage.setItem('authToken', sharedStore.auth.token);
    moduleStorage.setItem('projectUuid', sharedStore.current.project.uuid);
  }

  app.component('UnnnicDivider', UnnnicDivider);
  app.component('UnnnicIntelligenceText', UnnnicIntelligenceText);

  app.provide(gbKey, gbInstance);

  app.mount(`#${containerId}`);
  appRef = app;

  return { app: appRef, router };
}

if (!sharedStore) {
  mountAgentBuilderApp();
}
