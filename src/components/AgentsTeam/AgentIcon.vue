<template>
  <img
    v-if="icon && agentIcon"
    :src="agentIcon"
    class="content__icon"
    data-testid="agent-icon"
  />
</template>

<script setup>
import { computed } from 'vue';
import { agentIcons } from '@/utils/agentIconService';

const props = defineProps({
  icon: {
    type: String,
    default: '',
  },
});

const agentIcon = computed(() => {
  if (!props.icon) return;

  return agentIcons[props.icon] || null;
});
</script>

<style lang="scss" scoped>
.content__icon {
  $paddingValue: $unnnic-space-1;
  padding: $paddingValue;

  overflow: visible;
  border-radius: $unnnic-radius-full;

  width: calc($unnnic-icon-size-10 + $paddingValue * 2);
  height: auto;
  aspect-ratio: 1/1;

  pointer-events: none;
}
</style>
