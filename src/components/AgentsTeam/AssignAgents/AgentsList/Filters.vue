<template>
  <section class="agents-list-filters">
    <UnnnicInput
      v-model="search"
      :placeholder="$t('agents.assign_agents.filters.search.placeholder')"
      iconLeft="search"
    />
  </section>
</template>

<script setup>
import { debounce } from 'lodash';
import { ref, watch } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

const agentsTeamStore = useAgentsTeamStore();

const search = ref('');

const debouncedSearch = (callback) => debounce(callback, 300);
watch(
  () => search.value,
  debouncedSearch(async (search) => {
    await agentsTeamStore.loadOfficialAgents({ search });
  }),
);
</script>

<style lang="scss" scoped>
.agents-list-filters {
  display: flex;
  flex-direction: column;
}
</style>
