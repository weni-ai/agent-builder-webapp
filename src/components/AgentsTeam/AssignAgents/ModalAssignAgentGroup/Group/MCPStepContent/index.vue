<template>
  <section
    v-if="MCPs.length"
    class="modal-assign-agent__content"
    data-testid="concierge-second-step"
  >
    <MCPSelection
      data-testid="concierge-second-step-mcp-selection"
      :MCPs="MCPs"
      :selectedMCP="selectedMCP"
      @select="handleSelectMCP"
    />

    <section
      v-if="selectedMCP"
      class="modal-assign-agent__config"
    >
      <p class="modal-assign-agent__config-title">
        {{
          $t('agents.assign_agents.setup.mcp_config.title', {
            mcp: selectedMCP?.name,
          })
        }}
      </p>

      <MCPConfigForm
        v-if="selectedMCPConfig.length"
        v-model:configValues="selectedMCPConfigValues"
        :config="selectedMCPConfig"
        data-testid="concierge-second-step-config-form"
      />

      <p
        v-else
        class="modal-assign-agent__config-description"
        data-testid="concierge-second-step-config-description"
      >
        {{ $t('agents.assign_agents.setup.mcp_config.description') }}
      </p>
    </section>

    <section
      v-else
      class="modal-assign-agent__config-placeholder"
      data-testid="concierge-second-step-placeholder"
    >
      <p class="modal-assign-agent__config-placeholder-title">
        {{ $t('agents.assign_agents.setup.mcp_config.placeholder_title') }}
      </p>

      <p class="modal-assign-agent__config-placeholder-description">
        {{
          $t('agents.assign_agents.setup.mcp_config.placeholder_description')
        }}
      </p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import MCPSelection from './MCPSelection.vue';
import MCPConfigForm from './MCPConfigForm.vue';
import { AgentMCP } from '@/store/types/Agents.types';
type MCPConfigField = AgentMCP['config'] extends (infer U)[] ? U : never;
type MCPConfigValue = string | string[] | boolean;

defineOptions({
  name: 'MCPStepContent',
});

defineProps<{
  // eslint-disable-next-line vue/prop-name-casing
  MCPs: AgentMCP[];
}>();
const selectedMCP = defineModel<AgentMCP | null>('selectedMCP', {
  required: true,
});
const selectedMCPConfigValues = defineModel<Record<string, MCPConfigValue>>(
  'selectedMCPConfigValues',
  {
    required: true,
    default: () => ({}),
  },
);
const selectedMCPConfig = computed<MCPConfigField[]>(() => {
  return (selectedMCP.value?.config ?? []) as MCPConfigField[];
});
watch(
  () => selectedMCP.value,
  (next) => {
    if (!next) return;
    if (Object.keys(selectedMCPConfigValues.value || {}).length) {
      return;
    }
    selectedMCPConfigValues.value = buildInitialValues(next.config);
  },
  { immediate: true },
);
function handleSelectMCP(MCP: AgentMCP, checked: boolean) {
  if (!checked) return;
  selectedMCP.value = MCP;
  selectedMCPConfigValues.value = buildInitialValues(MCP.config);
}
function buildInitialValues(config: AgentMCP['config'] = []) {
  return (config as MCPConfigField[]).reduce<Record<string, MCPConfigValue>>(
    (acc, field) => {
      if (field.type === 'CHECKBOX') {
        acc[field.name] = [];
        return acc;
      }
      if (field.type === 'SELECT' || field.type === 'RADIO') {
        acc[field.name] = field.options?.[0]?.value ?? '';
        return acc;
      }
      acc[field.name] = '';
      return acc;
    },
    {},
  );
}
</script>

<style scoped lang="scss">
.modal-assign-agent__content {
  overflow: auto;

  display: grid;
  grid-template-columns: 1fr 1fr;

  width: 100%;

  & > :first-child {
    border-right: 1px solid $unnnic-color-border-soft;
  }
}

.modal-assign-agent__form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  width: 100%;
}

.modal-assign-agent__config-placeholder,
.modal-assign-agent__config {
  display: flex;
  flex-direction: column;

  width: 100%;
  min-height: 100%;
  padding: $unnnic-space-6;
}

.modal-assign-agent__config-placeholder {
  align-items: center;
  justify-content: center;
  gap: $unnnic-space-1;

  text-align: center;

  &-title {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-display-3;
  }

  &-description {
    margin: 0 $unnnic-space-8;

    color: $unnnic-color-fg-muted;
    font: $unnnic-font-body;
  }
}

.modal-assign-agent__config {
  align-items: flex-start;
  justify-content: flex-start;
  gap: $unnnic-space-4;

  text-align: left;

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
