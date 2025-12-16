<template>
  <UnnnicDialog
    class="modal-assign-agent"
    :open="open"
    @update:open="closeAgentModal"
  >
    <UnnnicDialogContent>
      <template v-if="groupModalComponent">
        <component
          :is="groupModalComponent"
          :agent="agent"
          @update:open="closeAgentModal"
        />
      </template>
      <template v-else>
        <AgentModalHeader :agent="agent" />

        <UnnnicDialogFooter>
          <UnnnicButton
            text="Start Setup"
            data-testid="next-button"
            @click="openAgentModal"
          />
        </UnnnicDialogFooter>
      </template>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { Component, ref } from 'vue';

import { AgentGroup } from '@/store/types/Agents.types';

import AgentModalHeader from '@/components/AgentsTeam/AgentModalHeader.vue';
import ModalAssignConciergeContent from './Concierge/index.vue';

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
  CONCIERGE: ModalAssignConciergeContent,
};

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
