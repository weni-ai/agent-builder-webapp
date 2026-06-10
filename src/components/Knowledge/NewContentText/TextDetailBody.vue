<template>
  <textarea
    ref="textareaRef"
    :value="modelValue"
    class="text-detail-body"
    data-testid="text-detail-body-textarea"
    :placeholder="t('content_bases.new_text.write_or_paste_placeholder')"
    @input="onInput"
  />
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

const textareaRef = ref(null);

function onInput(event) {
  emit('update:modelValue', event.target.value);
}

onMounted(() => {
  if (!props.autofocus) return;

  nextTick(() => {
    textareaRef.value?.focus();
  });
});
</script>

<style lang="scss" scoped>
.text-detail-body {
  flex: 1;
  width: 100%;

  border: 1px solid $unnnic-color-border-base;
  border-radius: $unnnic-radius-2;
  padding: $unnnic-space-4;

  font: $unnnic-font-body;
  color: $unnnic-color-fg-emphasized;

  resize: none;

  ::placeholder {
    color: $unnnic-color-fg-muted;
  }

  &:focus {
    outline: 1px solid $unnnic-color-border-accent-strong;
  }
}
</style>
