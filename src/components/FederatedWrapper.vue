<template>
  <div
    v-if="ready"
    class="agent-builder-federated"
  >
    <slot />
  </div>
</template>

<script lang="ts">
// Module-level state: persists across all component instances
// (unlike <script setup> which resets per mount)

let localesMerged = false;
let cachedImport: Record<string, unknown> | null = null;
</script>

<script setup lang="ts">
import { ref, getCurrentInstance, onBeforeMount } from 'vue';
import { createPinia, getActivePinia } from 'pinia';
import { useI18n } from 'vue-i18n';

import { safeImport } from '@/utils/moduleFederation';
import { moduleStorage } from '@/utils/storage';

import { useProjectStore } from '@/store/Project';
import { useUserStore } from '@/store/User';
import { useTuningsStore } from '@/store/Tunings';

import en from '@/locales/en.json';
import ptBr from '@/locales/pt_br.json';
import es from '@/locales/es.json';

const ready = ref(false);

if (!getActivePinia()) {
  const app = getCurrentInstance()?.appContext?.app;
  if (app) app.use(createPinia());
}

if (!localesMerged) {
  try {
    const i18n = useI18n({ useScope: 'global' });

    i18n.mergeLocaleMessage('en', en);
    i18n.mergeLocaleMessage('pt-br', ptBr);
    i18n.mergeLocaleMessage('es', es);
    localesMerged = true;
  } catch {
    // i18n not available in this context
  }
}

onBeforeMount(async () => {
  if (!cachedImport) {
    cachedImport = await safeImport(
      () => import('connect/sharedStore'),
      'connect/sharedStore',
    );
  }

  const useSharedStore = cachedImport?.useSharedStore as
    | (() => {
        auth: { token: string };
        current: { project: { uuid: string } };
      })
    | undefined;

  const sharedStore = useSharedStore?.();

  if (sharedStore) {
    const newToken = sharedStore.auth.token;
    const newProjectUuid = sharedStore.current.project.uuid;

    const currentToken = moduleStorage.getItem('authToken');
    const currentProjectUuid = moduleStorage.getItem('projectUuid');

    const hasContextChanged =
      newToken !== currentToken || newProjectUuid !== currentProjectUuid;

    moduleStorage.setItem('authToken', newToken);
    moduleStorage.setItem('projectUuid', newProjectUuid);

    if (hasContextChanged) {
      useUserStore().setToken(newToken);
      useProjectStore().$dispose();
      useTuningsStore().$dispose();
    }
  }

  ready.value = true;
});
</script>

<style lang="scss">
:where(.agent-builder-federated) {
  :where(*, *::before, *::after) {
    box-sizing: border-box;
  }

  :where(*) {
    margin: 0;
    padding: 0;
    border: 0;
  }

  :where(ol, ul) {
    list-style: none;
  }

  :where(img, picture, video, canvas, svg) {
    display: block;
    max-width: 100%;
  }

  :where(input, button, textarea, select) {
    font: inherit;
  }

  :where(p, h1, h2, h3, h4, h5, h6) {
    overflow-wrap: break-word;
  }

  :where(p) {
    text-wrap: pretty;
  }

  :where(h1, h2, h3, h4, h5, h6) {
    text-wrap: balance;
  }

  :where(table) {
    border-collapse: collapse;
    border-spacing: 0;
  }
}
</style>
