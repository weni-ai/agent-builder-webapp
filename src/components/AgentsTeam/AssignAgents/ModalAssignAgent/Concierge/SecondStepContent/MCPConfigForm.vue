<template>
  <section class="modal-assign-agent__form">
    <template
      v-for="element in config"
      :key="element.name"
    >
      <UnnnicSwitch
        v-if="element.type === 'SWITCH'"
        :option="element.label"
        :modelValue="configValues[element.name] ?? false"
        @update:model-value="updateFieldValue(element.name, $event)"
      />

      <UnnnicSelectSmart
        v-else-if="element.type === 'SELECT'"
        :label="element.label"
        :options="formatOptions(element.options)"
        :modelValue="getSelectModelValue(element)"
        orderedByIndex
        @update:model-value="handleSelectChange(element.name, $event)"
      />

      <UnnnicInput
        v-else-if="['NUMBER', 'TEXT', 'INPUT'].includes(element.type)"
        :label="element.label"
        :modelValue="String(configValues[element.name] ?? '')"
        :nativeType="element.type === 'NUMBER' ? 'number' : 'text'"
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
        state="vertical"
        :label="element.label"
        :modelValue="configValues[element.name]"
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
</template>

<script setup lang="ts">
import { AgentMCP } from '@/store/types/Agents.types';
import { watch } from 'vue';

type MCPConfigField = AgentMCP['config'] extends (infer U)[] ? U : never;
type MCPConfigValue = string | string[] | boolean;

const props = defineProps<{
  config: MCPConfigField[];
}>();

const configValues = defineModel<Record<string, MCPConfigValue>>(
  'configValues',
  {
    required: true,
  },
);

function buildInitialValues(config: MCPConfigField[]) {
  config.forEach((element) => {
    if (element.default_value !== undefined) {
      configValues.value[element.name] =
        element.default_value as MCPConfigValue;
    }
  });
}

watch(
  () => props.config,
  (newValue) => {
    buildInitialValues(newValue);
  },
  { immediate: true },
);

function updateFieldValue(name: string, value: MCPConfigValue) {
  configValues.value = {
    ...configValues.value,
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
  const value = configValues.value[field.name];
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
  const value = configValues.value[fieldName];
  if (!Array.isArray(value)) return false;
  return value.includes(optionValue);
}

function toggleCheckboxValue(fieldName: string, optionValue: string) {
  const value = configValues.value[fieldName];
  const nextValue = new Set(Array.isArray(value) ? value : []);
  if (nextValue.has(optionValue)) {
    nextValue.delete(optionValue);
  } else {
    nextValue.add(optionValue);
  }
  updateFieldValue(fieldName, Array.from(nextValue));
}
</script>
