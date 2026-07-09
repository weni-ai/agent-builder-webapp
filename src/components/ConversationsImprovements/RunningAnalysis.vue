<template>
  <section
    class="running-analysis"
    data-testid="running-analysis"
  >
    <UnnnicIconLoading
      size="md"
      stroke-width="3"
      scheme="fg-muted"
    />
    <hgroup class="running-analysis__content">
      <h2
        class="running-analysis__title"
        data-testid="running-analysis-title"
      >
        {{
          $t('audit.improvements.running_analysis.title', {
            count: improvementsStore.analysis.task?.total ?? 0,
          })
        }}
      </h2>
      <p
        class="running-analysis__description"
        data-testid="running-analysis-description"
      >
        {{ $t('audit.improvements.running_analysis.description') }}
      </p>
    </hgroup>
  </section>
</template>

<script setup lang="ts">
import { useImprovementsStore } from '@/store/Improvements';

const improvementsStore = useImprovementsStore();
</script>

<style scoped lang="scss">
.running-analysis {
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $unnnic-space-4;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $unnnic-space-1;
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
