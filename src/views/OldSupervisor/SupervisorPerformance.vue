<template>
  <section class="supervisor-performance">
    <PerformanceCard
      v-for="stat in performanceStats"
      :key="stat.title"
      data-testid="performance-card"
      :title="stat.title"
      :tooltip="stat.tooltip"
      :value="stat.value"
      :scheme="stat.scheme"
      :isLoading="supervisorStore.forwardStats.status === 'loading'"
      clickable
      :clicked="supervisorStore.filters.type === stat.type"
      @click="handleCardClick(stat.type)"
    />
  </section>
</template>

<script setup>
import { onMounted, computed } from 'vue';

import { useOldSupervisorStore } from '@/store/OldSupervisor';

import PerformanceCard from './PerformanceCard.vue';
import i18n from '@/utils/plugins/i18n';

const supervisorStore = useOldSupervisorStore();
const t = (key) => i18n.global.t(key);

const performanceStats = computed(() => {
  const stats = supervisorStore.forwardStats.data;

  return [
    {
      title: t('agent_builder.supervisor.attended_by_agent.title'),
      tooltip: t('agent_builder.supervisor.attended_by_agent.tooltip'),
      value: stats.attendedByAgent,
      scheme: 'green',
      type: 'attended_by_agent',
    },
    {
      title: t('agent_builder.supervisor.forwarded_human_support.title'),
      tooltip: t('agent_builder.supervisor.forwarded_human_support.tooltip'),
      value: stats.forwardedHumanSupport,
      scheme: 'blue',
      type: 'forwarded_human_support',
    },
  ];
});

onMounted(() => {
  supervisorStore.loadForwardStats();
});

function handleCardClick(type) {
  supervisorStore.filters.type =
    supervisorStore.filters.type === type ? null : type;
}
</script>

<style lang="scss" scoped>
.supervisor-performance {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $unnnic-spacing-sm;
}
</style>
