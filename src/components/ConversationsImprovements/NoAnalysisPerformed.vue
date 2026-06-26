<template>
  <section
    class="no-analysis-performed"
    data-testid="no-analysis-performed"
  >
    <header class="no-analysis-performed__header">
      <h2
        class="no-analysis-performed__title"
        data-testid="no-analysis-performed-title"
      >
        {{ $t('audit.improvements.no_analysis.title') }}
      </h2>
      <p
        class="no-analysis-performed__description"
        data-testid="no-analysis-performed-description"
      >
        {{ $t('audit.improvements.no_analysis.description') }}
      </p>
    </header>

    <RunAnalysisButton
      data-testid="no-analysis-performed-run-button"
      translationKey="audit.improvements.no_analysis.run_analysis"
    />
  </section>
</template>

<script setup lang="ts">
import RunAnalysisButton from '@/components/ConversationsImprovements/RunAnalysisButton.vue';
</script>

<style scoped lang="scss">
.no-analysis-performed {
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $unnnic-space-4;

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $unnnic-space-1;

    text-align: center;
  }

  &__title {
    font: $unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__description {
    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
