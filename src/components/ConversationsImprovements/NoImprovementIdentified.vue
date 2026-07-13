<template>
  <section
    class="no-improvement-identified"
    data-testid="no-improvement-identified"
  >
    <hgroup class="no-improvement-identified__content">
      <h2
        class="no-improvement-identified__title"
        data-testid="no-improvement-identified-title"
      >
        {{ $t('audit.improvements.no_improvement_identified.title') }}
      </h2>
      <p
        class="no-improvement-identified__description"
        data-testid="no-improvement-identified-description"
      >
        {{
          $t('audit.improvements.no_improvement_identified.description', {
            date: analysisDate,
          })
        }}
      </p>
    </hgroup>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useImprovementsStore } from '@/store/Improvements';
import { formatMonthDayDate } from '@/utils/formatters';

const { analysis } = storeToRefs(useImprovementsStore());

const analysisDate = computed(() => {
  const createdAt = analysis.value.task?.createdAt;

  if (!createdAt) {
    return '';
  }

  return formatMonthDayDate(createdAt);
});
</script>

<style scoped lang="scss">
.no-improvement-identified {
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &__content {
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
