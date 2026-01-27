<template>
  <UnnnicDrawerNext
    v-model:open="drawerOpen"
    class="preview-drawer"
  >
    <UnnnicDrawerContent size="extra-large">
      <PreviewDrawerHeader />

      <section
        data-testid="preview-drawer-content"
        class="preview-drawer__content"
      >
        <section
          data-testid="preview-drawer-preview"
          class="content__preview"
        >
          <Preview />
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

import Preview from '@/components/Preview/Preview.vue';
import PreviewDetails from '../PreviewDetails.vue';
import PreviewDrawerHeader from './Header.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
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
.preview-drawer {
  &__content {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;

    overflow: hidden;

    .content__preview {
      overflow: hidden;

      display: flex;
      border-right: $unnnic-border-width-thinner solid
        $unnnic-color-neutral-soft;

      :deep(.preview) {
        padding: $unnnic-spacing-sm $unnnic-spacing-md;
        gap: $unnnic-spacing-xs;

        .preview__messages {
          padding: 0;

          margin-right: -$unnnic-spacing-ant;
          padding-right: $unnnic-spacing-ant;
        }

        .preview__footer {
          padding: 0;
        }
      }
    }

    .content__details {
      overflow: hidden;
    }
  }
}
</style>
