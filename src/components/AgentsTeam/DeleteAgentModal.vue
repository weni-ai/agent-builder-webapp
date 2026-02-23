<template>
  <UnnnicDialog
    data-testid="delete-agent-modal"
    :open="modelValue"
    @update:open="close"
  >
    <UnnnicDialogContent>
      <UnnnicDialogHeader type="warning">
        <UnnnicDialogTitle>
          {{
            $t('router.agents_team.modal_delete_agent.title', {
              agent_name: agent.name,
            })
          }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

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
      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            data-testid="delete-agent-cancel"
            :text="$t('router.agents_team.modal_delete_agent.cancel')"
            type="tertiary"
            @click="close"
          />
        </UnnnicDialogClose>
        <UnnnicButton
          data-testid="delete-agent-confirm"
          :text="$t('router.agents_team.modal_delete_agent.delete')"
          :loading="isDeletingAgent"
          type="warning"
          @click="deleteAgent"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup>
import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { ref } from 'vue';

const agentsTeamStore = useAgentsTeamStore();

const props = defineProps({
  agent: {
    type: Object,
    required: true,
  },
});

const modelValue = defineModel('modelValue', {
  type: Boolean,
  required: true,
});
const isDeletingAgent = ref(false);

function close() {
  modelValue.value = false;
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
  &__description {
    margin: $unnnic-space-6;

    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
