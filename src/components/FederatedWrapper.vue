<template>
  <div class="agent-builder-federated">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import en from '@/locales/en.json';
import ptBr from '@/locales/pt_br.json';
import es from '@/locales/es.json';

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
function ensurePinia(): void {
  if (getActivePinia()) return;

  const instance = getCurrentInstance();
  const app = instance?.appContext?.app;

  if (app) {
    app.use(createPinia());
  }
}

ensurePinia();

/**
 * Merges the locales into the i18n instance.
 * Used by individually exported components (Module Federation) that may
 * run inside a host app without its own i18n instance.
 *
 * Must be called inside a component's setup function.
 * No-op if i18n is already merged.
 */
let localesMerged = false;
if (!localesMerged) {
  try {
    const i18n = useI18n({ useScope: 'global' });

    i18n.mergeLocaleMessage('en', en);
    i18n.mergeLocaleMessage('pt-br', ptBr);
    i18n.mergeLocaleMessage('es', es);
    localesMerged = true;
  } catch {
    console.error('i18n not available in this context');
  }
}
</script>

<style lang="scss">
.agent-builder-federated {
  @import '../styles/global.scss';
}
</style>
