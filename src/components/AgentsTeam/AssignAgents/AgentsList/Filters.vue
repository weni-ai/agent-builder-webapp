<template>
  <section
    :class="[
      'agents-list-filters',
      { 'agents-list-filters--custom': isSystemCustom },
    ]"
  >
    <UnnnicInput
      v-model="agentsTeamStore.assignAgentsFilters.search"
      :placeholder="$t('agents.assign_agents.filters.search.placeholder')"
      iconLeft="search"
      data-testid="search-input"
    />

    <UnnnicSelectSmart
      v-if="!isSystemCustom"
      v-model:modelValue="agentsTeamStore.assignAgentsFilters.category"
      :options="categoryOptions"
      :placeholder="$t('agents.assign_agents.filters.category.placeholder')"
      orderedByIndex
      data-testid="category-select"
    />
  </section>
</template>

<script setup>
import { debounce } from 'lodash';
import { computed, watch } from 'vue';

import i18n from '@/utils/plugins/i18n';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

const agentsTeamStore = useAgentsTeamStore();

const categoryOptions = computed(() => {
  const createCategoryOption = (category) => ({
    label: i18n.global.t(`agents.assign_agents.filters.category.${category}`),
    value: category,
  });
  return [
    { label: 'Categories', value: '' },
    createCategoryOption('product_discovery_and_recommendations'),
    createCategoryOption('orders_status_and_tracking'),
    createCategoryOption('returns_exchanges_and_cancellations'),
    createCategoryOption('payments_and_checkout'),
    createCategoryOption('crm_and_lead_capture'),
    createCategoryOption('feedback_and_surveys'),
    createCategoryOption('utilities_and_monitoring'),
    createCategoryOption('others'),
  ];
});

const isSystemCustom = computed(() => {
  return agentsTeamStore.assignAgentsFilters.system === 'ALL_CUSTOM';
});

const loadAgents = () => {
  if (isSystemCustom.value) {
    agentsTeamStore.loadMyAgents();
  } else {
    agentsTeamStore.loadOfficialAgents();
  }
};

watch(
  () => agentsTeamStore.assignAgentsFilters.search,
  debounce(loadAgents, 300),
);
watch(() => agentsTeamStore.assignAgentsFilters.category, loadAgents, {
  deep: true,
});
</script>

<style lang="scss" scoped>
.agents-list-filters {
  $select-width: calc(
    (100vw / 12) * 3 - ($unnnic-space-4 * 2)
  ); // 3fr of 12 columns based on the screen width minus the main container padding

  display: grid;
  grid-template-columns: 1fr $select-width;
  gap: $unnnic-space-4;

  &--custom {
    grid-template-columns: 1fr;
  }
}
</style>
