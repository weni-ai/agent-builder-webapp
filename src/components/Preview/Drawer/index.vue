<template>
  <UnnnicDrawerNext
    v-model:open="drawerOpen"
    class="preview-drawer"
  >
    <UnnnicDrawerContent
      size="extra-large"
      :forceMount="forceMount"
      class="preview-drawer__panel"
    >
      <PreviewDrawerHeader />

      <section
        data-testid="preview-drawer-content"
        class="preview-drawer__content"
      >
        <section
          data-testid="preview-drawer-preview"
          class="content__preview"
        >
          <WebchatPreview />
        </section>

        <section
          data-testid="preview-drawer-details"
          class="content__details"
        >
          <PreviewDetails />
        </section>
      </section>
    </UnnnicDrawerContent>
  </UnnnicDrawerNext>
</template>

<script setup>
import { computed, watch } from 'vue';

import { usePreviewStore } from '@/store/Preview';

import WebchatPreview from '@/components/Preview/WebchatPreview.vue';
import PreviewDetails from '../PreviewDetails.vue';
import PreviewDrawerHeader from './Header.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  forceMount: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const previewStore = usePreviewStore();

const drawerOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

watch(
  () => drawerOpen.value,
  (isModalOpen) => {
    if (isModalOpen && !previewStore.ws) previewStore.connectWS();
  },
);
</script>

<style lang="scss">
.preview-drawer__panel[data-state='closed'] {
  animation-fill-mode: forwards;
  pointer-events: none;
}

.preview-drawer {
  &__content {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;

    overflow: hidden;
    border-radius: $unnnic-radius-4;

    .content__preview {
      overflow: hidden;

      display: flex;
      border-right: $unnnic-border-width-thinner solid
        $unnnic-color-neutral-soft;
    }

    .content__details {
      overflow: hidden;
    }
  }
}
</style>
