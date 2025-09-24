/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import UnnnicSystem from '@weni/unnnic-system';

function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const components = {};

UnnnicSystem.install({
  component(name: string, component: any) {
    components[name] = component;
  },
});

export default {
  install(app: any) {
    Object.keys(components).forEach((componentName) => {
      app.component(capitalize(componentName), components[componentName]);
    });
  },
};