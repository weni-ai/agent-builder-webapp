<!-- 
 This temporary component should be replaced by Unnnic system's Toast as soon as
 it is in a stable version and includes the static variation.
 -->
<template>
  <section :class="[`temp-toast temp-toast--${type}`]">
    <UnnnicIcon
      :icon="type === 'warning' ? 'error' : 'check_circle'"
      :scheme="type === 'warning' ? 'yellow-500' : 'green-500'"
      size="ant"
    />
    <h3 class="temp-toast__title">
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="temp-toast__description"
    >
      {{ description }}
    </p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  type: 'warning' | 'success';
  title: string;
  description?: string;
}>();
</script>

<style lang="scss" scoped>
.temp-toast {
  border-radius: $unnnic-radius-2;

  padding: $unnnic-space-4;

  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: $unnnic-space-2;

  &--warning {
    border: 1px solid $unnnic-color-border-warning;
    background-color: $unnnic-color-bg-warning;
  }

  &--success {
    border: 1px solid $unnnic-color-border-success;
    background-color: $unnnic-color-bg-success;
  }

  &__title {
    font: $unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__description {
    grid-column: 2 / 3;

    font: $unnnic-font-caption-2;
    color: $unnnic-color-fg-emphasized;
  }
}
</style>
