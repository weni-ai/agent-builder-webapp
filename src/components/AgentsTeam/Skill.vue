<template>
  <section class="skill">
    <img
      v-if="icon"
      :src="icon"
      :alt="title"
      class="skill__icon"
      data-testid="skill-icon"
    />

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
    type: Object,
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
    width: $unnnic-icon-size-4;
    height: $unnnic-icon-size-4;
  }

  &__title {
    white-space: nowrap;
    color: $unnnic-color-fg-base;
    font: $unnnic-font-emphasis;
  }
}
</style>
