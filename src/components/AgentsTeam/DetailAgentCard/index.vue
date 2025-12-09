<template>
  <AgentCard
    class="detail-agent-card"
    :agent="agent"
    :tags="agent.systems ? getSystemsObjects(agent.systems) : []"
    :loading="loading"
    @click="openAgentDetailModal"
  />

  <AgentDetailModal
    v-model:open="isAgentDetailModalOpen"
    :agent="agent"
  />
</template>

<script setup>
import { ref } from 'vue';

import useAgentSystems from '@/composables/useAgentSystems';

import AgentCard from '../AgentCard.vue';
import AgentDetailModal from './AgentDetailModal/index.vue';

const { getSystemsObjects } = useAgentSystems();

defineProps({
  agent: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const isAgentDetailModalOpen = ref(false);

function openAgentDetailModal() {
  isAgentDetailModalOpen.value = true;
}
</script>

<style lang="scss" scoped>
.detail-agent-card {
  cursor: pointer;
}
</style>
