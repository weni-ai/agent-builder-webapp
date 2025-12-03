<template>
  <section class="assign-agents-sidebar__section">
    <p class="assign-agents-sidebar__section-title">
      {{ title }}
    </p>

    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<style scoped lang="scss">
.assign-agents-sidebar__section {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;

  &-title {
    color: $unnnic-color-fg-muted;
    font: $unnnic-font-caption-2;
    margin-left: $unnnic-space-3;
  }
}
</style>
