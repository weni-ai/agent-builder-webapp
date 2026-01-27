<template>
  <section
    class="modal-assign-agent__content"
    data-testid="concierge-first-step"
  >
    <header class="modal-assign-agent__content-header">
      <p class="modal-assign-agent__content-title">
        {{ $t('agents.assign_agents.setup.system_selection.title') }}
      </p>

      <p class="modal-assign-agent__content-description">
        {{ $t('agents.assign_agents.setup.system_selection.description') }}
      </p>
    </header>

    <section
      class="modal-assign-agent__content-systems"
      data-testid="concierge-first-step-systems"
    >
      <ModalAssignAgentRadio
        v-for="system in systems"
        :key="system"
        data-testid="concierge-first-step-radio"
        :selected="system.toLowerCase() === selectedSystem.toLowerCase()"
        :label="getSystemObject(system)?.name ?? system"
        :system="system"
        :description="getMCPCountDescription(system)"
        @update:selected="() => handleSelectSystem(system)"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import useAgentSystems from '@/composables/useAgentSystems';
import i18n from '@/utils/plugins/i18n';

import { AgentMCP } from '@/store/types/Agents.types';

import ModalAssignAgentRadio from '../Radio.vue';

defineOptions({
  name: 'SystemStepContent',
});

const props = defineProps<{
  systems: string[];
  MCPs: AgentMCP[];
}>();

const selectedSystem = defineModel<string>('selectedSystem', {
  required: true,
});

const { getSystemObject } = useAgentSystems();
const { t } = i18n.global;

function handleSelectSystem(system: string) {
  if (selectedSystem.value === system) return;
  selectedSystem.value = system;
}

function getMCPCountDescription(system: string) {
  const count = props.MCPs.filter((mcp) => mcp.system === system).length;

  return t(
    'agents.assign_agents.setup.system_selection.mcp_count',
    { count },
    count,
  );
}
</script>

<style scoped lang="scss">
.modal-assign-agent__content {
  overflow: auto;

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
