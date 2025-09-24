<template>
  <section
    class="list-message"
    data-testid="list-message"
  >
    <UnnnicButton
      type="secondary"
      size="large"
      iconLeft="list"
      :text="message.list_message.button_text"
      class="list-message__button"
      data-testid="list-button"
      @click="emit('open-preview-menu')"
    />
  </section>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  message: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['open-preview-menu']);
</script>

<style lang="scss" scoped>
.list-message {
  margin-top: $unnnic-spacing-ant;

  display: grid;
}
</style>
