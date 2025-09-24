<template>
  <section
    data-testid="preview-details-logs"
    class="preview-logs-section"
  >
    <PreviewLogsFilters
      data-testid="preview-logs-filters"
      :logs="logs"
      @filters-changed="handleFiltersChanged"
    />

    <p
      v-if="
        filteredLogs.length === 0 &&
        (searchTerm.trim() || selectedCategories.length > 0)
      "
      class="preview-logs-section__empty"
      data-testid="preview-logs-section-empty"
    >
      {{ $t('agent_builder.traces.filter_logs.no_logs_found') }}
    </p>
    <PreviewLogs
      v-else
      data-testid="preview-logs"
      :logs="filteredLogs"
      @scroll-to-bottom="$emit('scroll-to-bottom')"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';

import PreviewLogs from '@/components/Preview/PreviewLogs.vue';
import PreviewLogsFilters from '@/components/Preview/PreviewLogsFilters.vue';
import { usePreviewStore } from '@/store/Preview';

const previewStore = usePreviewStore();
const logs = computed(() => previewStore.collaboratorsLogs);

const emit = defineEmits(['scroll-to-bottom']);

const searchTerm = ref('');
const selectedCategories = ref([]);
const filteredLogs = ref([]);

function handleFiltersChanged(filters) {
  searchTerm.value = filters.searchTerm;
  selectedCategories.value = filters.selectedCategories;
  filterLogs();
}

function filterLogs() {
  let filtered = logs.value;

  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter((log) =>
      selectedCategories.value.includes(log.config.category),
    );
  }

  if (searchTerm.value.trim()) {
    const searchTermLower = searchTerm.value.toLowerCase().trim();

    filtered = filtered.filter((log) => {
      const logDataString = JSON.stringify(log.data).toLowerCase();
      const logSummary = log.config.summary.toLowerCase();

      return (
        logDataString.includes(searchTermLower) ||
        logSummary.includes(searchTermLower)
      );
    });
  }

  filteredLogs.value = filtered || [];
}

onMounted(() => {
  filterLogs();
});

watch(
  () => logs.value,
  () => filterLogs(),
);
</script>

<style lang="scss" scoped>
.preview-logs-section {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  height: 100%;

  &__empty {
    margin: 0;
    padding: 0;

    color: $unnnic-color-neutral-clean;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
