<template>
  <UnnnicDialog
    class="modal-assign-agent"
    :open="open"
    data-testid="modal-assign-agent"
    @update:open="closeAgentModal"
  >
    <UnnnicDialogContent size="large">
      <template v-if="groupModalComponent">
        <component
          :is="groupModalComponent"
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

        <component
          :is="startSetupModalComponent"
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
import { Component, computed, ref } from 'vue';

import { AgentGroup } from '@/store/types/Agents.types';

import AgentModalHeader from '@/components/AgentsTeam/AgentModalHeader.vue';
import ModalAssignConciergeStartSetup from './Concierge/StartSetup/index.vue';
import ModalAssignConcierge from './Concierge/index.vue';

const emit = defineEmits(['update:open']);

const props = defineProps<{
  agent: AgentGroup;
}>();

defineModel('open', {
  type: Boolean,
  required: true,
});

const groupModalComponent = ref<Component | null>(null);

const MODAL_GROUPS_MAP = {
  CONCIERGE: ModalAssignConcierge,
};
const MODAL_START_SETUP_MAP = {
  CONCIERGE: ModalAssignConciergeStartSetup,
};

const startSetupModalComponent = computed(() => {
  return MODAL_START_SETUP_MAP[props.agent.group?.toUpperCase() || ''];
});

function openAgentModal() {
  groupModalComponent.value = MODAL_GROUPS_MAP[props.agent.group.toUpperCase()];
}

function closeAgentModal() {
  emit('update:open', false);
  setTimeout(() => {
    groupModalComponent.value = null;
  }, 100);
}
</script>
