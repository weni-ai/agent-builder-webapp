<template>
  <Section :title="$t('agents.assigned_agents.agent_details.mcp')">
    <article class="agent-detail-modal__mcp-card">
      <header
        v-if="mcpTitle || mcpDescription"
        class="agent-detail-modal__mcp-header"
      >
        <p
          v-if="mcpTitle"
          class="agent-detail-modal__mcp-title"
        >
          {{ mcpTitle }}
        </p>
        <p
          v-if="mcpDescription"
          class="agent-detail-modal__mcp-description"
        >
          {{ mcpDescription }}
        </p>
      </header>

      <section
        v-if="mcpArguments.length"
        class="agent-detail-modal__mcp-arguments"
      >
        <p
          v-for="argument in mcpArguments"
          :key="argument.label"
          class="agent-detail-modal__mcp-argument"
        >
          <span class="agent-detail-modal__mcp-argument-label">
            {{ argument.label }}:
          </span>
          <span class="agent-detail-modal__mcp-argument-value">
            {{ argument.value }}
          </span>
        </p>
      </section>
    </article>
  </Section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Section from './Section.vue';
import type {
  AgentAssignedMCP,
  AgentAssignedMCPConfigValue,
} from '@/store/types/Agents.types';

const props = defineProps<{
  mcp: AgentAssignedMCP;
}>();

const mcpTitle = computed(() => props.mcp.name || '');
const mcpDescription = computed(() => props.mcp.description || '');

const mcpArguments = computed(() => {
  const configEntries = props.mcp.config || {};
  return Object.entries(configEntries)
    .filter(([_label, value]) => !isValueEmpty(value))
    .map(([label, value]) => ({
      label,
      value: formatValue(value),
    }));
});

function isValueEmpty(value: AgentAssignedMCPConfigValue) {
  return value === null || value === undefined || value === '';
}

function formatValue(value: AgentAssignedMCPConfigValue) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}
</script>

<style scoped lang="scss">
.agent-detail-modal__mcp-card {
  border: 1px solid $unnnic-color-border-soft;
  border-radius: $unnnic-radius-4;
  padding: $unnnic-space-3 $unnnic-space-4;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-3;
}

.agent-detail-modal__mcp-header {
  padding-bottom: $unnnic-space-3;
  border-bottom: 1px solid $unnnic-color-border-soft;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-1;
}

.agent-detail-modal__mcp-title {
  color: $unnnic-color-fg-emphasized;
  font: $unnnic-font-action;
}

.agent-detail-modal__mcp-description {
  color: $unnnic-color-fg-base;
  font: $unnnic-font-body;
}

.agent-detail-modal__mcp-arguments {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-1;
}

.agent-detail-modal__mcp-argument {
  color: $unnnic-color-fg-base;
  font: $unnnic-font-body;
}

.agent-detail-modal__mcp-argument-label {
  color: $unnnic-color-fg-base;
  font: $unnnic-font-action;
}
</style>
