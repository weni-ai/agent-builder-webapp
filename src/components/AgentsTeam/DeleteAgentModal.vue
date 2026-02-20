<template>
  <UnnnicModalDialog
    :modelValue="props.modelValue"
    data-testid="modal"
    class="modal-delete-agent"
    showCloseIcon
    icon="warning"
    iconScheme="aux-red-500"
    :title="
      $t('router.agents_team.modal_delete_agent.title', {
        agent_name: agent.name,
      })
    "
    size="sm"
    :secondaryButtonProps="{
      text: $t('router.agents_team.modal_delete_agent.cancel'),
    }"
    :primaryButtonProps="{
      text: $t('router.agents_team.modal_delete_agent.delete'),
      loading: isDeletingAgent,
      type: 'warning',
    }"
    @secondary-button-click="close"
    @primary-button-click="deleteAgent"
    @update:model-value="close"
  >
    <p
      class="modal-delete-agent__description"
      data-testid="description"
    >
      {{
        $t('router.agents_team.modal_delete_agent.description', {
          agent_name: agent.name,
        })
      }}
    </p>
  </UnnnicModalDialog>
</template>

<script setup>
import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { ref } from 'vue';

const agentsTeamStore = useAgentsTeamStore();

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  agent: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const isDeletingAgent = ref(false);

function close() {
  emit('update:modelValue', false);
}

async function deleteAgent() {
  isDeletingAgent.value = true;
  await agentsTeamStore.deleteAgent(props.agent);
  isDeletingAgent.value = false;

  close();
}
</script>

<style lang="scss" scoped>
.modal-delete-agent {
  :deep(.unnnic-modal-dialog__container__content) {
    padding-bottom: $unnnic-spacing-xs;
  }

  &__description {
    color: $unnnic-color-neutral-cloudy;

    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
