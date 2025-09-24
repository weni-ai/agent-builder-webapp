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
