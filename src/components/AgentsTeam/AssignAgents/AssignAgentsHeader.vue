<template>
  <header class="assign-agents-header">
    <h2
      class="assign-agents-header__title"
      data-testid="assign-agents-header-title"
    >
      {{ headerTitle }}
    </h2>

    <p
      class="assign-agents-header__subtitle"
      data-testid="assign-agents-header-subtitle"
    >
      {{ availableAgentsText }}
    </p>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import i18n from '@/utils/plugins/i18n';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

const agentsTeamStore = useAgentsTeamStore();
const { officialAgents, assignAgentsFilters } = storeToRefs(agentsTeamStore);
const { t } = i18n.global;

const availableAgentsCount = computed(
  () => officialAgents.value.data?.length || 0,
);

const headerTitle = computed(() => {
  const systemLabel = assignAgentsFilters.value.system;

  if (systemLabel === 'ALL_OFFICIAL') {
    return t('agents.assign_agents.header.all_systems');
  }

  if (systemLabel === 'ALL_CUSTOM') {
    return t('agents.assign_agents.header.all_custom_agents');
  }

  return t('agents.assign_agents.header.system_title', {
    system: systemLabel,
  });
});

const availableAgentsText = computed(() =>
  t(
    'agents.assign_agents.header.agents_available',
    availableAgentsCount.value,
    {
      count: availableAgentsCount.value,
    },
  ),
);
</script>

<style scoped lang="scss">
.assign-agents-header {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-1;

  margin-top: $unnnic-space-6;

  &__title {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-display-2;
  }

  &__subtitle {
    color: $unnnic-color-fg-muted;
    font: $unnnic-font-caption-2;
  }
}
</style>
