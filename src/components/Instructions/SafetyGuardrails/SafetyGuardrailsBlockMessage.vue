<template>
  <UnnnicTextArea
    class="safety-guardrails-block-message"
    data-testid="safety-guardrails-block-message"
    :modelValue="modelValue"
    :label="$t('agents.instructions.safety_guardrails.block_message.label')"
    :message="$t('agents.instructions.safety_guardrails.block_message.helper')"
    :maxLength="maxLength"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  maxLength: {
    type: Number,
    default: 250,
  },
});

defineEmits(['update:modelValue']);
</script>

<style lang="scss" scoped>
.safety-guardrails-block-message {
  width: 100%;
}
</style>
