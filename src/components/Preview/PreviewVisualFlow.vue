<template>
  <section
    ref="visualFlowRef"
    class="visual-flow"
    data-testid="visual-flow"
  >
    <PreviewAgentCard
      ref="managerRef"
      data-testid="visual-flow-manager"
      name="Manager"
      :active="isActiveAgent(manager)"
      :currentTask="
        isActiveAgent(manager) ? activeAgent?.currentTask : 'Standby'
      "
      type="manager"
      bubbleDirection="bounce"
    />

    <BranchLines
      class="visual-flow__line"
      data-testid="visual-flow-branch-lines"
      :positions="branchPositions"
      width="25"
      :height="visualFlowHeight"
      :startY="managerRef?.$el.getBoundingClientRect().height"
      :coloredLineIndex="
        teamAgents?.findIndex((agent) => agent.id === activeAgent?.id)
      "
    />

    <section
      class="visual-flow__team"
      data-testid="visual-flow-team"
    >
      <PreviewAgentCard
        v-for="(agent, index) in teamAgents"
        :key="agent.id"
        :ref="(el) => (agentRefs[index] = el)"
        data-testid="visual-flow-agent"
        :name="agent.name"
        :icon="agent.icon"
        :active="isActiveAgent(agent)"
        :bubbleDirection="index % 2 === 0 ? 'left' : 'right'"
        :currentTask="
          isActiveAgent(agent) ? activeAgent?.currentTask : 'Standby'
        "
        type="agent"
      />
    </section>
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { usePreviewStore } from '@/store/Preview';

import BranchLines from './BranchLines.vue';
import PreviewAgentCard from './PreviewAgentCard.vue';

const agentsTeamStore = useAgentsTeamStore();
const previewStore = usePreviewStore();

const teamAgents = computed(() => agentsTeamStore.activeTeam.data?.agents);
const manager = computed(() => agentsTeamStore.activeTeam.data?.manager);
const activeAgent = computed(() => previewStore.activeAgent);

const managerRef = ref(null);
const agentRefs = ref([]);

const branchPositions = computed(() => {
  if (!managerRef.value || agentRefs.value.length === 0) return [];

  const positions = [];
  const managerEl = managerRef.value.$el;
  const managerRect = managerEl.getBoundingClientRect();

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  visualFlowHeight.value; // Only access to ensure reactivity

  agentRefs.value.forEach((agentRef, index) => {
    if (!agentRef) return;

    const agentEl = agentRef.$el;
    const agentRect = agentEl.getBoundingClientRect();

    const startY = 0;
    const endY = agentRect.top - managerRect.bottom + agentRect.height / 2;

    positions.push({
      startY,
      endY,
      isLeft: index % 2 === 0,
    });
  });
  return positions;
});

function isActiveAgent(agent) {
  return agent?.id === activeAgent.value?.id;
}

const visualFlowHeight = ref(0);
const visualFlowRef = ref(null);

watch(
  () => activeAgent.value,
  () => {
    nextTick(() => {
      visualFlowHeight.value =
        visualFlowRef.value?.getBoundingClientRect().height;
    });
  },
  { immediate: true, deep: true },
);
</script>

<style lang="scss" scoped>
.visual-flow {
  display: flex;
  flex-direction: column;
  position: relative;

  gap: $unnnic-spacing-md;

  &__team {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 0.5fr));
    gap: $unnnic-spacing-md;
    width: 100%;
  }
}
</style>
