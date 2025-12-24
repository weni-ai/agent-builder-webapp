<template>
  <section
    v-if="MCPs.length"
    class="modal-assign-agent__content"
  >
    <MCPSelection
      :MCPs="MCPs"
      :selectedMCP="selectedMCP"
      @select="handleSelectMCP"
    />

    <section
      v-if="selectedMCP && selectedMCPConfig.length"
      class="modal-assign-agent__form"
    >
      <template
        v-for="element in selectedMCPConfig"
        :key="element.name"
      >
        <UnnnicSelectSmart
          v-if="element.type === 'SELECT'"
          :label="element.label"
          :options="formatOptions(element.options)"
          :modelValue="getSelectModelValue(element)"
          orderedByIndex
          @update:model-value="handleSelectChange(element.name, $event)"
        />

        <UnnnicInput
          v-else-if="element.type === 'INPUT'"
          :label="element.label"
          :modelValue="selectedMCPConfigValues[element.name] ?? ''"
          @update:model-value="updateFieldValue(element.name, $event)"
        />

        <UnnnicCheckboxGroup
          v-else-if="element.type === 'CHECKBOX'"
          :label="element.label"
        >
          <UnnnicCheckbox
            v-for="option in element.options"
            :key="option.value || option.name"
            :label="option.name"
            :modelValue="isCheckboxChecked(element.name, option.value)"
            @update:model-value="
              () => toggleCheckboxValue(element.name, option.value)
            "
          />
        </UnnnicCheckboxGroup>

        <UnnnicRadioGroup
          v-else-if="element.type === 'RADIO'"
          :label="element.label"
          :modelValue="selectedMCPConfigValues[element.name]"
          @update:model-value="updateFieldValue(element.name, $event)"
        >
          <UnnnicRadio
            v-for="option in element.options"
            :key="option.value || option.name"
            :label="option.name"
            :value="option.value || option.name"
          >
            {{ option.name }}
          </UnnnicRadio>
        </UnnnicRadioGroup>
      </template>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import MCPSelection from './MCPSelection.vue';
import { AgentMCP } from '@/store/types/Agents.types';
type MCPConfigField = AgentMCP['config'] extends (infer U)[] ? U : never;
type MCPConfigValue = string | string[] | boolean;
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
function updateFieldValue(name: string, value: MCPConfigValue) {
  selectedMCPConfigValues.value = {
    ...selectedMCPConfigValues.value,
    [name]: value,
  };
}
function formatOptions(options: MCPConfigField['options'] = []) {
  return options.map((option) => ({
    label: option.name,
    value: option.value || option.name,
  }));
}
function getSelectModelValue(field: MCPConfigField) {
  const value = selectedMCPConfigValues.value[field.name];
  if (!value) return [];
  const option = formatOptions(field.options).find(
    (option) => option.value === value,
  );
  return option ? [option] : [];
}
function handleSelectChange(name: string, selectedOptions) {
  const [option] = selectedOptions || [];
  updateFieldValue(name, option?.value ?? '');
}
function isCheckboxChecked(fieldName: string, optionValue: string) {
  const value = selectedMCPConfigValues.value[fieldName];
  if (!Array.isArray(value)) return false;
  return value.includes(optionValue);
}
function toggleCheckboxValue(fieldName: string, optionValue: string) {
  const value = selectedMCPConfigValues.value[fieldName];
  const nextValue = new Set(Array.isArray(value) ? value : []);
  if (nextValue.has(optionValue)) {
    nextValue.delete(optionValue);
  } else {
    nextValue.add(optionValue);
  }
  updateFieldValue(fieldName, Array.from(nextValue));
}
</script>

<style scoped lang="scss">
.modal-assign-agent__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $unnnic-space-4;

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
</style>
