<template>
  <UnnnicDialog
    class="modal-assign-agent"
    :open="open"
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
            :text="$t('agents.assign_agents.setup.start_button')"
            data-testid="next-button"
            @click="openAgentModal"
          />
        </UnnnicDialogFooter>
      </template>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { AgentGroup } from '@/store/types/Agents.types';

import AgentModalHeader from '@/components/AgentsTeam/AgentModalHeader.vue';
import ModalAssignAgentGroupStartSetup from './Group/StartSetup/index.vue';
import ModalAssignAgentGroupFlow from './Group/index.vue';
import nexusaiAPI from '@/api/nexusaiAPI';

const emit = defineEmits(['update:open']);

const props = defineProps<{
  agent: AgentGroup;
}>();

const open = defineModel('open', {
  type: Boolean,
  required: true,
});

const isConfiguringAgentGroup = ref<boolean>(false);
const agentDetails = ref<AgentGroup | null>(null);
const isLoadingAgentDetails = ref(false);
const resolvedAgentDetails = computed(() => agentDetails.value ?? props.agent);

async function fetchAgentDetails() {
  if (isLoadingAgentDetails.value || agentDetails.value) return;

  try {
    isLoadingAgentDetails.value = true;
    const agentDetailsData =
      await nexusaiAPI.router.agents_team.getOfficialAgentDetails(
        props.agent.group,
      );
    agentDetails.value = { ...props.agent, ...agentDetailsData };
  } finally {
    isLoadingAgentDetails.value = false;
  }
}

function openAgentModal() {
  isConfiguringAgentGroup.value = true;
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
  { immediate: true },
);
</script>
