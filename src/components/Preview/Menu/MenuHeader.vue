<template>
  <header class="menu-header">
    <UnnnicIntelligenceText
      data-testid="menu-title"
      color="weni-600"
      family="secondary"
      weight="bold"
      size="body-lg"
    >
      {{ title }}
    </UnnnicIntelligenceText>

    <button
      class="menu-header__close-button"
      data-testid="menu-close-button"
      aria-label="Close menu"
      @click="$emit('close')"
    >
      <UnnnicIcon
        icon="close"
        scheme="weni-600"
        size="avatar-nano"
      />
    </button>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
});

defineEmits(['close']);
</script>

<style lang="scss" scoped>
.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: $unnnic-color-weni-100;
  padding: $unnnic-spacing-sm $unnnic-spacing-md;

  &__close-button {
    display: flex;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }
}
</style>
