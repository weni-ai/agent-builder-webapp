<template>
  <section class="project-info">
    <h2 class="project-info__title">
      {{ title }}
    </h2>
    <p class="project-info__description">
      {{ description }}
    </p>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.project-info {
  display: flex;
  align-items: center;
  gap: $unnnic-spacing-nano;

  &__title {
    margin: 0;

    color: $unnnic-color-fg-emphasized;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-text-emphasis;
    line-height: $unnnic-line-height-emphasis;
  }

  &__description {
    color: $unnnic-color-fg-base;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-text-body;
    line-height: $unnnic-line-height-body;
  }
}
</style>
