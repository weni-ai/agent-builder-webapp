<template>
  <UnnnicModalDialog
    class="preview-logs-details__modal"
    data-testid="preview-logs-details-modal"
    :modelValue="modelValue"
    showCloseIcon
    size="md"
    :title="title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <section class="preview-logs-details">
      <UnnnicIntelligenceText
        class="preview-logs-details__trace"
        data-testid="preview-logs-details-trace"
        tag="p"
        color="neutral-dark"
        family="secondary"
        size="body-gt"
      >
        {{ prettyPrintJSON(log?.data) }}
      </UnnnicIntelligenceText>
    </section>
  </UnnnicModalDialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  log: {
    type: Object,
    required: true,
  },
});

defineEmits(['update:modelValue']);

function prettyPrintJSON(json) {
  if (!json) return '';
  const jsonString = JSON.stringify(json, null, '\t');
  return jsonString;
}
</script>

<style lang="scss" scoped>
.preview-logs-details__modal {
  :deep(.unnnic-modal-dialog__container__body) {
    overflow: hidden;
  }
}

.preview-logs-details {
  border-radius: $unnnic-border-radius-sm;
  background-color: $unnnic-color-neutral-lightest;

  padding: $unnnic-spacing-sm;

  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__trace {
    white-space: pre-wrap;
    overflow-wrap: break-word;
  }
}
</style>
