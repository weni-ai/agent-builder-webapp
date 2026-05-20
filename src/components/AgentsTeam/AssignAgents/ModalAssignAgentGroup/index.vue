<template>
  <UnnnicDialog
    class="modal-assign-agent"
    :open="open"
    lazyMount
    data-testid="modal-assign-agent"
    @update:open="closeAgentModal"
  >
    <UnnnicDialogContent size="large">
      <template v-if="isConfiguringAgentGroup">
        <ModalAssignAgentGroupFlow
          :open="isConfiguringAgentGroup"
          :agent="agent"
          data-testid="modal-group-component"
          @update:open="closeAgentModal"
        />
      </template>
      <template v-else>
        <AgentModalHeader
          :agent="agent"
          data-testid="modal-header"
        />

        <ModalAssignAgentGroupStartSetup
          :agent="agent"
          data-testid="modal-start-component"
        />

        <UnnnicDialogFooter>
          <UnnnicButton
            :text="footerButtonText"
            :loading="isAssigning"
            data-testid="next-button"
            @click="setupAgent"
          />
        </UnnnicDialogFooter>
      </template>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useI18n } from 'vue-i18n';

import { Agent, AgentGroup } from '@/store/types/Agents.types';

import AgentModalHeader from '@/components/AgentsTeam/AgentModalHeader.vue';
import ModalAssignAgentGroupStartSetup from './Group/StartSetup/index.vue';
import ModalAssignAgentGroupFlow from './Group/index.vue';
import { useAgentsTeamStore } from '@/store/AgentsTeam';

const { t } = useI18n();

const emit = defineEmits(['update:open']);

const props = defineProps<{
  agent: AgentGroup | Agent;
}>();

const open = defineModel('open', {
  type: Boolean,
  required: true,
});

const agentsTeamStore = useAgentsTeamStore();

const isConfiguringAgentGroup = ref<boolean>(false);
const isAssigning = ref(false);

const agentHasSetupSteps = computed(() => {
  if (props.agent.is_official) {
    const { mcps } = props.agent as AgentGroup;
    return (mcps?.length ?? 0) > 0;
  }

  const { constants, credentials } = props.agent as Agent;
  return (constants?.length ?? 0) > 0 || (credentials?.length ?? 0) > 0;
});

const footerButtonText = computed(() => {
  return agentHasSetupSteps.value
    ? t('agents.assign_agents.setup.start_button')
    : t('agents.assign_agents.assign_button');
});

async function setupAgent() {
  if (!agentHasSetupSteps.value) {
    await assignAgent();
    return;
  }

  isConfiguringAgentGroup.value = true;
}

async function assignAgent() {
  isAssigning.value = true;

  try {
    if (props.agent.is_official) {
      await agentsTeamStore.toggleAgentAssignment({
        group: (props.agent as AgentGroup).group,
        is_assigned: true,
      });
    } else {
      await agentsTeamStore.toggleAgentAssignment({
        uuid: (props.agent as Agent).uuid,
        is_assigned: true,
      });
    }
    closeAgentModal();
  } finally {
    isAssigning.value = false;
  }
}

function closeAgentModal() {
  emit('update:open', false);
  setTimeout(() => {
    isConfiguringAgentGroup.value = false;
  }, 100);
}
</script>
