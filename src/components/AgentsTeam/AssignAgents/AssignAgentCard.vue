<template>
  <AgentCard
    :agent="agent"
    :tags="agent.systems ? getSystemsObjects(agent.systems) : []"
    data-testid="agent-card"
  >
    <template #footer>
      <UnnnicToolTip
        side="top"
        :text="$t('agents.assign_agents.already_assigned')"
        :enabled="agent.assigned"
      >
        <UnnnicButton
          class="assign-agent-card__assign-button"
          :text="$t('agents.assign_agents.assign_button')"
          :disabled="agent.assigned"
          :loading="isAssigning"
          @click="handleAssignButton"
        />
      </UnnnicToolTip>
    </template>
  </AgentCard>

  <AssignAgentDrawer
    v-model="isAssignDrawerOpen"
    :agent="agent"
    :isAssigning="isDrawerAssigning"
    @assign="toggleDrawerAssigning"
  />
</template>

<script setup>
import { ref } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { useTuningsStore } from '@/store/Tunings';

import useAgentSystems from '@/composables/useAgentSystems';

import AgentCard from '../AgentCard.vue';
import AssignAgentDrawer from '../AssignAgentDrawer.vue';

const { getSystemsObjects } = useAgentSystems();

const props = defineProps({
  agent: {
    type: Object,
    required: true,
  },
});

const agentsTeamStore = useAgentsTeamStore();
const tuningsStore = useTuningsStore();

const isAssignDrawerOpen = ref(false);
const isAssigning = ref(false);
const isDrawerAssigning = ref(false);

async function toggleDrawer() {
  isAssignDrawerOpen.value = !isAssignDrawerOpen.value;
}

async function assignAgent() {
  isAssigning.value = true;

  console.log('assignAgent', props.agent);

  try {
    const { status } = await agentsTeamStore.toggleAgentAssignment({
      uuid: props.agent.uuid,
      is_assigned: true,
    });

    if (status === 'success') {
      if (props.agent.credentials?.length)
        await tuningsStore.fetchCredentials();
    }
  } catch (error) {
    console.error(error);
  } finally {
    isAssigning.value = false;
  }
}

function handleAssignButton() {
  console.log('handleAssignButton', props.agent);
  if (!props.agent.assigned && props.agent.credentials?.length > 0) {
    toggleDrawer();
  } else {
    assignAgent();
  }
}

async function toggleDrawerAssigning() {
  isDrawerAssigning.value = true;
  await assignAgent();
  isDrawerAssigning.value = false;
  toggleDrawer();
}
</script>

<style lang="scss" scoped>
.assign-agent-card__assign-button {
  width: 100%;

  display: flex;
}
</style>
