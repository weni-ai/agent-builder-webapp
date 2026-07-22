<template>
  <UnnnicFormElement
    :label="$t('audit.conversations.filters.period.label')"
    class="supervisor-filter-date"
  >
    <UnnnicInputDatePicker
      v-model="dateFilter"
      position="right"
      class="supervisor-filter-date__picker"
      :minDate="minDate"
      :maxDate="today"
      :options="datePickerOptions"
      data-testid="date-picker"
    >
      <template #footer>
        <UnnnicDisclaimer
          type="neutral"
          :description="$t('audit.conversations.filters.period.disclaimer')"
          data-testid="date-filter-disclaimer"
        />
      </template>
    </UnnnicInputDatePicker>
  </UnnnicFormElement>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { format, subDays } from 'date-fns';

import i18n from '@/utils/plugins/i18n';
import { useSupervisorStore } from '@/store/Supervisor';

const ARCHIVE_RETENTION_DAYS = 90;

const supervisorStore = useSupervisorStore();

const today = format(new Date(), 'yyyy-MM-dd');
const minDate = format(
  subDays(new Date(), ARCHIVE_RETENTION_DAYS - 1),
  'yyyy-MM-dd',
);

const getPeriodOptionTranslation = (option) =>
  i18n.global.t(`audit.conversations.filters.period.options.${option}`);

const datePickerOptions = computed(() => [
  { name: getPeriodOptionTranslation('last_7_days'), id: 'last-7-days' },
  { name: getPeriodOptionTranslation('last_14_days'), id: 'last-14-days' },
  { name: getPeriodOptionTranslation('last_30_days'), id: 'last-30-days' },
  { name: getPeriodOptionTranslation('last_90_days'), id: 'last-90-days' },
  { name: getPeriodOptionTranslation('current_month'), id: 'current-month' },
  { name: getPeriodOptionTranslation('custom'), id: 'custom' },
]);

const dateFilter = ref({
  start: supervisorStore.temporaryFilters.start,
  end: supervisorStore.temporaryFilters.end,
});

watch(
  () => dateFilter.value,
  () => {
    supervisorStore.temporaryFilters.start = dateFilter.value.start;
    supervisorStore.temporaryFilters.end = dateFilter.value.end;
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.supervisor-filter-date {
  &__picker {
    width: 100%;

    :deep(.input) {
      width: 100%;
    }
  }
}
</style>
