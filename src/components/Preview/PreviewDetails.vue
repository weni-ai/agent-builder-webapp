<template>
  <section
    data-testid="preview-details"
    class="preview-details"
  >
    <UnnnicTab
      data-testid="preview-details-tabs"
      class="preview-details__tabs"
      :activeTab="selectedTab"
      :tabs="detailTabs"
      @change="selectedTab = $event"
    >
      <template
        v-for="tab in detailTabs"
        :key="tab"
        #[`tab-head-${tab}`]
      >
        {{ $t(`router.preview.${tab}`) }}
      </template>
    </UnnnicTab>

    <section
      ref="contentRef"
      data-testid="preview-details-content"
      class="preview-details__content"
    >
      <section
        v-if="selectedTab === 'visual_flow'"
        data-testid="preview-details-visual-flow"
        class="details__visual-flow"
      >
        <PreviewVisualFlow />
      </section>

      <PreviewLogsSection
        v-else
        @scroll-to-bottom="scrollContentToBottom('near-bottom')"
      />
    </section>
  </section>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

import PreviewLogsSection from './PreviewLogsSection.vue';
import PreviewVisualFlow from './PreviewVisualFlow.vue';

const selectedTab = ref('visual_flow');
const detailTabs = ['visual_flow', 'logs'];

const contentRef = ref(null);

const scrollContentToBottom = (type = 'mount') => {
  const { scrollTop, clientHeight, scrollHeight } = contentRef.value;
  const scrollPosition = scrollTop + clientHeight;
  const isNearBottom = scrollHeight - scrollPosition <= 400;

  if (type === 'mount' || isNearBottom) {
    contentRef.value.scrollTo({
      top: scrollHeight,
      behavior: 'smooth',
    });
  }
};

watch(
  () => selectedTab.value,
  () => nextTick(() => scrollContentToBottom('mount')),
);
</script>

<style lang="scss" scoped>
.preview-details {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__tabs {
    padding: $unnnic-spacing-sm $unnnic-spacing-md 0;
  }

  &__content {
    overflow: hidden auto;

    padding: 0 $unnnic-spacing-md;

    height: 100%;
  }
}
</style>
