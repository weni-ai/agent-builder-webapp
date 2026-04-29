<template>
  <AgentCard
    v-bind="$attrs"
    data-testid="detail-agent-card"
    class="detail-agent-card"
    :agent="agent"
    :tags="agent.mcp?.system ? [agent.mcp.system] : []"
    :loading="loading"
    :newAgentHighlight="agent.uuid === agentsTeamStore.newAgentAssigned?.uuid"
    @click="openAgentDetailModal"
  />

  <AgentDetailModal
    v-model:open="isAgentDetailModalOpen"
    data-testid="detail-agent-modal"
    :agent="agent"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import AgentCard from '../AgentCard.vue';
import AgentDetailModal from './AgentDetailModal/index.vue';
import { ActiveTeamAgent } from '@/store/types/Agents.types';
import { useAgentsTeamStore } from '@/store/AgentsTeam';

defineOptions({ inheritAttrs: false });

const agentsTeamStore = useAgentsTeamStore();

withDefaults(
  defineProps<{
    agent: ActiveTeamAgent;
    loading?: boolean;
  }>(),
  { loading: false },
);

const isAgentDetailModalOpen = ref(false);

function openAgentDetailModal() {
  isAgentDetailModalOpen.value = true;
}
</script>

<style lang="scss" scoped>
.detail-agent-card {
  transition: border-color 0.13s ease;

  cursor: pointer;

  &:hover {
    border-color: $unnnic-color-border-emphasized;
  }
}
</style>
