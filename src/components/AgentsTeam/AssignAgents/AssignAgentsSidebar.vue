<template>
  <aside class="assign-agents-sidebar">
    <section class="assign-agents-sidebar__section">
      <p class="assign-agents-sidebar__section-title">
        {{ $t('agents.assign_agents.sidebar.official_title') }}
      </p>

      <button
        class="assign-agents-sidebar__option"
        :class="{
          'assign-agents-sidebar__option--active':
            !assignAgentsFilters.system ||
            assignAgentsFilters.system === 'ALL_OFFICIAL',
        }"
        data-testid="sidebar-option-all-systems"
        @click="assignAgentsFilters.system = 'ALL_OFFICIAL'"
      >
        <p>{{ $t('agents.assign_agents.sidebar.all_systems') }}</p>
      </button>

      <button
        v-for="option in systems"
        :key="option.name"
        class="assign-agents-sidebar__option"
        :class="{
          'assign-agents-sidebar__option--active':
            assignAgentsFilters.system === option.name,
        }"
        :data-testid="`sidebar-option-system-${option.name}`"
        @click="handleSystemSelect(option)"
      >
        <img
          v-if="option.icon"
          :src="option.icon"
          :alt="option.name"
          class="assign-agents-sidebar__option-icon"
        />
        <p>{{ option.name }}</p>
      </button>
    </section>

    <section class="assign-agents-sidebar__section">
      <p class="assign-agents-sidebar__section-title">
        {{ $t('agents.assign_agents.sidebar.custom_title') }}
      </p>

      <button
        class="assign-agents-sidebar__option"
        data-testid="sidebar-option-custom"
        :class="{
          'assign-agents-sidebar__option--active':
            assignAgentsFilters.system === 'ALL_CUSTOM',
        }"
        @click="assignAgentsFilters.system = 'ALL_CUSTOM'"
      >
        <p>{{ $t('agents.assign_agents.sidebar.all_custom_agents') }}</p>
      </button>
    </section>
  </aside>
</template>

<script setup>
import { storeToRefs } from 'pinia';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import useAgentSystems from '@/composables/useAgentSystems';

const agentsTeamStore = useAgentsTeamStore();
const { assignAgentsFilters } = storeToRefs(agentsTeamStore);

const { systems } = useAgentSystems();

function handleSystemSelect(option) {
  if (agentsTeamStore.assignAgentsFilters.system === option.name) return;

  agentsTeamStore.assignAgentsFilters.system = option.name;
  agentsTeamStore.loadOfficialAgents();
}
</script>

<style scoped lang="scss">
.assign-agents-sidebar {
  border-right: 1px solid $unnnic-color-border-soft;

  padding: $unnnic-space-6 $unnnic-space-4 0 0;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  &__section {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
  }

  &__section-title {
    color: $unnnic-color-fg-muted;
    font: $unnnic-font-caption-2;
    margin-left: $unnnic-space-3;
  }

  &__option {
    border: none;

    border-radius: $unnnic-radius-2;
    padding: $unnnic-space-3 $unnnic-space-3;

    display: flex;
    align-items: center;
    gap: $unnnic-space-2;

    width: 100%;

    color: $unnnic-color-fg-base;
    font: $unnnic-font-emphasis;
    text-align: left;

    cursor: pointer;
    transition: all;

    &--active {
      background: $unnnic-color-bg-soft;
      color: $unnnic-color-fg-base;
      font: $unnnic-font-action;
    }

    &-icon {
      width: $unnnic-icon-size-4;
      height: $unnnic-icon-size-4;
    }
  }
}
</style>
