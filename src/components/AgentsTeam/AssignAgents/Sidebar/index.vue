<template>
  <aside class="assign-agents-sidebar">
    <SidebarSection :title="$t('agents.assign_agents.sidebar.official_title')">
      <SidebarOption
        :isActive="
          !assignAgentsFilters.system ||
          assignAgentsFilters.system === 'ALL_OFFICIAL'
        "
        :name="$t('agents.assign_agents.sidebar.all_systems')"
        data-testid="sidebar-option-all-systems"
        @click="assignAgentsFilters.system = 'ALL_OFFICIAL'"
      />

      <SidebarOption
        v-for="option in systems"
        :key="option.name"
        :isActive="assignAgentsFilters.system === option.name"
        :name="option.name"
        :icon="option.icon"
        :data-testid="`sidebar-option-system-${option.name}`"
        @click="assignAgentsFilters.system = option.name"
      />
    </SidebarSection>

    <SidebarSection :title="$t('agents.assign_agents.sidebar.custom_title')">
      <SidebarOption
        data-testid="sidebar-option-custom"
        :isActive="assignAgentsFilters.system === 'ALL_CUSTOM'"
        :name="$t('agents.assign_agents.sidebar.all_custom_agents')"
        @click="assignAgentsFilters.system = 'ALL_CUSTOM'"
      />
    </SidebarSection>
  </aside>
</template>

<script setup>
import { watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import useAgentSystems from '@/composables/useAgentSystems';

import SidebarSection from './Section.vue';
import SidebarOption from './Option.vue';

const agentsTeamStore = useAgentsTeamStore();
const { assignAgentsFilters } = storeToRefs(agentsTeamStore);

const { systems } = useAgentSystems();

watch(
  () => agentsTeamStore.assignAgentsFilters.system,
  (newSystem) => {
    if (newSystem === 'ALL_CUSTOM') {
      agentsTeamStore.loadMyAgents();
    } else {
      agentsTeamStore.loadOfficialAgents();
    }
  },
);
</script>

<style scoped lang="scss">
.assign-agents-sidebar {
  border-right: 1px solid $unnnic-color-border-soft;

  padding: $unnnic-space-6 $unnnic-space-4 0 0;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;
}
</style>
