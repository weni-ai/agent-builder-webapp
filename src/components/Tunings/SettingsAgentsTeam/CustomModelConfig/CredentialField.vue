<template>
  <UnnnicTextArea
    v-if="credential.type === 'TEXTAREA'"
    :modelValue="credential.value"
    :label="credential.label"
    :placeholder="credential.label"
    :data-testid="`credential-field-textarea-${credential.id}`"
    @update:model-value="$emit('update:value', credential.id, $event)"
  />

  <UnnnicInput
    v-else
    :modelValue="credential.value"
    :nativeType="credential.type === 'PASSWORD' ? 'password' : 'text'"
    :placeholder="credential.label"
    :label="credential.label"
    :data-testid="`credential-field-input-${credential.id}`"
    @update:model-value="$emit('update:value', credential.id, $event)"
  />
</template>

<script setup>
defineProps({
  credential: {
    type: Object,
    required: true,
  },
});

defineEmits(['update:value']);
</script>
