<template>
  <UnnnicDialog
    data-testid="run-analysis-dialog"
    :open="open"
    lazyMount
    @update:open="open = false"
  >
    <UnnnicDialogContent>
      <UnnnicDialogHeader type="attention">
        <UnnnicDialogTitle>
          {{ $t('audit.improvements.run_analysis_dialog.title') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>
      <section class="run-analysis-dialog__content">
        <p>{{ dialogDescription }}</p>
      </section>
      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            :text="$t('audit.improvements.run_analysis_dialog.cancel')"
            type="tertiary"
          />
        </UnnnicDialogClose>
        <UnnnicButton
          :text="$t('audit.improvements.run_analysis_dialog.run')"
          type="attention"
          :loading="improvementsStore.analysis.status === 'loading'"
          @click="handleRunAnalysis"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { subDays } from 'date-fns';
import { storeToRefs } from 'pinia';

import { useImprovementsStore } from '@/store/Improvements';
import {
  formatMonthDayDate,
  getYesterdayFormattedDate,
} from '@/utils/formatters';

const open = defineModel<boolean>('open', {
  required: true,
});

const { t } = useI18n();
const improvementsStore = useImprovementsStore();
const { analysis, improvements } = storeToRefs(improvementsStore);

const handleRunAnalysis = () => {
  open.value = false;
  improvementsStore.runAnalysis();
};

const dialogDescription = computed(() => {
  const createdAt = analysis.value.task?.createdAt;
  const currentDate = createdAt
    ? formatMonthDayDate(subDays(new Date(createdAt), 1).toISOString())
    : '';

  return t('audit.improvements.run_analysis_dialog.description', {
    count: improvements.value.data.length,
    current_date: currentDate,
    new_date: getYesterdayFormattedDate(),
  });
});
</script>

<style scoped lang="scss">
.run-analysis-dialog {
  &__content {
    padding: $unnnic-space-6;
  }
}
</style>
