/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { App } from 'vue';
import UnnnicSystem from '@weni/unnnic-system';

function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const { install: unnnicInstall, ...exportedComponents } = UnnnicSystem;

export default {
  install(app: App, options: { teleportTarget?: string } = {}) {
    unnnicInstall.call(UnnnicSystem, app, options);

    Object.keys(exportedComponents).forEach((componentName) => {
      app.component(
        capitalize(componentName),
        exportedComponents[componentName],
      );
    });
  },
};
