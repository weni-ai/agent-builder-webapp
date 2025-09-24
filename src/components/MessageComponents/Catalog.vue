<template>
  <section
    class="catalog"
    data-testid="catalog"
  >
    <UnnnicButton
      type="secondary"
      size="large"
      :text="message.catalog_message.action_button_text"
      class="catalog__button"
      data-testid="catalog-button"
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
.catalog {
  margin-top: $unnnic-spacing-ant;

  display: grid;
}
</style>
