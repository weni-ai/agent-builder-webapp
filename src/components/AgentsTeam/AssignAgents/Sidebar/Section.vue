<template>
  <section
    class="assign-agents-sidebar__section"
    data-testid="assign-agents-sidebar-section"
  >
    <p
      class="assign-agents-sidebar__section-title"
      data-testid="assign-agents-sidebar-section-title"
    >
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
  gap: $unnnic-space-05;

  &-title {
    color: $unnnic-color-fg-muted;
    font: $unnnic-font-caption-2;
    margin-left: $unnnic-space-3;
    margin-bottom: calc($unnnic-space-2 - $unnnic-space-05);
  }
}
</style>
