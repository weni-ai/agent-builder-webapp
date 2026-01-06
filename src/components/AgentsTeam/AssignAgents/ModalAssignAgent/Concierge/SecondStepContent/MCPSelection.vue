<template>
  <section
    class="modal-assign-agent__mcp-selection"
    data-testid="concierge-second-step-mcp-selection"
  >
    <header class="modal-assign-agent__content-header">
      <p class="modal-assign-agent__content-title">
        {{ t('agents.assign_agents.setup.mcp_selection.title') }}
      </p>

      <p class="modal-assign-agent__content-description">
        {{ t('agents.assign_agents.setup.mcp_selection.description') }}
      </p>
    </header>

    <section
      class="modal-assign-agent__content-mcp-list"
      data-testid="concierge-second-step-mcp-list"
    >
      <ModalAssignAgentRadio
        v-for="MCP in MCPs"
        :key="MCP.name"
        data-testid="concierge-second-step-mcp-radio"
        :selected="selectedMCP?.name === MCP.name"
        :label="MCP.name"
        :description="MCP.description"
        descriptionVariant="body"
        @update:selected="(checked: boolean) => handleSelect(MCP, checked)"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import ModalAssignAgentRadio from '@/components/AgentsTeam/AssignAgents/ModalAssignAgent/Radio.vue';

import { AgentMCP } from '@/store/types/Agents.types';

defineProps<{
  // eslint-disable-next-line vue/prop-name-casing
  MCPs: AgentMCP[];
  selectedMCP: AgentMCP | null;
}>();

const { t } = useI18n();

const emit = defineEmits<{
  (_event: 'select', _MCP: AgentMCP, _checked: boolean): void;
}>();

function handleSelect(MCP: AgentMCP, checked: boolean) {
  emit('select', MCP, checked);
}
</script>

<style scoped lang="scss">
.modal-assign-agent__mcp-selection {
  padding: $unnnic-space-6;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  width: 100%;
}

.modal-assign-agent__content-header {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-1;
}

.modal-assign-agent__content-title {
  color: $unnnic-color-fg-emphasized;
  font: $unnnic-font-display-3;
}

.modal-assign-agent__content-description {
  color: $unnnic-color-fg-base;
  font: $unnnic-font-body;
}

.modal-assign-agent__content-mcp-list {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;

  width: 100%;
}
</style>
