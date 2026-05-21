<template>
  <section class="system-badge">
    <img
      v-if="icon"
      :src="icon"
      :alt="name"
      class="system-badge__icon"
      data-testid="system-badge-icon"
    />

    <p
      class="system-badge__title"
      tag="p"
      data-testid="system-badge-name"
    >
      {{ name }}
    </p>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import useAgentSystems from '@/composables/useAgentSystems';

const props = defineProps({
  system: {
    type: String,
    required: true,
  },
});

const { getSystemObject } = useAgentSystems();

const systemInfo = computed(() => getSystemObject(props.system));

const name = computed(() => systemInfo.value?.name || props.system);
const icon = computed(() => systemInfo.value?.icon || '');
</script>

<style lang="scss" scoped>
.system-badge {
  border-radius: $unnnic-radius-2;
  background-color: $unnnic-color-bg-soft;

  padding: $unnnic-space-2 $unnnic-space-4;

  display: flex;
  align-items: center;
  gap: $unnnic-space-2;

  &__icon {
    width: $unnnic-icon-size-4;
    height: $unnnic-icon-size-4;
  }

  &__title {
    white-space: nowrap;
    color: $unnnic-color-fg-base;
    font: $unnnic-font-emphasis;
  }
}
</style>
