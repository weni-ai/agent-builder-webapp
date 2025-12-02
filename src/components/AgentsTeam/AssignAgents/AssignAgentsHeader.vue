<template>
  <header class="assign-agents-header">
    <h2
      class="assign-agents-header__title"
      data-testid="assign-agents-header-title"
    >
      {{ $t('agents.assign_agents.header.title') }}
    </h2>

    <p
      class="assign-agents-header__subtitle"
      data-testid="assign-agents-header-subtitle"
    >
      {{
        $t(
          'agents.assign_agents.header.agents_available',
          availableAgentsCount,
          {
            count: availableAgentsCount,
          },
        )
      }}
    </p>
  </header>
</template>

<script setup>
import { computed } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

const agentsTeamStore = useAgentsTeamStore();
const availableAgentsCount = computed(
  () => agentsTeamStore.officialAgents.data?.length || 0,
);
</script>

<style scoped lang="scss">
.assign-agents-header {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-1;

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
