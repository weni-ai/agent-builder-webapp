<template>
  <section class="view-agents">
    <UnnnicPageHeader
      data-testid="agents-header"
      :title="headerTitle"
      :description="headerDescription"
      :hasBackButton="route.name !== 'agents-team'"
      @back="$router.push({ name: 'agents-team' })"
    >
      <template
        v-if="headerActions"
        #actions
      >
        <component :is="headerActions" />
      </template>
    </UnnnicPageHeader>

    <RouterView data-testid="router-view" />
  </section>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import { useRoute } from 'vue-router';

import i18n from '@/utils/plugins/i18n';

import HomeHeaderActions from '@/components/AgentsTeam/HomeHeaderActions.vue';

const route = useRoute();
const { t } = i18n.global;

const headerTitle = computed(() => {
  const titles: Record<string, string> = {
    'agents-team': t('agents.title'),
    'agents-assign': t('agents.assign_agents.title'),
  };

  return titles[route.name as string] || titles['agents-team'];
});

const headerDescription = computed(() => {
  const descriptions: Record<string, string> = {
    'agents-team': t('agents.description'),
    'agents-assign': t('agents.assign_agents.description'),
  };

  return descriptions[route.name as string] || descriptions['agents-team'];
});

const headerActions = computed(() => {
  const actionsMap: Record<string, Component | null> = {
    'agents-team': HomeHeaderActions,
    'agents-assign': null,
  };

  return actionsMap[route.name as string] || null;
});
</script>

<style lang="scss" scoped>
section.view-agents {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: $unnnic-space-4;
  height: 100%;
}
</style>
