<template>
  <section
    data-testid="assign-agent-card"
    :class="[
      'assign-agent-card',
      { 'assign-agent-card--assignment': assignment && !loading },
    ]"
  >
    <AssignAgentCardSkeleton
      v-if="loading"
      data-testid="assign-agent-card-skeleton"
    />

    <section
      v-else
      class="assign-agent-card__content"
    >
      <AgentIcon
        v-if="agent.icon"
        :icon="agent.icon"
        class="assign-agent-card__icon"
        data-testid="agent-icon"
      />

      <header class="assign-agent-card__header">
        <UnnnicIntelligenceText
          tag="p"
          family="secondary"
          size="body-gt"
          color="neutral-darkest"
          weight="bold"
          data-testid="title"
        >
          {{ agent.name }}
        </UnnnicIntelligenceText>

        <section
          v-if="shouldShowActions"
          class="assign-agent-card__actions"
          data-testid="assign-agent-card-actions"
        >
          <UnnnicIconLoading
            v-if="isToggleAgentAssignmentLoading"
            size="avatar-nano"
            class="assign-agent-card__action"
            data-testid="loading-icon"
          />

          <section
            v-if="!isToggleAgentAssignmentLoading"
            class="assign-agent-card__action"
            data-testid="content-item-actions-content"
          >
            <ContentItemActions
              :actions="assignAgentHeaderActions"
              minWidth="auto"
              data-testid="content-item-actions"
            />
          </section>
        </section>

        <UnnnicTag
          v-if="isAgentInTeam"
          class="assign-agent-card__tag"
          size="small"
          :text="
            agent.is_official
              ? $t('router.agents_team.card.official')
              : $t('router.agents_team.card.custom')
          "
          :scheme="agent.is_official ? 'weni' : 'aux-purple'"
          data-testid="agent-tag"
        />
      </header>

      <section class="assign-agent-card__infos">
        <p
          v-if="agent.description"
          class="assign-agent-card__description"
          :title="agent.description"
          data-testid="description"
        >
          {{ agent.description }}
        </p>

        <section class="assign-agent-card__skills">
          <Skill
            v-for="skill in agent.skills"
            :key="skill.name"
            :title="skill.name"
            :icon="skill.icon"
            data-testid="skill"
          />
        </section>
      </section>
    </section>

    <UnnnicButton
      v-if="!loading && assignment"
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
  </section>

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

import AssignAgentCardSkeleton from './AssignAgentCardSkeleton.vue';
import AssignAgentDrawer from './AssignAgentDrawer.vue';
import ContentItemActions from '@/components/ContentItemActions.vue';
import Skill from './Skill.vue';
import AgentIcon from './AgentIcon.vue';
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
  border-radius: $unnnic-radius-4;
  border: $unnnic-border-width-thinner solid $unnnic-color-border-base;

  padding: $unnnic-spacing-sm;

  display: grid;
  gap: $unnnic-space-4;

  &--assignment {
    grid-template-rows: 1fr auto;
  }

  &__content {
    display: grid;
    grid-template-columns: auto repeat(3, 1fr);
    grid-template-rows: auto 1fr;
    gap: $unnnic-space-2;

    .assign-agent-card__icon {
      width: $unnnic-icon-size-xl;
      height: auto;
      aspect-ratio: 1/1;

      grid-column: 1 / 2;
      grid-row: 1 / 2;
      align-self: center;
    }

    .assign-agent-card__header {
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: $unnnic-spacing-xs;
      row-gap: $unnnic-space-05;
      align-content: center;

      grid-column: 2 / 5;
      grid-row: 1 / 2;

      .assign-agent-card__tag {
        grid-row: 2 / 3;
      }

      .assign-agent-card__actions {
        display: flex;
        justify-content: space-between;
        align-items: center;

        grid-column: 2 / 3;
        grid-row: 1 / 2;

        .assign-agent-card__action {
          display: flex;
          margin-left: auto;
        }
      }
    }

    .assign-agent-card__infos {
      display: flex;
      flex-direction: column;
      gap: $unnnic-space-2;

      grid-column: 1 / 5;

      .assign-agent-card__description {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;

        color: $unnnic-color-fg-base;
        font: $unnnic-font-body;
      }

      .assign-agent-card__skills {
        display: flex;
        gap: $unnnic-spacing-nano;
        flex-wrap: wrap;
      }
    }
  }

  :deep(.unnnic-button).assign-agent-card__button {
    &--assigned {
      color: $unnnic-color-weni-600;
    }

    [class*='icon'] {
      color: $unnnic-color-weni-600;
    }
  }
}
</style>
