<template>
  <UnnnicFormElement
    :label="$t('agent_builder.supervisor.filters.period.label')"
  >
    <UnnnicInputDatePicker
      v-model="dateFilter"
      position="right"
      class="supervisor-filter-date"
      :maxDate="today"
      data-testid="date-picker"
    />
  </UnnnicFormElement>
</template>

<script setup>
import { ref, watch } from 'vue';
import { format } from 'date-fns';

import { useSupervisorStore } from '@/store/Supervisor';

const supervisorStore = useSupervisorStore();

const today = format(new Date(), 'yyyy-MM-dd');
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
  width: 100%;

  :deep(.input) {
    width: 100%;
  }
}
</style>
