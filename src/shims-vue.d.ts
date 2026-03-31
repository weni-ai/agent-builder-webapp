declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent;
  export default component;
}

declare module 'connect/sharedStore' {
  interface SharedStore {
    auth: { token: string };
    current: { project: { uuid: string } };
  }

  export function useSharedStore(): SharedStore;
}
