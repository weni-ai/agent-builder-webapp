<template>
  <button
    class="remove-product-button"
    data-testid="remove-product-button"
    @click.stop="$emit('click')"
  >
    <UnnnicIcon
      data-testid="remove-product-button-icon"
      icon="delete"
      scheme="neutral-cloudy"
      size="sm"
    />

    <UnnnicIntelligenceText
      data-testid="remove-product-button-text"
      color="neutral-cloudy"
      family="secondary"
      size="body-md"
    >
      {{ $t('router.preview.catalog.remove') }}
    </UnnnicIntelligenceText>
  </button>
</template>

<script setup>
defineEmits(['click']);
</script>

<style lang="scss" scoped>
.remove-product-button {
  padding: 0;
  background-color: transparent;
  border: none;

  grid-area: remove;

  display: flex;
  align-items: center;
  gap: $unnnic-spacing-nano;

  cursor: pointer;
}
</style>
