<template>
  <AgentCard
    class="detail-agent-card"
    :agent="agent"
    :tags="agent.mcp?.system ? [agent.mcp.system] : []"
    :loading="loading"
    :newAgentHighlight="agent.uuid === agentsTeamStore.newAgentAssigned?.uuid"
    @click="openAgentDetailModal"
  />

  <AgentDetailModal
    v-model:open="isAgentDetailModalOpen"
    :agent="agent"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import AgentCard from '../AgentCard.vue';
import AgentDetailModal from './AgentDetailModal/index.vue';
import { ActiveTeamAgent } from '@/store/types/Agents.types';
import { useAgentsTeamStore } from '@/store/AgentsTeam';

const agentsTeamStore = useAgentsTeamStore();

defineProps<{
  agent: ActiveTeamAgent;
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
