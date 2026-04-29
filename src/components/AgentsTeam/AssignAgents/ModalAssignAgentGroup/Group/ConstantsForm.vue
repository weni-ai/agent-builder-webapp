<template>
  <section class="modal-assign-agent__form">
    <template
      v-for="element in constants"
      :key="element.name"
    >
      <UnnnicSwitch
        v-if="element.type === 'SWITCH'"
        data-testid="constants-form-switch"
        :option="fieldLabel(element)"
        :modelValue="constantsValues[element.name] ?? false"
        @update:model-value="updateFieldValue(element.name, $event)"
      />

      <UnnnicSelect
        v-else-if="element.type === 'SELECT'"
        data-testid="constants-form-select"
        :label="fieldLabel(element)"
        :options="formatOptions(element.options)"
        :modelValue="getSelectModelValue(element)"
        @update:model-value="updateFieldValue(element.name, $event)"
      />

      <UnnnicInput
        v-else-if="['NUMBER', 'TEXT', 'INPUT'].includes(element.type)"
        data-testid="constants-form-input"
        :label="fieldLabel(element)"
        :modelValue="String(constantsValues[element.name] ?? '')"
        :nativeType="element.type === 'NUMBER' ? 'number' : 'text'"
        @update:model-value="updateFieldValue(element.name, $event)"
      />

      <UnnnicCheckboxGroup
        v-else-if="element.type === 'CHECKBOX'"
        data-testid="constants-form-checkbox-group"
        :label="fieldLabel(element)"
      >
        <UnnnicCheckbox
          v-for="option in element.options"
          :key="option.value || option.name"
          data-testid="constants-form-checkbox"
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
        data-testid="constants-form-radio-group"
        :label="fieldLabel(element)"
        :modelValue="constantsValues[element.name]"
        @update:model-value="updateFieldValue(element.name, $event)"
      >
        <UnnnicRadio
          v-for="option in element.options"
          :key="option.value || option.name"
          data-testid="constants-form-radio"
          :label="option.name"
          :value="option.value || option.name"
        />
      </UnnnicRadioGroup>
    </template>
  </section>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { AgentConstantField } from '@/store/types/Agents.types';

type ConstantValue = string | string[] | boolean;

const props = defineProps<{
  constants: AgentConstantField[];
}>();

const constantsValues = defineModel<Record<string, ConstantValue>>(
  'constantsValues',
  {
    required: true,
  },
);

const { t } = useI18n();

function fieldLabel(element: AgentConstantField) {
  if (element.is_required) return element.label;
  return `${element.label} (${t('agents.assign_agents.setup.constants.optional')})`;
}

function buildInitialValues(constants: AgentConstantField[] = []) {
  constants.forEach((element) => {
    if (element.default_value !== undefined) {
      constantsValues.value[element.name] =
        element.default_value as ConstantValue;
    }
  });
}

watch(
  () => props.constants,
  (newValue) => {
    buildInitialValues(newValue ?? []);
  },
  { immediate: true },
);

function updateFieldValue(name: string, value: ConstantValue) {
  constantsValues.value = {
    ...constantsValues.value,
    [name]: value,
  };
}

function formatOptions(options: AgentConstantField['options'] = []) {
  return options.map((option) => ({
    label: option.name,
    value: option.value || option.name,
  }));
}

function getSelectModelValue(field: AgentConstantField) {
  const value = constantsValues.value[field.name];
  if (typeof value === 'string') return value;
  const option = formatOptions(field.options).find(
    (option) => option.value === value,
  );
  return option?.value ?? '';
}

function isCheckboxChecked(fieldName: string, optionValue: string) {
  const value = constantsValues.value[fieldName];
  if (!Array.isArray(value)) return false;
  return value.includes(optionValue);
}

function toggleCheckboxValue(fieldName: string, optionValue: string) {
  const value = constantsValues.value[fieldName];
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
.modal-assign-agent__form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  width: 100%;
}
</style>
