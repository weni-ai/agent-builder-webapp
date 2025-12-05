<template>
  <UnnnicPopover
    v-model:open="isActivatedByClick"
    class="content-item-actions"
  >
    <UnnnicPopoverTrigger class="content-item-actions__trigger">
      <UnnnicIcon
        :icon="triggerIcon"
        :scheme="isActivatedByClick ? 'neutral-darkest' : 'neutral-cloudy'"
        :size="triggerSize"
        class="button-menu"
        v-bind="$attrs"
      />
    </UnnnicPopoverTrigger>

    <UnnnicPopoverContent
      :align="align"
      :side="side"
      size="small"
    >
      <UnnnicPopoverOption
        v-for="(action, index) in actions"
        :key="index"
        :data-test="action.text"
        :label="action.text"
        :scheme="action.scheme"
        :icon="action?.icon"
        @click="onClick(action)"
      />
    </UnnnicPopoverContent>
  </UnnnicPopover>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  actions: {
    type: Array,
    default: () => [],
  },

  triggerIcon: {
    type: String,
    default: 'more_vert',
  },
  triggerSize: {
    type: String,
    default: 'avatar-nano',
  },

  align: {
    type: String,
    default: 'end',
  },
  side: {
    type: String,
    default: 'bottom',
  },

  minWidth: {
    type: String,
    default: '170px',
  },
});

const isActivatedByClick = ref(false);

function onClick(action) {
  isActivatedByClick.value = false;
  action.onClick();
}
</script>

<style lang="scss" scoped>
.content-item-actions__trigger {
  display: flex;
}
</style>
