<template>
  <section class="skill">
    <p
      class="skill__icon"
      data-testid="skill-icon"
    >
      {{ icon }}
    </p>

    <UnnnicIntelligenceText
      class="skill__title"
      tag="p"
      family="secondary"
      size="body-md"
      color="neutral-cloudy"
      data-testid="skill-name"
    >
      {{ title }}
    </UnnnicIntelligenceText>
  </section>
</template>

<script setup>
const props = defineProps({
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
  border-radius: $unnnic-border-radius-sm;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

  padding: $unnnic-spacing-nano $unnnic-spacing-xs;

  display: flex;
  align-items: center;
  gap: $unnnic-spacing-nano;

  &__icon {
    font-size: $unnnic-icon-size-xs;
    line-height: 0;
  }

  &__title {
    white-space: nowrap;
  }
}
</style>
