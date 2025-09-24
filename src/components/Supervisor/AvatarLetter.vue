<template>
  <section class="avatar-letter">
    <p class="avatar-letter__text">{{ displayText }}</p>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  fallback: {
    type: String,
    default: '-',
  },
});

const displayText = computed(() => {
  return props.text?.[0] || props.fallback;
});
</script>

<style lang="scss" scoped>
.avatar-letter {
  $size: 35px;

  min-width: $size;
  min-height: $size;
  max-width: $size;
  max-height: $size;

  border-radius: 50%;
  background-color: $unnnic-color-weni-100;

  display: flex;
  align-items: center;
  justify-content: center;

  &__text {
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-weni-600;
  }
}
</style>
