<template>
  <AgentCard
    class="assign-agent-card"
    :agent="agent"
    :tags="agent.skills"
    :assignment="assignment"
    :loading="loading"
    @agent-assigned="emit('agent-assigned')"
  >
    <template
      v-if="shouldShowActions"
      #actions
    >
      <UnnnicIconLoading
        v-if="isToggleAgentAssignmentLoading"
        size="avatar-nano"
        class="agent-card__action"
        data-testid="loading-icon"
      />
      <!-- v-show used instead of v-else to prevent ContentItemActions popover rendering error -->
      <section
        v-show="!isToggleAgentAssignmentLoading"
        class="agent-card__action"
        data-testid="content-item-actions-content"
      >
        <ContentItemActions
          :actions="assignAgentHeaderActions"
          minWidth="auto"
          data-testid="content-item-actions"
        />
      </section>
    </template>
    <template
      v-if="assignment"
      #footer
    >
      <UnnnicButton
        :class="[
          'assign-agent-card__button',
          { 'assign-agent-card__button--assigned': agent.assigned },
        ]"
        :text="
          agent.assigned
            ? $t('router.agents_team.card.assigned')
            : $t('router.agents_team.card.assign')
        "
        :type="agent.assigned ? 'secondary' : 'primary'"
        :iconLeft="agent.assigned ? 'check' : ''"
        size="small"
        :loading="isAssigning"
        data-testid="assign-button"
        @click="
          !agent.assigned && agent.credentials?.length > 0
            ? toggleDrawer()
            : toggleAgentAssignment()
        "
      />
    </template>
  </AgentCard>

  <AssignAgentDrawer
    v-model="isAssignDrawerOpen"
    :agent="agent"
    :isAssigning="isDrawerAssigning"
    @assign="toggleDrawerAssigning"
  />

  <DeleteAgentModal
    v-model="isDeleteAgentModalOpen"
    :agent="agent"
  />
</template>

<script setup>
import { computed, ref } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { useTuningsStore } from '@/store/Tunings';

import i18n from '@/utils/plugins/i18n';

import AgentCard from './AgentCard.vue';
import AssignAgentDrawer from './AssignAgentDrawer.vue';
import ContentItemActions from '@/components/ContentItemActions.vue';
import DeleteAgentModal from './DeleteAgentModal.vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  agent: {
    type: Object,
    default: () => ({}),
  },
  assignment: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['agent-assigned']);

const agentsTeamStore = useAgentsTeamStore();

const isAssignDrawerOpen = ref(false);
const isAssigning = ref(false);
const isDrawerAssigning = ref(false);
const isToggleAgentAssignmentLoading = ref(false);
const isDeleteAgentModalOpen = ref(false);

const tuningsStore = useTuningsStore();

const isAgentInTeam = computed(() => {
  return agentsTeamStore.activeTeam.data.agents.some(
    (agent) => agent.uuid === props.agent.uuid,
  );
});

const assignAgentHeaderActions = computed(() => [
  isAgentInTeam.value
    ? {
        scheme: 'aux-red-500',
        icon: 'delete',
        text: i18n.global.t('router.agents_team.card.remove_agent'),
        onClick: toggleAgentAssignment,
      }
    : {
        scheme: 'aux-red-500',
        icon: 'delete',
        text: i18n.global.t('router.agents_team.card.delete_agent'),
        onClick: toggleDeleteAgentModal,
      },
]);

const shouldShowActions = computed(() => {
  const { assignment, agent } = props;

  return (assignment && !agent.assigned && !agent.is_official) || !assignment;
});

async function toggleDrawer() {
  isAssignDrawerOpen.value = !isAssignDrawerOpen.value;
}

async function assignAgent() {
  const isAssigned = props.assignment ? !props.agent.assigned : false;
  try {
    isToggleAgentAssignmentLoading.value = true;

    const { status } = await agentsTeamStore.toggleAgentAssignment({
      uuid: props.agent.uuid,
      is_assigned: isAssigned,
    });

    if (status === 'success') {
      if (isAssigned) emit('agent-assigned');
      if (props.agent.credentials?.length || !props.assignment)
        await tuningsStore.fetchCredentials();
    }
  } catch (error) {
    console.error(error);
  } finally {
    isToggleAgentAssignmentLoading.value = false;
  }
}

async function toggleDeleteAgentModal() {
  isDeleteAgentModalOpen.value = !isDeleteAgentModalOpen.value;
}

async function toggleAgentAssignment() {
  isAssigning.value = true;
  await assignAgent();
  isAssigning.value = false;
}

async function toggleDrawerAssigning() {
  isDrawerAssigning.value = true;
  await assignAgent();
  isDrawerAssigning.value = false;
  toggleDrawer();
}
</script>

<style lang="scss" scoped>
.assign-agent-card {
  &__button--assigned {
    color: $unnnic-color-weni-600;

    :deep([class*='icon']) {
      color: $unnnic-color-weni-600;
    }
  }
}
</style>
