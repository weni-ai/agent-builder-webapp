<template>
  <AgentCard
    class="detail-agent-card"
    :agent="agent"
    :tags="getSystemsObjects((agent as AgentGroup).systems || [])"
    :loading="loading"
    @click="openAgentDetailModal"
  />

  <AgentDetailModal
    v-model:open="isAgentDetailModalOpen"
    :agent="agent"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import useAgentSystems from '@/composables/useAgentSystems';

import AgentCard from '../AgentCard.vue';
import AgentDetailModal from './AgentDetailModal/index.vue';
import { AgentGroup, AgentGroupOrAgent } from '@/store/types/Agents.types';

const { getSystemsObjects } = useAgentSystems();

defineProps<{
  agent: AgentGroupOrAgent;
  loading: boolean;
}>();

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
