<template>
  <section class="modal-assign-agent__content">
    <header class="modal-assign-agent__content-header">
      <p class="modal-assign-agent__content-title">
        {{ $t('agents.assign_agents.setup.system_selection.title') }}
      </p>

      <p class="modal-assign-agent__content-description">
        {{ $t('agents.assign_agents.setup.system_selection.description') }}
      </p>
    </header>

    <section class="modal-assign-agent__content-systems">
      <ModalAssignAgentRadio
        v-for="system in systems"
        :key="system"
        :selected="system.toLowerCase() === selectedSystem.toLowerCase()"
        :label="getSystemObject(system).name"
        :description="mcpLabel"
        :system="system"
        @update:selected="() => handleSelectSystem(system)"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import i18n from '@/utils/plugins/i18n';

import useAgentSystems from '@/composables/useAgentSystems';

import { AgentSystem } from '@/store/types/Agents.types';

import ModalAssignAgentRadio from '../Radio.vue';

defineProps<{
  systems: AgentSystem[];
}>();

const selectedSystem = defineModel<AgentSystem>('selectedSystem', {
  required: true,
});

const { getSystemObject } = useAgentSystems();

const mcpLabel = computed(() => {
  return i18n.global.t(
    'agents.assign_agents.setup.system_selection.mcp_count',
    {
      count: 0, // TODO: Add MCP count when endpoint returns it
    },
  );
});

function handleSelectSystem(system: AgentSystem) {
  if (selectedSystem.value === system) return;
  selectedSystem.value = system;
}
</script>

<style scoped lang="scss">
.modal-assign-agent__content {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  padding: $unnnic-space-6;

  &-systems {
    display: flex;
    gap: $unnnic-space-4;
  }

  &-header {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &-title {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-display-3;
  }

  &-description {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;
  }
}
</style>
