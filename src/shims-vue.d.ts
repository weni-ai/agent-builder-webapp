declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent;
  export default component;
}

declare module 'connect/sharedStore' {
  export function useSharedStore(): Record<string, unknown>;
}
