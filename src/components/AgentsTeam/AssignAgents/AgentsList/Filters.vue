<template>
  <section class="agents-list-filters">
    <UnnnicInput
      v-model="agentsTeamStore.assignAgentsFilters.search"
      :placeholder="$t('agents.assign_agents.filters.search.placeholder')"
      iconLeft="search"
      data-testid="search-input"
    />

    <UnnnicSelectSmart
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

watch(
  () => agentsTeamStore.assignAgentsFilters.search,
  debounce(agentsTeamStore.loadOfficialAgents, 300),
);
watch(
  () => agentsTeamStore.assignAgentsFilters.category,
  agentsTeamStore.loadOfficialAgents,
  {
    deep: true,
  },
);
</script>

<style lang="scss" scoped>
.agents-list-filters {
  display: grid;
  grid-template-columns: 1fr calc((100vw / 12) * 3 - ($unnnic-space-4 * 2));
  gap: $unnnic-space-4;
}
</style>
