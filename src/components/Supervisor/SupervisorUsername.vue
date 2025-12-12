<template>
  <h3
    data-testid="supervisor-username"
    class="supervisor-username"
    :class="`supervisor-username--${font}`"
  >
    {{ displayName }}
  </h3>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import i18n from '@/utils/plugins/i18n';

const props = withDefaults(
  defineProps<{
    username?: string;
    fallbackKey?: string;
    font?: 'action' | 'display-2';
  }>(),
  {
    username: '',
    fallbackKey: 'agent_builder.supervisor.unnamed_contact',
    font: 'action',
  },
);

const displayName = computed(() => {
  return props.username || `[${i18n.global.t(props.fallbackKey)}]`;
});
</script>

<style scoped lang="scss">
.supervisor-username {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: $unnnic-color-fg-emphasized;

  &--action {
    font: $unnnic-font-action;
  }

  &--display-2 {
    font: $unnnic-font-display-2;
  }
}
</style>
