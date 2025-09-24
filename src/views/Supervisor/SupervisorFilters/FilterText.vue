<template>
  <UnnnicInput
    v-model="search"
    iconLeft="search"
    data-testid="search-input"
    :placeholder="$t('agent_builder.supervisor.search')"
  />
</template>

<script setup>
import { ref, watch } from 'vue';
import { debounce } from 'lodash';

import { useSupervisorStore } from '@/store/Supervisor';

const supervisorStore = useSupervisorStore();

const search = ref(supervisorStore.filters.search);

watch(
  () => search.value,
  debounce(() => {
    supervisorStore.filters.search = search.value;
  }, 300),
);
</script>
