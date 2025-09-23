import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

export default async function mountAgentBuilderApp({
  containerId = 'app',
} = {}) {
  let appRef = null;
  const app = createApp(App);
  app.use(router);

  app.mount(`#${containerId}`);
  appRef = app;

  return {
    app: appRef,
  };
}

mountAgentBuilderApp();
