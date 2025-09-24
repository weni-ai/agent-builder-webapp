<template>
  <UnnnicIntelligenceText
    data-testid="supervisor-username"
    class="supervisor-username"
    tag="h3"
    color="neutral-darkest"
    family="secondary"
    :size="size"
    weight="bold"
  >
    {{ displayName }}
  </UnnnicIntelligenceText>
</template>

<script setup>
import { computed } from 'vue';

import i18n from '@/utils/plugins/i18n';

const props = defineProps({
  username: {
    type: String,
    default: '',
  },
  fallbackKey: {
    type: String,
    default: 'agent_builder.supervisor.unnamed_contact',
  },
  size: {
    type: String,
    default: 'body-gt',
  },
});

const displayName = computed(() => {
  return props.username || `[${i18n.global.t(props.fallbackKey)}]`;
});
</script>

<style scoped lang="scss">
.supervisor-username {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
