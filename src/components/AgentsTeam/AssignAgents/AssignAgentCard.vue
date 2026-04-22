<template>
  <AgentCard
    :agent="agent"
    :tags="agent.systems ? getSystemsObjects(agent.systems) : []"
    data-testid="agent-card"
  >
    <template
      v-if="!agent.is_official"
      #actions
    >
      <ContentItemActions
        :actions="assignAgentHeaderActions"
        minWidth="auto"
        data-testid="content-item-actions"
      />
    </template>

    <template #footer>
      <UnnnicToolTip
        side="top"
        :text="$t('agents.assign_agents.already_assigned')"
        :enabled="agent.assigned"
      >
        <UnnnicButton
          class="assign-agent-card__assign-button"
          :text="assignButtonText"
          :disabled="agent.assigned"
          :loading="isAssigning"
          @click="handleAssignButton"
        />
      </UnnnicToolTip>
    </template>
  </AgentCard>

  <AssignAgentDrawer
    v-if="isAssignDrawerOpen"
    v-model="isAssignDrawerOpen"
    :agent="agent"
    :isAssigning="isDrawerAssigning"
    @assign="toggleDrawerAssigning"
  />

  <ModalAssignAgentGroup
    v-if="isModalAssignAgentOpen"
    v-model:open="isModalAssignAgentOpen"
    :agent="agent"
  />

  <DeleteAgentModal
    v-if="isDeleteAgentModalOpen"
    v-model="isDeleteAgentModalOpen"
    :agent="agent"
  />
</template>

<script setup>
import { computed, ref } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { useTuningsStore } from '@/store/Tunings';

import useAgentSystems from '@/composables/useAgentSystems';

import AgentCard from '../AgentCard.vue';
import AssignAgentDrawer from '../AssignAgentDrawer.vue';
import ModalAssignAgentGroup from './ModalAssignAgentGroup/index.vue';
import DeleteAgentModal from '../DeleteAgentModal.vue';
import ContentItemActions from '@/components/ContentItemActions.vue';
import i18n from '@/utils/plugins/i18n';

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
const isModalAssignAgentOpen = ref(false);
const isDeleteAgentModalOpen = ref(false);

const assignButtonText = computed(() => {
  return props.agent.presentation
    ? i18n.global.t('agents.assign_agents.view_details')
    : i18n.global.t('agents.assign_agents.assign_button');
});

const assignAgentHeaderActions = computed(() => [
  {
    scheme: 'aux-red-500',
    icon: 'delete',
    text: i18n.global.t('router.agents_team.card.delete_agent'),
    onClick: toggleDeleteAgentModal,
  },
]);

async function toggleDeleteAgentModal() {
  isDeleteAgentModalOpen.value = !isDeleteAgentModalOpen.value;
}

async function toggleDrawer() {
  isAssignDrawerOpen.value = !isAssignDrawerOpen.value;
}

async function assignAgent() {
  isAssigning.value = true;

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
  if (!props.agent.assigned) {
    if (props.agent.presentation) {
      isModalAssignAgentOpen.value = true;
      return;
    }

    if (props.agent.credentials?.length > 0) {
      toggleDrawer();
      return;
    }
  }

  assignAgent();
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
