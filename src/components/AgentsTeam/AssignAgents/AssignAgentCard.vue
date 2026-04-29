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

  <ModalAssignAgentGroup
    v-model:open="isModalAssignAgentOpen"
    :agent="agent"
  />

  <DeleteAgentModal
    v-model="isDeleteAgentModalOpen"
    :agent="agent"
  />
</template>

<script setup>
import { computed, ref } from 'vue';

import useAgentSystems from '@/composables/useAgentSystems';

import AgentCard from '../AgentCard.vue';
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

const isAssigning = ref(false);
const isModalAssignAgentOpen = ref(false);
const isDeleteAgentModalOpen = ref(false);

const assignButtonText = computed(() => {
  return props.agent.presentation
    ? i18n.global.t('agents.assign_agents.view_details')
    : i18n.global.t('agents.assign_agents.assign_button');
});

const assignAgentHeaderActions = computed(() => [
  {
    scheme: 'feedback-critical',
    icon: 'delete',
    text: i18n.global.t('router.agents_team.card.delete_agent'),
    onClick: toggleDeleteAgentModal,
  },
]);

async function toggleDeleteAgentModal() {
  isDeleteAgentModalOpen.value = !isDeleteAgentModalOpen.value;
}

function handleAssignButton() {
  if (!props.agent.assigned) {
    isModalAssignAgentOpen.value = true;
  }
}
</script>

<style lang="scss" scoped>
.assign-agent-card__assign-button {
  width: 100%;

  display: flex;
}
</style>
