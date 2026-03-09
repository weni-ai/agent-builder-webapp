<template>
  <div class="agent-builder-federated">
    <slot />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ensurePinia } from '@/utils/ensurePinia';

import en from '@/locales/en.json';
import ptBr from '@/locales/pt_br.json';
import es from '@/locales/es.json';

ensurePinia();

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
