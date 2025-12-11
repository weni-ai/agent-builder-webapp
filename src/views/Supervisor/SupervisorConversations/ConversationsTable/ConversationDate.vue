<template>
  <p
    class="conversation-date"
    data-testid="conversation-date"
  >
    {{ formatTimestamp(date) }}
  </p>
</template>

<script setup lang="ts">
import { formatTimestamp } from '@/utils/formatters';

defineProps<{
  date: string;
}>();
</script>

<style scoped lang="scss">
.conversation-date {
  font: $unnnic-font-body;
  color: $unnnic-color-fg-base;
}
</style>
