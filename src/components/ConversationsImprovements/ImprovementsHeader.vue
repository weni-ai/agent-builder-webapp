<template>
  <header
    class="conversations-improvements-header"
    data-testid="conversations-improvements-header"
  >
    <UnnnicDisclaimer
      v-if="isStaleAnalysis"
      class="conversations-improvements-header__stale-disclaimer"
      data-testid="stale-analysis-disclaimer"
      type="informational"
      :title="
        $t('audit.improvements.stale_analysis_disclaimer.title', {
          days: analysisDaysAgo,
        })
      "
      :description="
        $t('audit.improvements.stale_analysis_disclaimer.description')
      "
    />

    <hgroup class="conversations-improvements-header__content">
      <h2
        class="conversations-improvements-header__title"
        data-testid="conversations-improvements-header-title"
      >
        {{ headerTitle }}
      </h2>
      <p
        v-if="headerDescription"
        class="conversations-improvements-header__description"
        data-testid="conversations-improvements-header-description"
      >
        {{ headerDescription }}
      </p>
    </hgroup>

    <UnnnicButton
      type="secondary"
      :text="$t('audit.improvements.header.custom_analysis')"
      @click="openCustomAnalysisModal"
    />
    <RunAnalysisButton
      data-testid="conversations-improvements-header-run-button"
    />

    <CustomAnalysisModal v-model:open="isCustomAnalysisModalOpen" />
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { differenceInDays, isToday, subDays } from 'date-fns';
import { storeToRefs } from 'pinia';

import { useImprovementsStore } from '@/store/Improvements';
import { formatMonthDayDate, formatTime } from '@/utils/formatters';
import RunAnalysisButton from '@/components/ConversationsImprovements/RunAnalysisButton.vue';
import CustomAnalysisModal from '@/components/ConversationsImprovements/CustomAnalysisModal/CustomAnalysisModal.vue';

const STALE_ANALYSIS_DAYS_THRESHOLD = 5;

const { t } = useI18n();
const isCustomAnalysisModalOpen = ref(false);
const improvementsStore = useImprovementsStore();
const { analysis, improvements } = storeToRefs(improvementsStore);

const analysisDaysAgo = computed(() => {
  const createdAt = analysis.value.task?.createdAt;

  if (!createdAt) {
    return 0;
  }

  return differenceInDays(new Date(), new Date(createdAt));
});

const isStaleAnalysis = computed(
  () => analysisDaysAgo.value >= STALE_ANALYSIS_DAYS_THRESHOLD,
);

const conversationsDate = computed(() => {
  const createdAt = analysis.value.task?.createdAt;

  if (!createdAt) {
    return '';
  }

  return formatMonthDayDate(subDays(new Date(createdAt), 1).toISOString());
});

const headerTitle = computed(() =>
  t('audit.improvements.header.title', {
    date: conversationsDate.value,
    count: improvements.value.data.length,
  }),
);

const headerDescription = computed(() => {
  const createdAt = analysis.value.task?.createdAt;

  if (!createdAt) {
    return '';
  }

  const time = formatTime(createdAt);

  if (isToday(new Date(createdAt))) {
    return t('audit.improvements.header.description_today', { time });
  }

  return t('audit.improvements.header.description', {
    date: formatMonthDayDate(createdAt),
    time,
  });
});

const openCustomAnalysisModal = () => {
  isCustomAnalysisModalOpen.value = true;
};
</script>

<style scoped lang="scss">
.conversations-improvements-header {
  display: grid;
  grid-template-columns: 1fr auto auto;
  column-gap: $unnnic-space-4;
  row-gap: $unnnic-space-6;

  width: 100%;

  &__stale-disclaimer {
    grid-column: 1 / -1;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &__title {
    font: $unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__description {
    font: $unnnic-font-caption-2;
    color: $unnnic-color-fg-muted;
  }
}
</style>
