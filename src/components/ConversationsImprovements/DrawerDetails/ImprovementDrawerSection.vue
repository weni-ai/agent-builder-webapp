<template>
  <section
    class="improvement-drawer-section"
    :data-testid="`improvement-drawer-${testId}-section`"
  >
    <h2
      class="improvement-drawer-section__title"
      :data-testid="`improvement-drawer-${testId}-title`"
    >
      {{ title }}
    </h2>

    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  testId: string;
  title: string;
}>();
</script>

<style scoped lang="scss">
.improvement-drawer-section {
  @include unnnic-font-body;
  color: $unnnic-color-fg-base;

  &__title {
    @include unnnic-font-display-3;
    color: $unnnic-color-fg-emphasized;
    margin-bottom: $unnnic-space-2;
  }
}
</style>
