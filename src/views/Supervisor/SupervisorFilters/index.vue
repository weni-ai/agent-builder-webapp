<template>
  <section class="supervisor-filters">
    <FilterText data-testid="filter-text" />

    <UnnnicButton
      data-testid="button-filter"
      iconLeft="filter_list"
      type="secondary"
      :text="filterButtonText"
      @click="openFilterDrawer"
    />

    <UnnnicDrawer
      data-testid="drawer-filter"
      :modelValue="isFilterDrawerOpen"
      class="supervisor-filters__drawer"
      :title="
        $t('agent_builder.supervisor.filters.filter_conversations_drawer')
      "
      :primaryButtonText="$t('agent_builder.supervisor.filters.apply_filters')"
      :disabledPrimaryButton="filterDrawerApplyButtonDisabled"
      :secondaryButtonText="
        $t('agent_builder.supervisor.filters.clear_filters')
      "
      :disabledSecondaryButton="filterDrawerClearButtonDisabled"
      @close="closeFilterDrawer"
      @primary-button-click="applyFilters"
      @secondary-button-click="clearFilters"
    >
      <template #content>
        <FilterDate data-testid="filter-date" />
        <FilterStatus data-testid="filter-status" />
        <FilterCsat data-testid="filter-csat" />
        <FilterTopics data-testid="filter-topics" />
      </template>
    </UnnnicDrawer>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { isEqual } from 'lodash';

import i18n from '@/utils/plugins/i18n';

import { useSupervisorStore } from '@/store/Supervisor';

import FilterText from './FilterText.vue';
import FilterDate from './FilterDate.vue';
import FilterStatus from './FilterStatus.vue';
import FilterCsat from './FilterCsat.vue';
import FilterTopics from './FilterTopics.vue';

const supervisorStore = useSupervisorStore();

const isFilterDrawerOpen = ref(false);
const filterDrawerApplyButtonDisabled = computed(() =>
  isEqual(supervisorStore.temporaryFilters, supervisorStore.filters),
);

const filterDrawerClearButtonDisabled = computed(() =>
  isEqual(supervisorStore.temporaryFilters, supervisorStore.defaultFilters),
);

const countAppliedFilters = computed(() => {
  const filtersToCount = ['status', 'csat', 'topics'];

  return filtersToCount.reduce((total, filter) => {
    return total + supervisorStore.filters[filter].length;
  }, 0);
});

const filterButtonText = computed(() => {
  const { t } = i18n.global;
  const count = countAppliedFilters.value;

  const text = t('agent_builder.supervisor.filters.filter_conversations');
  const countText = t(
    'agent_builder.supervisor.filters.count_applied_filters',
    count,
    {
      count,
    },
  );

  return count > 0 ? `${text} ${countText}` : text;
});

function openFilterDrawer() {
  isFilterDrawerOpen.value = true;
}

function closeFilterDrawer() {
  isFilterDrawerOpen.value = false;
}

function clearFilters() {
  supervisorStore.resetFilters();
  closeFilterDrawer();
}

function applyFilters() {
  supervisorStore.updateFilters();
  closeFilterDrawer();
}

onMounted(async () => {
  await supervisorStore.getTopics();
});
</script>

<style scoped lang="scss">
.supervisor-filters {
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: $unnnic-spacing-sm;

  &__drawer {
    :deep(.unnnic-drawer__container .unnnic-drawer__content) {
      overflow: visible;

      display: flex;
      flex-direction: column;
      gap: $unnnic-spacing-sm;
    }
  }
}
</style>
