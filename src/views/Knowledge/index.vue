<template>
  <section
    v-if="route.name === 'knowledge'"
    class="knowledge"
  >
    <AgentBuilderHeader
      data-testid="knowledge-header"
      :withDivider="false"
      actionsSize="none"
    />

    <RouterContentBase
      data-testid="router-content-base"
      :filesProp="files"
      :sitesProp="sites"
      @update:files="(v) => (files = v)"
    />
  </section>

  <RouterView v-else />
</template>

<script setup>
import { onMounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import RouterContentBase from '@/components/Knowledge/RouterContentBase.vue';
import { useFilesPagination } from '@/composables/useFilesPagination';
import { useSitesPagination } from '@/composables/useSitesPagination';

import AgentBuilderHeader from '@/components/Header.vue';

const route = useRoute();

const files = useFilesPagination();

const sites = useSitesPagination();

onMounted(() => {
  files.loadNext();
  sites.loadNext();
});
</script>

<style lang="scss" scoped>
.knowledge {
  height: 100%;
  width: 100%;

  display: grid;
  grid-template-rows: auto 1fr;
  gap: $unnnic-spacing-md;
}
</style>
