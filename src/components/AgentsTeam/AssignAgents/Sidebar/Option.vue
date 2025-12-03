<template>
  <button
    class="assign-agents-sidebar__option"
    :class="{
      'assign-agents-sidebar__option--active': isActive,
    }"
    data-testid="sidebar-option"
  >
    <img
      v-if="icon"
      :src="icon"
      :alt="name"
      class="assign-agents-sidebar__option-icon"
    />
    <p>{{ name }}</p>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  isActive: boolean;
  name: string;
  icon?: string;
}>();
</script>

<style scoped lang="scss">
.assign-agents-sidebar__option {
  border: none;

  border-radius: $unnnic-radius-2;
  padding: $unnnic-space-3 $unnnic-space-3;

  display: flex;
  align-items: center;
  gap: $unnnic-space-2;

  width: 100%;

  color: $unnnic-color-fg-base;
  font: $unnnic-font-emphasis;

  cursor: pointer;

  &--active {
    background: $unnnic-color-bg-soft;
    color: $unnnic-color-fg-base;
    font: $unnnic-font-action;
  }

  &-icon {
    width: $unnnic-icon-size-4;
    height: $unnnic-icon-size-4;
  }
}
</style>
