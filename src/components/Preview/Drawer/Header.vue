<template>
  <UnnnicDrawerHeader>
    <section
      data-testid="preview-drawer-header"
      class="preview-drawer__header"
    >
      <h2
        data-testid="preview-drawer-title"
        class="preview-drawer__title"
      >
        {{ $t('router.preview.test_your_agents') }}
      </h2>
      <ContentItemActions
        data-testid="preview-drawer-actions"
        :actions="previewHeaderActions"
        minWidth="175px"
      />

      <UnnnicSelect
        v-model:modelValue="managerSelectorStore.selectedPreviewManager"
        class="preview-drawer__manager-select"
        itemValue="id"
        :options="previewManagerOptions"
        size="sm"
        :optionsLines="2"
      />
    </section>
  </UnnnicDrawerHeader>
</template>

<script setup>
import { computed } from 'vue';

import { useFlowPreviewStore } from '@/store/FlowPreview';
import { useProjectStore } from '@/store/Project';
import { useManagerSelectorStore } from '@/store/ManagerSelector';
import { usePreviewStore } from '@/store/Preview';

import i18n from '@/utils/plugins/i18n';

import ContentItemActions from '@/components/ContentItemActions.vue';

const flowPreviewStore = useFlowPreviewStore();
const projectStore = useProjectStore();
const managerSelectorStore = useManagerSelectorStore();
const previewStore = usePreviewStore();

const previewHeaderActions = computed(() => [
  {
    scheme: 'gray-500',
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

const previewManagerOptions = computed(() => {
  const { new: newManager, legacy: legacyManager } =
    managerSelectorStore.options.managers;
  return [newManager, legacyManager];
});
</script>

<style lang="scss" scoped>
.preview-drawer__header {
  display: flex;
  gap: $unnnic-space-2;
  align-items: center;
}

.preview-drawer__title {
  color: $unnnic-color-fg-emphasized;
  font: $unnnic-font-display-2;
}

.preview-drawer__manager-select {
  margin-left: auto;
}
</style>
