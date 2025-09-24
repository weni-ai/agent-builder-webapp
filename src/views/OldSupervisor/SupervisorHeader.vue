<template>
  <AgentBuilderHeader :withDivider="false">
    <template #actions>
      <section class="supervisor-header__actions">
        <UnnnicInputDatePicker
          v-model="dateFilter"
          position="right"
          class="supervisor-header__date-picker"
          :maxDate="today"
          data-testid="date-picker"
        />

        <UnnnicButton
          v-if="showExport"
          iconCenter="open_in_new"
          type="secondary"
          data-testid="export-button"
          @click="openExportModal"
        />
      </section>

      <SupervisorExportModal
        v-if="showExport"
        v-model="isExportModalOpen"
        data-testid="export-modal"
      />
    </template>
  </AgentBuilderHeader>
</template>

<script setup>
import AgentBuilderHeader from '@/components/Header.vue';
import SupervisorExportModal from '@/components/Supervisor/SupervisorExportModal.vue';

import { useOldSupervisorStore } from '@/store/OldSupervisor';
import { useFeatureFlagsStore } from '@/store/FeatureFlags';

import { format } from 'date-fns';
import { computed, ref, watch } from 'vue';

const supervisorStore = useOldSupervisorStore();
const featureFlagsStore = useFeatureFlagsStore();

const showExport = computed(() => featureFlagsStore.flags.supervisorExport);

const today = format(new Date(), 'yyyy-MM-dd');

const dateFilter = ref({
  start: supervisorStore.filters.start,
  end: supervisorStore.filters.end,
});

watch(
  () => dateFilter.value,
  () => {
    supervisorStore.filters.start = dateFilter.value.start;
    supervisorStore.filters.end = dateFilter.value.end;
  },
  { immediate: true },
);

const isExportModalOpen = ref(false);

function openExportModal() {
  isExportModalOpen.value = true;
}
</script>

<style lang="scss" scoped>
.supervisor-header {
  &__actions {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-xs;
    justify-content: flex-end;
  }

  &__date-picker {
    :deep(.input) {
      width: 100%;
    }
  }
}
</style>
