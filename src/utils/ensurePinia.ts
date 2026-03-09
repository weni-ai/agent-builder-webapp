import { getCurrentInstance } from 'vue';
import { createPinia, getActivePinia } from 'pinia';

/**
 * Ensures a Pinia instance is available in the current Vue app context.
 * Used by individually exported components (Module Federation) that may
 * run inside a host app without its own Pinia instance.
 *
 * Must be called inside a component's setup function.
 * No-op if Pinia is already active.
 */
export function ensurePinia(): void {
  if (getActivePinia()) return;

  const instance = getCurrentInstance();
  const app = instance?.appContext?.app;

  if (app) {
    app.use(createPinia());
  }
}
