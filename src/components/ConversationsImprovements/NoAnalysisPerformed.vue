<template>
  <section class="conversations-improvements__no-analysis-performed">
    <header class="no-analysis-performed__header">
      <h2 class="no-analysis-performed__title">
        {{ $t('audit.improvements.no_analysis.title') }}
      </h2>
      <p class="no-analysis-performed__description">
        {{ $t('audit.improvements.no_analysis.description') }}
      </p>
    </header>

    <UnnnicButton
      type="primary"
      :text="$t('audit.improvements.no_analysis.run_analysis')"
      @click="improvementsStore.runAnalysis"
    />
  </section>
</template>

<script setup lang="ts">
import { useImprovementsStore } from '@/store/Improvements';

const improvementsStore = useImprovementsStore();
</script>

<style scoped lang="scss">
.conversations-improvements__no-analysis-performed {
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $unnnic-space-4;
}

.no-analysis-performed {
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
