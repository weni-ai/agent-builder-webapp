<template>
  <header
    class="conversations-improvements-header"
    data-testid="conversations-improvements-header"
  >
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
import { isToday } from 'date-fns';
import { storeToRefs } from 'pinia';

import { useImprovementsStore } from '@/store/Improvements';
import {
  formatMonthDayDate,
  formatTime,
  getYesterdayFormattedDate,
} from '@/utils/formatters';
import RunAnalysisButton from '@/components/ConversationsImprovements/RunAnalysisButton.vue';
import CustomAnalysisModal from '@/components/ConversationsImprovements/CustomAnalysisModal/CustomAnalysisModal.vue';

const { t } = useI18n();
const isCustomAnalysisModalOpen = ref(false);
const improvementsStore = useImprovementsStore();
const { analysis, improvements } = storeToRefs(improvementsStore);

const headerTitle = computed(() =>
  t('audit.improvements.header.title', {
    date: getYesterdayFormattedDate(),
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
  gap: $unnnic-space-4;

  width: 100%;

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
