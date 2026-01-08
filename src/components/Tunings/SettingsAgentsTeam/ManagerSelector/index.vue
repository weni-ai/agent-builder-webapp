<template>
  <section class="manager-selector">
    <h2
      class="manager-selector__title"
      data-testid="manager-selector-title"
    >
      {{ $t('agent_builder.tunings.manager.title') }}
    </h2>
  </section>
</template>

<script setup></script>

<style lang="scss" scoped>
.manager-selector {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  &__title {
    font: $unnnic-font-display-3;
    color: $unnnic-color-neutral-darkest;
  }
}
</style>
