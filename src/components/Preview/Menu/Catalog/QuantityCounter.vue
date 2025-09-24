<template>
  <section
    class="quantity-counter"
    data-testid="quantity-counter"
    @click.stop
  >
    <button
      class="quantity-counter__button"
      aria-label="Decrease quantity"
      data-testid="quantity-counter-decrement-button"
      @click.stop="$emit('decrement')"
    >
      <UnnnicIcon
        icon="check_indeterminate_small"
        scheme="neutral-cloudy"
        size="avatar-nano"
      />
    </button>

    <UnnnicIntelligenceText
      data-testid="quantity-counter-value"
      class="quantity-counter__value"
      color="neutral-dark"
      family="secondary"
      weight="bold"
      size="body-gt"
    >
      {{ quantity }}
    </UnnnicIntelligenceText>

    <button
      class="quantity-counter__button"
      data-testid="quantity-counter-increment-button"
      aria-label="Increase quantity"
      @click.stop="$emit('increment')"
    >
      <UnnnicIcon
        icon="add"
        scheme="neutral-cloudy"
        size="avatar-nano"
      />
    </button>
  </section>
</template>

<script setup>
const props = defineProps({
  quantity: {
    type: Number,
    required: true,
  },
});

defineEmits(['increment', 'decrement']);
</script>

<style lang="scss" scoped>
.quantity-counter {
  display: flex;
  gap: $unnnic-spacing-ant;
  align-items: center;

  &__button {
    background-color: transparent;
    border: none;
    padding: 0;
    display: flex;
    cursor: pointer;
  }

  &__value {
    user-select: none;
  }
}
</style>
