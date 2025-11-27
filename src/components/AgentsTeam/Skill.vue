<template>
  <section class="skill">
    <p
      v-if="icon"
      class="skill__icon"
      data-testid="skill-icon"
    >
      {{ icon }}
    </p>

    <p
      class="skill__title"
      tag="p"
      data-testid="skill-name"
    >
      {{ title }}
    </p>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.skill {
  border-radius: $unnnic-radius-2;
  background-color: $unnnic-color-bg-soft;

  padding: $unnnic-space-2 $unnnic-space-4;

  display: flex;
  align-items: center;
  gap: $unnnic-space-2;

  &__icon {
    font-size: $unnnic-icon-size-xs;
    line-height: 0;
  }

  &__title {
    white-space: nowrap;
    color: $unnnic-color-fg-base;
    font: $unnnic-font-emphasis;
  }
}
</style>
