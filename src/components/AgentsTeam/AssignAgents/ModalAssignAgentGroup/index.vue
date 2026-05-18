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
          :agent="resolvedAgentDetails"
          :agentDetails="agentDetails"
          data-testid="modal-group-component"
          @update:open="closeAgentModal"
        />
      </template>
      <template v-else>
        <AgentModalHeader
          :agent="resolvedAgentDetails"
          data-testid="modal-header"
        />

        <ModalAssignAgentGroupStartSetup
          :agent="resolvedAgentDetails"
          :isLoading="isLoadingAgentDetails"
          data-testid="modal-start-component"
        />

        <UnnnicDialogFooter>
          <UnnnicButton
            :text="footerButtonText"
            :disabled="isLoadingAgentDetails"
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
import { computed, ref, watch } from 'vue';

import { useI18n } from 'vue-i18n';

import { Agent, AgentGroup } from '@/store/types/Agents.types';

import AgentModalHeader from '@/components/AgentsTeam/AgentModalHeader.vue';
import ModalAssignAgentGroupStartSetup from './Group/StartSetup/index.vue';
import ModalAssignAgentGroupFlow from './Group/index.vue';
import nexusaiAPI from '@/api/nexusaiAPI';
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
const agentDetails = ref<AgentGroup | Agent | null>(null);
const isLoadingAgentDetails = ref(false);
const resolvedAgentDetails = computed(() => agentDetails.value ?? props.agent);

const agentHasSetupSteps = computed(() => {
  const details = resolvedAgentDetails.value;

  if (details.is_official) {
    const { MCPs, systems, credentials } = details as AgentGroup;
    return (
      (MCPs?.length ?? 0) > 0 ||
      (systems?.length ?? 0) > 0 ||
      (credentials?.length ?? 0) > 0
    );
  }

  const { constants, credentials } = details as Agent;
  return (constants?.length ?? 0) > 0 || (credentials?.length ?? 0) > 0;
});

const footerButtonText = computed(() => {
  return agentHasSetupSteps.value
    ? t('agents.assign_agents.setup.start_button')
    : t('agents.assign_agents.assign_button');
});

async function fetchAgentDetails() {
  if (isLoadingAgentDetails.value || agentDetails.value) return;
  if (!props.agent.is_official) return;

  const group = (props.agent as AgentGroup).group;
  if (!group) return;

  try {
    isLoadingAgentDetails.value = true;
    const agentDetailsData =
      await nexusaiAPI.router.agents_team.getOfficialAgentDetails(group);

    agentDetails.value = {
      ...(props.agent as AgentGroup),
      ...agentDetailsData,
    };
  } finally {
    isLoadingAgentDetails.value = false;
  }
}

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
    agentDetails.value = null;
  }, 100);
}

watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      fetchAgentDetails();
    }
  },
);
</script>
