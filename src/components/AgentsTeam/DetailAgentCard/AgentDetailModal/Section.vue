<template>
  <section
    class="agent-detail-modal__section"
    data-testid="agent-detail-section"
  >
    <h3
      class="agent-detail-modal__section-title"
      data-testid="agent-detail-section-title"
    >
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="agent-detail-modal__section-description"
      data-testid="agent-detail-section-description"
    >
      {{ description }}
    </p>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<style scoped lang="scss">
.agent-detail-modal__section {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;

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
