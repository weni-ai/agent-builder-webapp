<template>
  <UnnnicDrawer
    data-testid="preview-drawer"
    :modelValue="modelValue"
    :title="$t('router.preview.agents_preview')"
    class="preview-drawer"
    size="xl"
    @close="$emit('update:modelValue', false)"
  >
    <template #title>
      <section
        data-testid="preview-drawer-header"
        class="preview-drawer__header"
      >
        <UnnnicIntelligenceText
          data-testid="preview-drawer-title"
          tag="h2"
          family="secondary"
          size="title-sm"
          weight="bold"
          color="neutral-darkest"
        >
          {{ $t('router.preview.agents_preview') }}
        </UnnnicIntelligenceText>
        <ContentItemActions
          data-testid="preview-drawer-actions"
          :actions="previewHeaderActions"
          minWidth="175px"
        />
      </section>
    </template>
    <template #content>
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
    </template>
  </UnnnicDrawer>
</template>

<script setup>
import { computed, watch } from 'vue';

import { usePreviewStore } from '@/store/Preview';
import { useFlowPreviewStore } from '@/store/FlowPreview';
import { useProjectStore } from '@/store/Project';

import Preview from '@/components/Preview/Preview.vue';
import PreviewDetails from './PreviewDetails.vue';
import ContentItemActions from '@/components/ContentItemActions.vue';
import i18n from '@/utils/plugins/i18n';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['update:modelValue']);

const previewStore = usePreviewStore();
const flowPreviewStore = useFlowPreviewStore();
const projectStore = useProjectStore();
watch(
  () => props.modelValue,
  (isModalOpen) => {
    if (isModalOpen && !previewStore.ws) previewStore.connectWS();
  },
);

const previewHeaderActions = computed(() => [
  {
    scheme: 'neutral-dark',
    icon: 'refresh',
    text: i18n.global.t('router.preview.options.refresh'),
    onClick: refreshPreview,
  },
]);

function refreshPreview() {
  previewStore.clearLogs();
  flowPreviewStore.clearMessages();
  flowPreviewStore.previewInit({
    contentBaseUuid: projectStore.details.contentBaseUuid,
  });
}
</script>

<style lang="scss">
.preview-drawer {
  &.unnnic-drawer__container .unnnic-drawer__content {
    padding: 0;
  }
}
</style>

<style lang="scss" scoped>
.preview-drawer {
  &__header {
    display: flex;
    gap: $unnnic-spacing-xs;
    align-items: center;
  }

  &__content {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;

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
