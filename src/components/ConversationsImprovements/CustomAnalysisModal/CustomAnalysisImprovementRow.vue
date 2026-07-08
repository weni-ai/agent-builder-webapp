<template>
  <article
    class="custom-analysis-improvement-row"
    data-testid="custom-analysis-improvement-row"
  >
    <section class="custom-analysis-improvement-row__content">
      <h4
        class="custom-analysis-improvement-row__title"
        data-testid="custom-analysis-improvement-row-title"
      >
        {{ customAnalysis.title }}
      </h4>
      <p
        class="custom-analysis-improvement-row__subtitle"
        data-testid="custom-analysis-improvement-row-subtitle"
      >
        {{ affectedConversationsLabel }}
      </p>
    </section>

    <UnnnicButton
      class="custom-analysis-improvement-row__delete-button"
      type="tertiary"
      size="small"
      iconCenter="delete"
      data-testid="custom-analysis-improvement-row-delete"
      @click="emit('delete', customAnalysis.uuid)"
    />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CustomAnalysisImprovement } from '@/store/types/CustomAnalysisImprovements.types';

const props = defineProps<{
  customAnalysis: CustomAnalysisImprovement;
}>();

const emit = defineEmits<{
  delete: [customAnalysisUuid: string];
}>();

const { t } = useI18n();

const affectedConversationsLabel = computed(() => {
  const { conversationsCount } = props.customAnalysis;

  if (conversationsCount === 0) {
    return t(
      'audit.improvements.custom_analysis_modal.no_affected_conversations',
    );
  }

  return t('audit.improvements.custom_analysis_modal.affected_conversations', {
    count: conversationsCount,
  });
});
</script>

<style scoped lang="scss">
.custom-analysis-improvement-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $unnnic-space-4;

  padding: $unnnic-space-4 0;

  border-bottom: 1px solid $unnnic-color-border-base;

  &__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &__title {
    font: $unnnic-font-emphasis;
    color: $unnnic-color-fg-emphasized;
    word-break: break-word;
  }

  &__subtitle {
    font: $unnnic-font-caption-2;
    color: $unnnic-color-fg-muted;
  }

  &__delete-button {
    :deep(.unnnic-icon) {
      font-size: $unnnic-icon-size-6;
    }
  }
}
</style>
