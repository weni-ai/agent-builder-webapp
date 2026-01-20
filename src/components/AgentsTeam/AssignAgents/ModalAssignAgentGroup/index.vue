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
import { ref } from 'vue';

import { AgentGroup } from '@/store/types/Agents.types';

import AgentModalHeader from '@/components/AgentsTeam/AgentModalHeader.vue';
import ModalAssignAgentGroupStartSetup from './Group/StartSetup/index.vue';
import ModalAssignAgentGroupFlow from './Group/index.vue';

const emit = defineEmits(['update:open']);

defineProps<{
  agent: AgentGroup;
}>();

defineModel('open', {
  type: Boolean,
  required: true,
});

const isConfiguringAgentGroup = ref<boolean>(false);

function openAgentModal() {
  isConfiguringAgentGroup.value = true;
}

function closeAgentModal() {
  emit('update:open', false);
  setTimeout(() => {
    isConfiguringAgentGroup.value = false;
  }, 100);
}
</script>
